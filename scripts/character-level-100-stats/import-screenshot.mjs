import { accessSync, constants } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { characters } from "../../src/data/characters/index.ts";
import {
  buildCharacterStatsScreenshotDraft,
  createCharacterNameMatcher,
} from "./screenshot-importer.mjs";
import {
  maxLevelPreviewTemplate,
  resolveTemplateCrops,
} from "./screenshot-template.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "../..");
const defaultDraftPath = join(scriptDir, "draft-screenshot.json");
const visionOcrPath = join(projectDir, "scripts/medal-importer/ocr.swift");
const aliasesPath = join(scriptDir, "reviewed-character-name-aliases.json");

function requireCommand(command, fallbackPaths = []) {
  try {
    return execFileSync("/usr/bin/env", ["which", command], { encoding: "utf8" }).trim();
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
    maxBuffer: 16 * 1024 * 1024,
  }).trim();
}

function parseArguments(args) {
  const positional = [];
  let draftPath = defaultDraftPath;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dry-run") continue;
    if (argument === "--draft") {
      const value = args[index + 1];
      if (!value) throw new Error("--draft requires a path");
      draftPath = resolve(value);
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
    positional.push(argument);
  }
  if (positional.length !== 1) {
    throw new Error("Usage: npm run characters:import-level-100-stats-screenshot -- /path/to/screenshot.png");
  }
  return { imagePath: resolve(positional[0]), draftPath };
}

function imageDimensions(magickCommand, imagePath) {
  const [width, height] = run(magickCommand, ["identify", "-format", "%w %h", imagePath])
    .split(/\s+/)
    .map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error(`Could not read image dimensions: ${imagePath}`);
  }
  return { width, height };
}

const { imagePath, draftPath } = parseArguments(process.argv.slice(2));
accessSync(imagePath, constants.R_OK);
const magickCommand = requireCommand("magick", ["/opt/homebrew/bin/magick", "/usr/local/bin/magick"]);
const swiftCommand = requireCommand("swift", ["/usr/bin/swift"]);
const imageSize = imageDimensions(magickCommand, imagePath);
const crops = resolveTemplateCrops(maxLevelPreviewTemplate, imageSize);
const workDir = await mkdtemp(join(tmpdir(), "opbr-character-stats-ocr-"));

try {
  const cropFiles = [];
  for (const [field, crop] of Object.entries(crops)) {
    const outputPath = join(workDir, `${field}.png`);
    run(magickCommand, [
      imagePath,
      "-crop",
      `${crop.width}x${crop.height}+${crop.x}+${crop.y}`,
      "+repage",
      "-filter",
      "Lanczos",
      "-resize",
      `${maxLevelPreviewTemplate.ocrScale * 100}%`,
      "-unsharp",
      "0x1",
      outputPath,
    ]);
    cropFiles.push({ field, outputPath });
  }

  // Vision sees only the five prepared crops, never the full screenshot.
  const ocrResults = JSON.parse(run(swiftCommand, [visionOcrPath, ...cropFiles.map(({ outputPath }) => outputPath)]));
  const fieldByFile = new Map(cropFiles.map(({ field, outputPath }) => [basename(outputPath), field]));
  const ocrByRegion = Object.fromEntries(
    ocrResults.map((result) => [fieldByFile.get(result.file), result]),
  );
  const aliases = JSON.parse(await readFile(aliasesPath, "utf8"));
  const matchCharacterName = createCharacterNameMatcher(characters, aliases);
  const draft = buildCharacterStatsScreenshotDraft({
    sourceImage: basename(imagePath),
    templateId: maxLevelPreviewTemplate.id,
    crops,
    ocrByRegion,
    matchCharacterName,
  });

  await writeFile(draftPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    mode: "dry-run",
    imageSize,
    draft,
  }, null, 2)}\n`);

  console.log("Character Stats Screenshot");
  console.log("");
  console.log(`File: ${draft.sourceImage}`);
  console.log(`Character: ${draft.characterName ?? "<unrecognized>"}`);
  console.log(`Matched ID: ${draft.characterId ?? "<needs review>"}`);
  console.log(`Level: ${draft.level ?? "<unrecognized>"}`);
  console.log(`HP: ${draft.hp ?? "<unrecognized>"}`);
  console.log(`ATK: ${draft.atk ?? "<unrecognized>"}`);
  console.log(`DEF: ${draft.def ?? "<unrecognized>"}`);
  console.log(`Status: ${draft.reviewStatus}`);
  console.log(`Draft: ${draftPath}`);
  console.log("");
  console.log("Dry run only; production level-100-stats.ts was not changed.");
  if (draft.issues.length) {
    for (const issue of draft.issues) console.log(`Issue: ${issue.code} — ${issue.message}`);
  }
} finally {
  await rm(workDir, { recursive: true, force: true });
}
