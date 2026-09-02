import { execFileSync } from "node:child_process";
import {
  accessSync,
  constants,
} from "node:fs";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import ts from "typescript";
import { deduplicateScreenshots } from "../medal-importer/dedupe.mjs";
import { loadCharacterMaster } from "./character-master.mjs";
import {
  addScoutToIndex,
  automaticStartAt,
  calculateScoutRates,
  decimalDisplay,
  extractCharacterRows,
  extractScoutName,
  mergeCharacterRows,
  naturalImageCompare,
  normalizeText,
  parseDateOverride,
  renderScoutModule,
  scoutVariableName,
  slugify,
  validateOrderedScreenshotOcr,
  validateScoutDraft,
} from "./core.mjs";
import { compareDecimal, decimalToString } from "./decimal.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const inputDir = path.join(importerDir, "input");
const ocrPath = path.join(importerDir, "ocr.swift");
const characterDir = path.join(projectDir, "src/data/characters");
const scoutDataDir = path.join(projectDir, "src/data/scouts");
const scoutIndexPath = path.join(scoutDataDir, "index.ts");

function usage() {
  return `Scout Importer V1

Usage:
  npm run scouts:import -- --dry-run [options]
  npm run scouts:import -- [options]

Options:
  --featured-character-id <id>  ScoutBanner.featuredCharacterId (prompted in a TTY)
  --start-at <date>             Override automatic 14:00 JST start
  --name <name>                 Override OCR Scout name after visual review
  --end-at <date>               Override OCR end date after visual review
  --id <id>                     Override generated lowercase kebab-case ID
  --character-map <ocr=id>      Explicitly resolve one reviewed OCR name (repeatable)
  --dry-run                     Validate and print without writing any files
  --help                        Show this help
`;
}

function parseArgs(argv) {
  const options = { dryRun: false, characterMaps: [] };
  const valueOptions = new Map([
    ["--featured-character-id", "featuredCharacterId"],
    ["--start-at", "startAt"],
    ["--name", "name"],
    ["--end-at", "endAt"],
    ["--id", "id"],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (argument === "--character-map") {
      const value = argv[++index];
      if (!value) throw new Error("--character-map requires OCR_TEXT=character-id");
      options.characterMaps.push(value);
    } else if (valueOptions.has(argument)) {
      const value = argv[++index];
      if (!value) throw new Error(`${argument} requires a value`);
      options[valueOptions.get(argument)] = value;
    } else {
      throw new Error(`Unknown option: ${argument}\n\n${usage()}`);
    }
  }
  return options;
}

function requireCommand(command, fallbackPaths = []) {
  try {
    return execFileSync("/usr/bin/env", ["which", command], {
      encoding: "utf8",
    }).trim();
  } catch {
    for (const fallback of fallbackPaths) {
      try {
        accessSync(fallback, constants.X_OK);
        return fallback;
      } catch {
        // Try the next standard installation path.
      }
    }
  }
  throw new Error(`Required command not found: ${command}`);
}

function run(command, args) {
  return execFileSync(command, args, {
    cwd: projectDir,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}

function imageSignature(magickCommand, filePath) {
  return run(magickCommand, [filePath, "-format", "%#", "info:"]);
}

function imageDimensions(magickCommand, filePath) {
  const [width, height] = run(magickCommand, [
    "identify",
    "-format",
    "%w %h",
    filePath,
  ]).split(/\s+/).map(Number);
  return { width, height };
}

async function promptFeaturedCharacterId() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "--featured-character-id is required when the importer is not running interactively",
    );
  }
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await readline.question("ScoutBanner featured character ID: ")).trim();
  } finally {
    readline.close();
  }
}

function manualMappings(values, characterMaster) {
  const mappings = new Map();
  for (const value of values) {
    const separator = value.lastIndexOf("=");
    if (separator <= 0 || separator === value.length - 1) {
      throw new Error(`Invalid --character-map ${value}; expected OCR_TEXT=character-id`);
    }
    const source = normalizeText(value.slice(0, separator));
    const id = value.slice(separator + 1).trim();
    if (!characterMaster.byId.has(id)) {
      throw new Error(`--character-map target does not exist in character master: ${id}`);
    }
    if (mappings.has(source) && mappings.get(source) !== id) {
      throw new Error(`Conflicting --character-map entries for ${value.slice(0, separator)}`);
    }
    mappings.set(source, id);
  }
  return mappings;
}

function assertTypeScript(source, fileName) {
  const result = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
  });
  const errors = (result.diagnostics ?? []).filter(
    ({ category }) => category === ts.DiagnosticCategory.Error,
  );
  if (errors.length > 0) {
    throw new Error(
      `${fileName}: generated TypeScript is invalid\n${errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n")).join("\n")}`,
    );
  }
}

async function existingScoutIds() {
  const ids = new Map();
  for (const file of (await readdir(scoutDataDir)).filter((name) => name.endsWith(".ts"))) {
    const source = await readFile(path.join(scoutDataDir, file), "utf8");
    for (const match of source.matchAll(/\bid:\s*["']([^"']+)["']/g)) {
      ids.set(match[1], file);
    }
  }
  return ids;
}

function bannerLocation(featuredCharacter, id) {
  const subdirectory = ["ex", "bf"].includes(featuredCharacter.grade)
    ? featuredCharacter.grade
    : null;
  const relative = subdirectory
    ? path.join("scouts", subdirectory, `${id}.webp`)
    : path.join("scouts", `${id}.webp`);
  return {
    productionPath: path.join(projectDir, "public", relative),
    publicPath: `/${relative.split(path.sep).join("/")}`,
  };
}

function printCharacterIssues(issues) {
  for (const issue of issues) {
    console.error(`  - ${issue.code}: ${issue.file ?? "<input>"}: ${issue.message}`);
    if (issue.phrases?.length) console.error(`    OCR candidates: ${issue.phrases.join(" | ")}`);
    if (issue.suggestions?.length) {
      console.error(
        `    suggestions only (not selected): ${issue.suggestions.map(({ id }) => id).join(", ")}`,
      );
    }
  }
}

function printSummary(draft, outputDataPath, outputBannerPath, indexPath, banner) {
  const calculation = draft.rateCalculation;
  console.log("\nScout Importer V1 review");
  console.log(`Scout Name: ${draft.name ?? "<missing>"}`);
  console.log(`Start: ${draft.startAt}`);
  console.log(`End: ${draft.endAt ?? "<missing>"}`);
  console.log(
    `Featured Character: ${draft.featuredCharacter ? `${draft.featuredCharacter.id} (${draft.featuredCharacter.name})` : "<missing>"}`,
  );
  console.log("Pickups:");
  if (draft.pickups.length === 0) console.log("  <none>");
  for (const pickup of draft.pickups) {
    console.log(`  ${pickup.characterId}: ${decimalToString(pickup.rate)}%`);
  }
  console.log(`★4 total: ${decimalDisplay(draft.totalFourStarRate)}%`);
  console.log(`BF unit rate: ${decimalDisplay(draft.bfUnitRate)}%`);
  console.log(`BF count: ${calculation?.bfCount ?? "<unavailable>"}`);
  console.log(`Calculated BF: ${decimalDisplay(calculation?.bfTotal)}%`);
  console.log(`Calculated star-4: ${decimalDisplay(calculation?.star4)}%`);
  console.log(`★3: ${decimalDisplay(draft.threeStarRate)}%`);
  console.log(`★2: ${decimalDisplay(draft.twoStarRate)}%`);
  console.log(`Banner source: ${banner.file} (${banner.width}x${banner.height}, no crop)`);
  console.log("Planned output files:");
  console.log(`  ${path.relative(projectDir, outputDataPath)}`);
  console.log(`  ${path.relative(projectDir, outputBannerPath)}`);
  console.log(`  ${path.relative(projectDir, indexPath)} (register Scout)`);
  if (draft.characterIssues.length > 0) {
    console.error("Character review required:");
    printCharacterIssues(draft.characterIssues);
  }
}

async function publish({
  magickCommand,
  topPath,
  bannerDimensions,
  dataPath,
  bannerPath,
  indexPath,
  moduleSource,
  indexSource,
}) {
  const temporaryRoot = path.join(importerDir, ".tmp");
  await mkdir(temporaryRoot, { recursive: true });
  const stageDir = await mkdtemp(path.join(temporaryRoot, "import-"));
  const stagedData = path.join(stageDir, path.basename(dataPath));
  const stagedBanner = path.join(stageDir, path.basename(bannerPath));
  const stagedIndex = path.join(stageDir, "index.ts");
  const published = [];
  try {
    await writeFile(stagedData, moduleSource);
    await writeFile(stagedIndex, indexSource);
    run(magickCommand, [
      topPath,
      "-strip",
      "-quality",
      "90",
      stagedBanner,
    ]);
    const metadata = run(magickCommand, [
      "identify",
      "-format",
      "%m %w %h",
      stagedBanner,
    ]);
    if (metadata !== `WEBP ${bannerDimensions.width} ${bannerDimensions.height}`) {
      throw new Error(`Staged banner validation failed: ${metadata}`);
    }

    await mkdir(path.dirname(bannerPath), { recursive: true });
    await copyFile(stagedBanner, bannerPath, constants.COPYFILE_EXCL);
    published.push(bannerPath);
    await copyFile(stagedData, dataPath, constants.COPYFILE_EXCL);
    published.push(dataPath);
    await rename(stagedIndex, indexPath);
  } catch (error) {
    await Promise.all(published.map((file) => rm(file, { force: true })));
    throw error;
  } finally {
    await rm(stageDir, { recursive: true, force: true });
  }
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  console.log(usage());
  process.exit(0);
}

const magickCommand = requireCommand("magick", [
  "/opt/homebrew/bin/magick",
  "/usr/local/bin/magick",
]);
const swiftCommand = requireCommand("swift", ["/usr/bin/swift"]);
const characterMaster = await loadCharacterMaster(characterDir);
const featuredCharacterId = options.featuredCharacterId ?? await promptFeaturedCharacterId();
const featuredCharacter = characterMaster.byId.get(featuredCharacterId) ?? null;
const mappings = manualMappings(options.characterMaps, characterMaster);
const startAt = options.startAt
  ? parseDateOverride(options.startAt, "startAt")
  : automaticStartAt();

accessSync(inputDir, constants.R_OK);
const discovered = (await readdir(inputDir))
  .filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file))
  .sort(naturalImageCompare)
  .map((file) => ({
    file,
    path: path.join(inputDir, file),
    signature: imageSignature(magickCommand, path.join(inputDir, file)),
  }));
if (discovered.length === 0) {
  throw new Error(`No screenshots found in ${path.relative(projectDir, inputDir)}`);
}
const deduplicated = deduplicateScreenshots(discovered);
if (deduplicated.skipped.length > 0) {
  throw new Error(
    `Positional input contains duplicate images; remove the duplicates instead of shifting slots:\n${deduplicated.skipped
      .map(({ item, duplicateOf }) => `  ${item.file} = ${duplicateOf.file}`)
      .join("\n")}`,
  );
}
if (discovered.length < 4) {
  throw new Error("Scout Importer V1 needs at least four screenshots in natural filename order");
}

const ocrResults = JSON.parse(
  run(swiftCommand, [ocrPath, ...discovered.map(({ path: filePath }) => filePath)]),
);
const ocrByFile = new Map(ocrResults.map((ocr) => [ocr.file, ocr]));
const orderedInputs = discovered.map((input, index) => {
  const ocr = ocrByFile.get(input.file);
  if (!ocr) throw new Error(`OCR returned no result for ${input.file}`);
  const role = index === 0
    ? "banner"
    : index === 1
      ? "period"
      : index === 2
        ? "rates"
        : "character-rates";
  return { ...input, ocr, role };
});
for (const [index, input] of orderedInputs.entries()) {
  console.log(`${index + 1}. ${input.file}: ${input.role}`);
}
const [banner, periodScreen, rateScreen, ...characterScreens] = orderedInputs;
const orderedValidation = validateOrderedScreenshotOcr({
  periodScreen,
  rateScreen,
  characterScreens,
  startAt,
  endAtOverride: options.endAt,
});
if (orderedValidation.issues.length > 0) {
  throw new Error(
    `Input order/OCR validation requires review:\n${orderedValidation.issues
      .map((issue) => `  - ${issue}`)
      .join("\n")}`,
  );
}

const rateSummary = orderedValidation.rateSummary;
const bannerName = extractScoutName(banner.ocr);
const periodName = extractScoutName(periodScreen.ocr);
const extractedName = bannerName.name ? bannerName : periodName;
const name = options.name ?? extractedName.name;
const endAt = options.endAt
  ? parseDateOverride(options.endAt, "endAt", 59)
  : orderedValidation.endAt;
const extractedRows = extractCharacterRows(
  characterScreens.map(({ file, ocr }) => ({ file, lines: ocr.lines })),
  characterMaster.characters,
  { manualMappings: mappings },
);
const mergedRows = mergeCharacterRows(extractedRows.rows);
const rows = mergedRows.rows;
const pickups = rows
  .filter(({ featured }) => featured)
  .map(({ character, rate }) => ({ characterId: character.id, rate }));
const normalBfRows = rows.filter(
  ({ featured, character }) => !featured && character.grade === "bf",
);
let bfUnitRate = normalBfRows[0]?.rate ?? null;
const characterIssues = [
  ...extractedRows.issues.filter((issue) => issue.featured !== false),
  ...mergedRows.issues,
];
if (normalBfRows.length === 0) {
  characterIssues.push({
    code: "missing-normal-bf-rate",
    message: "No non-featured grade=bf character and rate were resolved",
  });
} else {
  for (const row of normalBfRows.slice(1)) {
    if (compareDecimal(row.rate, bfUnitRate) !== 0) {
      characterIssues.push({
        code: "normal-bf-rate-mismatch",
        message: `Normal BF rates differ: ${decimalToString(bfUnitRate)}% and ${decimalToString(row.rate)}%`,
        file: row.sourceFile,
      });
      bfUnitRate = null;
      break;
    }
  }
}

const id = options.id ?? (name ? slugify(name) : "unresolved-scout");
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  throw new Error(`Scout id must be lowercase kebab-case: ${id}`);
}
const variableName = scoutVariableName(id);
const location = featuredCharacter
  ? bannerLocation(featuredCharacter, id)
  : { productionPath: path.join(projectDir, "public/scouts", `${id}.webp`), publicPath: `/scouts/${id}.webp` };
const dataPath = path.join(scoutDataDir, `${id}.ts`);
const dimensions = imageDimensions(magickCommand, banner.path);
if (dimensions.width <= 0 || dimensions.height <= 0) {
  throw new Error(`${banner.file}: banner image has invalid dimensions`);
}

const hasRequiredRates = rateSummary.fourStar && rateSummary.threeStar && rateSummary.twoStar && bfUnitRate;
const rateCalculation = hasRequiredRates
  ? calculateScoutRates({
      totalFourStarRate: rateSummary.fourStar,
      threeStarRate: rateSummary.threeStar,
      twoStarRate: rateSummary.twoStar,
      pickups,
      bfUnitRate,
      characters: characterMaster.characters,
    })
  : null;
const draft = {
  id,
  variableName,
  name,
  startAt,
  endAt,
  featuredCharacter,
  pickups,
  totalFourStarRate: rateSummary.fourStar,
  threeStarRate: rateSummary.threeStar,
  twoStarRate: rateSummary.twoStar,
  bfUnitRate,
  rateCalculation,
  characterIssues,
  bannerPublicPath: location.publicPath,
};
const validationIssues = validateScoutDraft(draft);
const ids = await existingScoutIds();
if (ids.has(id)) validationIssues.push(`Scout id ${id} already exists in ${ids.get(id)}`);
try {
  accessSync(dataPath, constants.F_OK);
  validationIssues.push(`Output data file already exists: ${path.relative(projectDir, dataPath)}`);
} catch {
  // Expected for a new Scout.
}
try {
  accessSync(location.productionPath, constants.F_OK);
  validationIssues.push(`Output banner already exists: ${path.relative(projectDir, location.productionPath)}`);
} catch {
  // Expected for a new Scout.
}

printSummary(
  draft,
  dataPath,
  location.productionPath,
  scoutIndexPath,
  { file: banner.file, ...dimensions },
);
if (validationIssues.length > 0) {
  console.error("\nValidation failed:");
  for (const issue of validationIssues) console.error(`  - ${issue}`);
  process.exitCode = 1;
} else if (options.dryRun) {
  console.log("\nDry run complete. No files were written.");
} else {
  const moduleSource = renderScoutModule(draft);
  const currentIndex = await readFile(scoutIndexPath, "utf8");
  const nextIndex = addScoutToIndex(currentIndex, variableName, id);
  assertTypeScript(moduleSource, path.basename(dataPath));
  assertTypeScript(nextIndex, "index.ts");
  await publish({
    magickCommand,
    topPath: banner.path,
    bannerDimensions: dimensions,
    dataPath,
    bannerPath: location.productionPath,
    indexPath: scoutIndexPath,
    moduleSource,
    indexSource: nextIndex,
  });
  console.log("\nImport complete.");
  console.log(`Created ${path.relative(projectDir, dataPath)}`);
  console.log(`Created ${path.relative(projectDir, location.productionPath)}`);
  console.log(`Registered ${variableName} in ${path.relative(projectDir, scoutIndexPath)}`);
}
