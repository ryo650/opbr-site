import { execFileSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deduplicateScreenshots,
} from "./dedupe.mjs";
import {
  assertInputNotEmpty,
  comparableProductionContent,
  mergeProductionMedals,
  parseGeneratedMedals,
  productionContent,
  publishAtomic,
  readProductionMedals,
  validateMergePlan,
} from "./incremental.mjs";
import { groupScreens, mergeTagPages } from "./tag-pages.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const inputDir = path.join(importerDir, "input");
const reviewPath = path.join(importerDir, "reviewed-medals.json");
const draftPath = path.join(importerDir, "draft-medals.json");
const ocrPath = path.join(importerDir, "ocr.swift");
const dataPath = path.join(projectDir, "src/data/medals/medals.ts");
const imageDir = path.join(projectDir, "public/medals");
const dryRun = process.argv.includes("--dry-run");
const regressionMode = process.argv.includes("--regression");
const knownNativeTraits = new Set(["atk", "def", "hp", "crit"]);
const knownStatusEffects = new Set([
  "clawed",
  "capture-block",
  "aflame",
  "tremor",
  "stun",
  "poison",
  "confuse",
  "shock",
  "freeze",
  "entrance",
  "negative",
]);

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

const magickCommand = requireCommand("magick", [
  "/opt/homebrew/bin/magick",
  "/usr/local/bin/magick",
]);
const swiftCommand = requireCommand("swift", ["/usr/bin/swift"]);

function run(command, args) {
  return execFileSync(command, args, {
    cwd: projectDir,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
}

async function retryFieldOcr(filePath, fieldName, crop) {
  const retryDir = await mkdtemp(path.join(tmpdir(), "opbr-medal-field-ocr-"));
  const outputPath = path.join(retryDir, `${fieldName}.png`);
  try {
    run(magickCommand, [
      filePath,
      "-crop",
      `${crop.width}x${crop.height}+${crop.x}+${crop.y}`,
      "+repage",
      "-filter",
      "Lanczos",
      "-resize",
      `${crop.scale * 100}%`,
      "-unsharp",
      "0x1",
      outputPath,
    ]);
    const [result] = JSON.parse(run(swiftCommand, [ocrPath, outputPath]));
    if (!result) {
      throw new Error(`Field-level OCR returned no result for ${filePath}`);
    }
    return {
      field: fieldName,
      crop,
      lines: result.lines,
      observations: result.observations,
    };
  } finally {
    await rm(retryDir, { recursive: true, force: true });
  }
}

function imageSequence(file) {
  const match = file.match(/^IMG_(\d+)\.(?:png|jpe?g)$/i);
  return match ? Number(match[1]) : null;
}

function resolveInputOrder(items) {
  const allHaveSequence = items.every((item) => item.sequence !== null);
  const uniqueSequences =
    new Set(items.map((item) => item.sequence)).size === items.length;

  if (allHaveSequence && uniqueSequences) {
    const ordered = [...items].sort(
      (left, right) =>
        left.sequence - right.sequence || left.file.localeCompare(right.file),
    );
    const warnings = [];

    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      if (
        previous.captureTime &&
        current.captureTime &&
        previous.captureTime >= current.captureTime
      ) {
        warnings.push(
          `${previous.file} (${previous.captureTime}) -> ${current.file} (${current.captureTime})`,
        );
      }
    }

    return { ordered, source: "filename sequence", warnings };
  }

  const allHaveCaptureTime = items.every((item) => item.captureTime);
  if (!allHaveCaptureTime) {
    throw new Error(
      "Filename sequences are unavailable or ambiguous, and not every screenshot has an EXIF capture timestamp",
    );
  }

  const captureTimes = items.map((item) => item.captureTime);
  if (new Set(captureTimes).size !== captureTimes.length) {
    throw new Error(
      "Filename sequences are unavailable or ambiguous, and EXIF capture timestamps are not unique",
    );
  }

  return {
    ordered: [...items].sort(
      (left, right) =>
        left.captureTime.localeCompare(right.captureTime) ||
        left.file.localeCompare(right.file),
    ),
    source: "EXIF DateTimeOriginal",
    warnings: [],
  };
}

function captureTime(filePath) {
  const value = run(magickCommand, [
    "identify",
    "-format",
    "%[EXIF:DateTimeOriginal]",
    filePath,
  ]);
  return value || null;
}

function screenshotSignature(filePath) {
  return run(magickCommand, [filePath, "-format", "%#", "info:"]);
}

function dimensions(filePath) {
  const [width, height] = run(magickCommand, [
    "identify",
    "-format",
    "%w %h",
    filePath,
  ])
    .split(/\s+/)
    .map(Number);
  return { width, height };
}

function categoryFromCrop(filePath, crop) {
  const geometry = `${crop.width}x${crop.height}+${crop.x}+${crop.y}`;
  const values = run(magickCommand, [
    filePath,
    "-crop",
    geometry,
    "+repage",
    "-format",
    "%[fx:mean.r],%[fx:mean.g],%[fx:mean.b]",
    "info:",
  ])
    .split(",")
    .map(Number);
  const [red, green, blue] = values;
  const eventDelta = blue - green;
  return {
    detected:
      eventDelta >= 0.02
        ? "event"
        : eventDelta <= 0
          ? "character"
          : null,
    meanRgb: { red, green, blue },
    eventDelta,
  };
}

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function statusEffectId(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function issue(code, message, screenshot, ocrText, extra = {}) {
  return { code, message, screenshot, ocrText, ...extra };
}

function isRateNoiseLine(line) {
  const trimmed = line.trim();
  return (
    /^\d+(?:[.,]\d+)?%$/.test(trimmed) ||
    /^[*.<>\-\s]+$/.test(trimmed) ||
    trimmed === "X O"
  );
}

function analyzeRateTraits(ocr, medalName, file) {
  const nativeTraits = new Set();
  const statusReductions = new Set();
  const traitKinds = new Set();
  const issues = [];

  function addIssue(nextIssue) {
    if (
      !issues.some(
        (existing) =>
          existing.code === nextIssue.code &&
          existing.ocrText === nextIssue.ocrText,
      )
    ) {
      issues.push(nextIssue);
    }
  }

  for (let index = 0; index < ocr.lines.length; index += 1) {
    const line = ocr.lines[index];
    const nativeMatches = [...line.matchAll(/\bincrease\s+([a-z]+)\s+by\b/gi)];
    for (const match of nativeMatches) {
      const trait = match[1].toLowerCase();
      if (!knownNativeTraits.has(trait)) {
        traitKinds.add(`unknown-native:${trait}`);
        addIssue(
          issue(
            "unknown-native-trait",
            `Unknown native trait detected: "${match[1]}"`,
            file,
            line,
            { medalName, unknownTraitText: match[1] },
          ),
        );
        continue;
      }
      nativeTraits.add(trait);
      traitKinds.add(`native:${trait}`);
    }

    if (/\bincrease\b/i.test(line) && nativeMatches.length === 0) {
      addIssue(
        issue(
          "unparsed-rate-trait",
          "Rate contains an Increase trait that could not be parsed",
          file,
          line,
          { medalName, unknownTraitText: line },
        ),
      );
    }

    if (/^reduces?\s+duration\s+of\b/i.test(line.trim())) {
      let statusText = line.trim();
      let lookahead = index + 1;
      while (
        !/\bduration\s+of\s+.+?\s+by\b/i.test(statusText) &&
        lookahead < ocr.lines.length &&
        lookahead <= index + 3
      ) {
        const continuation = ocr.lines[lookahead].trim();
        if (!isRateNoiseLine(continuation)) {
          statusText += ` ${continuation}`;
        }
        lookahead += 1;
      }
      const match = statusText.match(
        /\bduration\s+of\s+(.+?)\s+by(?:\s|$)/i,
      );
      if (!match) {
        addIssue(
          issue(
            "unparsed-rate-trait",
            "Status reduction trait could not be parsed",
            file,
            statusText,
            { medalName, unknownTraitText: statusText },
          ),
        );
        continue;
      }
      const status = statusEffectId(match[1]);
      traitKinds.add(`status:${status}`);
      if (!knownStatusEffects.has(status)) {
        addIssue(
          issue(
            "unknown-status-effect",
            `Unknown status effect detected: "${match[1]}"`,
            file,
            statusText,
            { medalName, unknownStatusText: match[1] },
          ),
        );
        continue;
      }
      statusReductions.add(status);
      continue;
    }

    if (
      /\b(boost|decrease|reduces?|recover|restore|nullif|shorten|extend|inflict|remove)\b/i.test(
        line,
      ) &&
      !/drop rates? are rounded/i.test(line)
    ) {
      addIssue(
        issue(
          "unparsed-rate-trait",
          "Rate contains a trait-like sentence that could not be parsed",
          file,
          line,
          { medalName, unknownTraitText: line },
        ),
      );
    }
  }

  if (traitKinds.size === 0) {
    issues.push(
      issue(
        "unparsed-rate-trait",
        "No native trait could be parsed from Rate screen",
        file,
        ocr.lines.join(" | "),
        { medalName },
      ),
    );
  }

  return { nativeTraits, statusReductions, traitKinds, issues };
}

function sameStringSet(expected, actual) {
  return (
    expected.length === actual.size &&
    expected.every((value) => actual.has(value))
  );
}

function classify(ocr, file) {
  const ocrText = ocr.lines.join(" | ");
  const titleTypes = new Set(
    ocr.observations
      .filter(
        ({ x, y, width }) =>
          x >= 0.35 && x + width <= 0.65 && y >= 0.85,
      )
      .map(({ text }) => {
        const title = normalizeText(text);
        if (title === "medal details") return "details";
        if (title === "tag") return "tag";
        if (title === "rate") return "rate";
        return null;
      })
      .filter(Boolean),
  );

  if (titleTypes.size !== 1) {
    const found = [...titleTypes].join(", ") || "none";
    throw new Error(
      `${file}: expected exactly one recognized modal title, found ${found}\nOCR: ${ocrText}`,
    );
  }

  const [type] = titleTypes;
  const normalizedLines = ocr.lines.map(normalizeText);
  const hasRateDescription = normalizedLines.some((line) =>
    line.includes("drop rates are rounded off"),
  );
  const hasPercentage = ocr.lines.some((line) => /\d+(?:[.,]\d+)?%/.test(line));
  const hasRateSignature = hasRateDescription && hasPercentage;
  const hasDetailsSignature = normalizedLines.includes("unique trait");
  const hasDetailsBodyStructure =
    normalizedLines.some((line) => /^extra trait(?: \d+)?$/.test(line)) &&
    normalizedLines.includes("rate") &&
    normalizedLines.includes("craft");

  if (type === "rate" && !hasRateSignature) {
    throw new Error(
      `${file}: Rate title conflicts with missing Rate signature\nOCR: ${ocrText}`,
    );
  }
  if (type !== "rate" && hasRateSignature) {
    throw new Error(
      `${file}: ${type} title conflicts with Rate signature\nOCR: ${ocrText}`,
    );
  }
  if (
    type === "details" &&
    !hasDetailsSignature &&
    !hasDetailsBodyStructure
  ) {
    throw new Error(
      `${file}: Medal Details title conflicts with missing Details body structure\nOCR: ${ocrText}`,
    );
  }
  if (type === "tag" && hasDetailsSignature) {
    throw new Error(
      `${file}: Tag title conflicts with Details signature\nOCR: ${ocrText}`,
    );
  }

  return type;
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function medalIdFromName(name) {
  return slugify(
    name.replace(/\s+medal$/i, "").replace(/[’']/g, ""),
  );
}

function joinOcrLines(lines) {
  return lines
    .join(" ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

function hasUniqueTraitStructureAnomaly(uniqueTrait, traitLines) {
  const openingParentheses = [...uniqueTrait].filter(
    (value) => value === "(",
  ).length;
  const closingParentheses = [...uniqueTrait].filter(
    (value) => value === ")",
  ).length;
  return (
    openingParentheses !== closingParentheses ||
    traitLines.some((line) => /^[+*×‹<>]/.test(line.trim()))
  );
}

function extractRetriedUniqueTrait(ocr) {
  const traitLines = ocr.lines.filter(
    (line) => normalizeText(line) !== "unique trait",
  );
  const start = traitLines.findIndex((line) =>
    /^(when|after|if|while|upon|once|for|reduce|increase)\b/i.test(
      line.trim(),
    ),
  );
  if (start === -1) return null;
  const selectedLines = traitLines.slice(start);
  const uniqueTrait = joinOcrLines(selectedLines);
  if (hasUniqueTraitStructureAnomaly(uniqueTrait, selectedLines)) return null;
  return uniqueTrait;
}

function extractRetriedName(ocr) {
  const nameCandidates = ocr.lines
    .map((line) => line.trim())
    .filter((line) => /\S+\s+medal$/i.test(line));
  return nameCandidates.length === 1 ? nameCandidates[0] : null;
}

function extractDetails(ocr, file) {
  const issues = [];
  const nameCandidates = ocr.lines.filter(
    (line) => /\bmedal$/i.test(line.trim()) && normalizeText(line) !== "medal details",
  );
  const name = nameCandidates.length === 1 ? nameCandidates[0].trim() : null;

  if (!name) {
    issues.push(
      issue(
        "missing-name",
        `Expected exactly one medal name, found ${nameCandidates.length}`,
        file,
        ocr.lines.join(" | "),
      ),
    );
  }

  const normalizedLines = ocr.lines.map(normalizeText);
  const uniqueIndex = normalizedLines.indexOf("unique trait");
  const limitsIndex = normalizedLines.indexOf("limits", uniqueIndex + 1);
  let uniqueTrait = null;

  if (uniqueIndex === -1 || limitsIndex === -1 || limitsIndex <= uniqueIndex + 1) {
    issues.push(
      issue(
        "missing-unique-trait",
        "Could not locate the Unique Trait text region",
        file,
        ocr.lines.join(" | "),
      ),
    );
  } else {
    const region = ocr.lines.slice(uniqueIndex + 1, limitsIndex).filter((line) => {
      const normalized = normalizeText(line);
      return (
        normalized !== "tag" &&
        normalized !== "order received" &&
        !normalized.includes("event over") &&
        normalized !== "rent over"
      );
    });
    const start = region.findIndex((line) =>
      /^(when|after|if|while|upon|once|for|reduce|increase)\b/i.test(
        line.trim(),
      ),
    );
    const traitLines = start === -1 ? [] : region.slice(start);
    uniqueTrait = traitLines.length > 0 ? joinOcrLines(traitLines) : null;

    if (!uniqueTrait) {
      issues.push(
        issue(
          "missing-unique-trait",
          "Unique Trait label was found but its text could not be extracted",
          file,
          region.join(" | "),
        ),
      );
    } else {
      if (hasUniqueTraitStructureAnomaly(uniqueTrait, traitLines)) {
        issues.push(
          issue(
            "ambiguous-unique-trait-ocr",
            "Unique Trait contains an objective OCR structure anomaly",
            file,
            uniqueTrait,
          ),
        );
      }
    }
  }

  return { name, uniqueTrait, issues };
}

function ignoredTagText(value) {
  const normalized = normalizeText(value);
  return (
    !normalized ||
    normalized === "tag" ||
    normalized === "close" ||
    normalized === "select the" ||
    normalized === "use" ||
    /^(x\s*o|o|0)$/.test(normalized) ||
    /^\d+\s+day s/.test(normalized) ||
    normalized.includes("event over") ||
    normalized.includes("vent over") ||
    normalized.includes("extra trait") ||
    normalized.includes("max upgrade") ||
    normalized.includes("ax upgrade") ||
    normalized.includes("character ranking") ||
    normalized.includes("laracter ranking") ||
    normalized.includes("drag to se")
  );
}

function extractTags(ocr, file) {
  const issues = [];
  const tags = [];

  for (const observation of ocr.observations) {
    if (
      observation.x < 0.2 ||
      observation.x + observation.width > 0.8 ||
      observation.y <= 0.14 ||
      observation.y >= 0.85
    ) {
      continue;
    }

    const text = observation.text.trim();
    if (ignoredTagText(text)) continue;

    if (!/[a-z]{2}/i.test(text)) {
      issues.push(
        issue(
          "unparsed-tag-text",
          "Tag row contains OCR text that is not a valid tag name",
          file,
          text,
        ),
      );
      continue;
    }

    const id = slugify(text);
    if (!tags.some((tag) => tag.id === id)) {
      tags.push({ id, name: text });
    }
  }

  if (tags.length === 0) {
    issues.push(
      issue(
        "missing-tags",
        "No tags could be extracted from Tag screen",
        file,
        ocr.lines.join(" | "),
      ),
    );
  }

  return { tags, issues };
}

function sourceTagScreens(sources) {
  if (Array.isArray(sources.tags)) return sources.tags;
  return sources.tag ? [sources.tag] : [];
}

function sameSources(group, sources) {
  return (
    group.details === sources.details &&
    JSON.stringify(group.tagScreens) ===
      JSON.stringify(sourceTagScreens(sources)) &&
    JSON.stringify(group.rates) === JSON.stringify(sources.rates)
  );
}

function renderData(medals) {
  const publicData = medals.map(
    ({
      id,
      name,
      category,
      uniqueTrait,
      tags,
      nativeTraits,
      statusReductions,
    }) => ({
      id,
      name,
      category,
      uniqueTrait,
      tags,
      nativeTraits,
      ...(statusReductions?.length ? { statusReductions } : {}),
    }),
  );

  return `/* This file is generated by scripts/medal-importer/import.mjs. */\n\nimport type { Medal } from "./types";\n\nexport const medals = ${JSON.stringify(publicData, null, 2)} as const satisfies readonly Medal[];\n`;
}

async function pathExists(file) {
  try {
    accessSync(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function assertWebp(file) {
  const metadata = run(magickCommand, [
    "identify",
    "-format",
    "%m %w %h",
    file,
  ]);
  if (metadata !== "WEBP 200 200") {
    throw new Error(`${file}: expected WEBP 200 200, found ${metadata}`);
  }
}

accessSync(inputDir, constants.R_OK);

const review = JSON.parse(await readFile(reviewPath, "utf8"));
const existingProduction = await readProductionMedals(dataPath);
if (
  review.crop.x < 0 ||
  review.crop.y < 0 ||
  review.crop.width <= 0 ||
  review.crop.height <= 0 ||
  review.crop.x + review.crop.width > review.screenshotSize.width ||
  review.crop.y + review.crop.height > review.screenshotSize.height
) {
  throw new Error("Configured medal crop falls outside the expected screenshot");
}
for (const fieldName of ["name", "uniqueTrait", "rateTraits"]) {
  const fieldCrop = review.fieldCrops?.[fieldName];
  if (
    !fieldCrop ||
    fieldCrop.x < 0 ||
    fieldCrop.y < 0 ||
    fieldCrop.width <= 0 ||
    fieldCrop.height <= 0 ||
    fieldCrop.scale < 1 ||
    fieldCrop.x + fieldCrop.width > review.screenshotSize.width ||
    fieldCrop.y + fieldCrop.height > review.screenshotSize.height
  ) {
    throw new Error(
      `Configured ${fieldName} field crop falls outside the expected screenshot`,
    );
  }
}
const discoveredInputFiles = (await readdir(inputDir))
  .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
  .map((file) => ({
    file,
    path: path.join(inputDir, file),
    captureTime: captureTime(path.join(inputDir, file)),
    sequence: imageSequence(file),
    signature: screenshotSignature(path.join(inputDir, file)),
  }));

assertInputNotEmpty(discoveredInputFiles);

const inputOrder = resolveInputOrder(discoveredInputFiles);
discoveredInputFiles.splice(0, discoveredInputFiles.length, ...inputOrder.ordered);

console.log(`Order source: ${inputOrder.source}`);
for (const warning of inputOrder.warnings) {
  console.warn(
    `Order warning: filename sequence conflicts with EXIF: ${warning}; using filename sequence`,
  );
}

const screenshotDeduplication = deduplicateScreenshots(discoveredInputFiles);
const inputFiles = screenshotDeduplication.unique;
const skippedScreenshotNames = new Set(
  screenshotDeduplication.skipped.map(({ item }) => item.file),
);
const activeReviewMedals = (regressionMode ? review.medals : []).filter((medal) => {
  const sourceFiles = [
    medal.sources.details,
    ...sourceTagScreens(medal.sources),
    ...medal.sources.rates,
  ];
  const skippedCount = sourceFiles.filter((file) =>
    skippedScreenshotNames.has(file),
  ).length;
  if (skippedCount === 0) return true;
  if (skippedCount === sourceFiles.length) return false;
  throw new Error(
    `${medal.name}: only part of the reviewed group consists of skipped duplicate screenshots`,
  );
});

for (const input of inputFiles) {
  const actual = dimensions(input.path);
  if (
    actual.width !== review.screenshotSize.width ||
    actual.height !== review.screenshotSize.height
  ) {
    throw new Error(
      `${input.file} is ${actual.width}x${actual.height}; expected ${review.screenshotSize.width}x${review.screenshotSize.height}`,
    );
  }
}

const ocr = JSON.parse(
  run(swiftCommand, [ocrPath, ...inputFiles.map((item) => item.path)]),
);
const ocrByFile = new Map(ocr.map((item) => [item.file, item]));
const screens = inputFiles.map((item) => ({
  ...item,
  type: classify(
    ocrByFile.get(item.file) ?? { lines: [], observations: [] },
    item.file,
  ),
}));
const groups = groupScreens(screens);
const fixtureByDetails = new Map(
  activeReviewMedals.map((medal) => [medal.sources.details, medal]),
);
const groupByDetails = new Map(groups.map((group) => [group.details, group]));

for (const fixture of activeReviewMedals) {
  const fixtureGroup = groupByDetails.get(fixture.sources.details);
  if (!fixtureGroup || !sameSources(fixtureGroup, fixture.sources)) {
    throw new Error(
      `Regression fixture source mapping failed: ${fixture.name} (${fixture.sources.details})`,
    );
  }
}

const drafts = [];
for (const group of groups) {
  const fixture = fixtureByDetails.get(group.details) ?? null;
  const detailsOcr = ocrByFile.get(group.details);
  const tagOcrPages = group.tagScreens.map((file) => ({
    file,
    ocr: ocrByFile.get(file),
  }));
  if (!detailsOcr || tagOcrPages.some((page) => !page.ocr)) {
    throw new Error(`Missing OCR data for group beginning ${group.details}`);
  }

  const details = extractDetails(detailsOcr, group.details);
  const fieldOcrRetries = [];
  if (details.issues.some((detailIssue) => detailIssue.code === "missing-name")) {
    const retry = await retryFieldOcr(
      path.join(inputDir, group.details),
      "name",
      review.fieldCrops.name,
    );
    const retriedName = extractRetriedName(retry);
    fieldOcrRetries.push({
      field: "name",
      screenshot: group.details,
      crop: retry.crop,
      initialOcr: details.name ?? detailsOcr.lines,
      retryOcr: retry.lines,
      resolved: Boolean(retriedName),
    });
    if (retriedName) {
      details.name = retriedName;
      details.issues = details.issues.filter(
        (detailIssue) => detailIssue.code !== "missing-name",
      );
    }
  }
  if (
    details.issues.some((detailIssue) =>
      ["missing-unique-trait", "ambiguous-unique-trait-ocr"].includes(
        detailIssue.code,
      ),
    )
  ) {
    const retry = await retryFieldOcr(
      path.join(inputDir, group.details),
      "unique-trait",
      review.fieldCrops.uniqueTrait,
    );
    const retriedUniqueTrait = extractRetriedUniqueTrait(retry);
    fieldOcrRetries.push({
      field: "uniqueTrait",
      screenshot: group.details,
      crop: retry.crop,
      initialOcr: details.uniqueTrait ?? detailsOcr.lines,
      retryOcr: retry.lines,
      resolved: Boolean(retriedUniqueTrait),
    });
    if (retriedUniqueTrait) {
      details.uniqueTrait = retriedUniqueTrait;
      details.issues = details.issues.filter(
        (detailIssue) =>
          !["missing-unique-trait", "ambiguous-unique-trait-ocr"].includes(
            detailIssue.code,
          ),
      );
    }
  }
  const tagResult = mergeTagPages(
    tagOcrPages.map(({ file, ocr: tagOcr }) => ({
      file,
      ...extractTags(tagOcr, file),
    })),
  );
  const draftIssues = [...details.issues, ...tagResult.issues];
  const nativeTraits = new Set();
  const statusReductions = new Set();
  const traitKinds = new Set();
  const rateOcr = [];
  const medalName = details.name ?? group.details;

  for (const rateFile of group.rates) {
    const screenOcr = ocrByFile.get(rateFile);
    if (!screenOcr) {
      throw new Error(`${rateFile}: missing OCR result`);
    }
    rateOcr.push({ file: rateFile, lines: screenOcr.lines });
    let detected = analyzeRateTraits(screenOcr, medalName, rateFile);
    if (
      detected.issues.some((rateIssue) =>
        ["unknown-native-trait", "unparsed-rate-trait"].includes(
          rateIssue.code,
        ),
      )
    ) {
      const retry = await retryFieldOcr(
        path.join(inputDir, rateFile),
        "rate-traits",
        review.fieldCrops.rateTraits,
      );
      const retried = analyzeRateTraits(retry, medalName, rateFile);
      const resolved = !retried.issues.some((rateIssue) =>
        ["unknown-native-trait", "unparsed-rate-trait"].includes(
          rateIssue.code,
        ),
      );
      fieldOcrRetries.push({
        field: "rateTraits",
        screenshot: rateFile,
        crop: retry.crop,
        initialOcr: detected.issues.map((rateIssue) => rateIssue.ocrText),
        retryOcr: retry.lines,
        resolved,
      });
      if (resolved) detected = retried;
    }
    for (const trait of detected.nativeTraits) nativeTraits.add(trait);
    for (const status of detected.statusReductions) statusReductions.add(status);
    for (const kind of detected.traitKinds) traitKinds.add(kind);
    draftIssues.push(...detected.issues);
  }

  if (traitKinds.size < 3) {
    draftIssues.push(
      issue(
        "rate-coverage-incomplete",
        `Rate screens expose only ${traitKinds.size} distinct trait kinds; expected at least 3`,
        group.rates.join(", "),
        rateOcr.flatMap((item) => item.lines).join(" | "),
        { medalName },
      ),
    );
  }

  const colorCheck = categoryFromCrop(
    path.join(inputDir, group.details),
    review.crop,
  );
  if (!colorCheck.detected) {
    draftIssues.push(
      issue(
        "ambiguous-category",
        `Crop color delta ${colorCheck.eventDelta.toFixed(4)} is between the character and event thresholds`,
        group.details,
        JSON.stringify(colorCheck.meanRgb),
        { medalName },
      ),
    );
  }

  const draft = {
    id: details.name ? medalIdFromName(details.name) : null,
    name: details.name,
    category: colorCheck.detected,
    uniqueTrait: details.uniqueTrait,
    tags: tagResult.tags,
    nativeTraits: [...nativeTraits],
    ...(statusReductions.size > 0
      ? { statusReductions: [...statusReductions] }
      : {}),
    fixture: Boolean(fixture),
    validationPassed: false,
    needsReview: false,
    issues: draftIssues,
    sources: {
      details: group.details,
      tags: group.tagScreens,
      rates: group.rates,
    },
    cropCheck: colorCheck,
    ocr: {
      details: detailsOcr.lines,
      tags: tagOcrPages.map(({ file, ocr: tagOcr }) => ({
        file,
        lines: tagOcr.lines,
      })),
      rates: rateOcr,
    },
    fieldOcrRetries,
    tagPages: tagResult.pages,
  };

  if (fixture) {
    const regressionIssues = [...draft.issues];
    if (normalizeText(draft.name ?? "") !== normalizeText(fixture.name)) {
      regressionIssues.push(`name: ${draft.name} != ${fixture.name}`);
    }
    if (
      normalizeText(draft.uniqueTrait ?? "") !== normalizeText(fixture.uniqueTrait)
    ) {
      regressionIssues.push(
        `uniqueTrait: ${draft.uniqueTrait} != ${fixture.uniqueTrait}`,
      );
    }
    if (draft.category !== fixture.category) {
      regressionIssues.push(
        `category: ${draft.category ?? "ambiguous"} != ${fixture.category}`,
      );
    }
    if (!sameStringSet(fixture.tags.map((tag) => tag.id), new Set(draft.tags.map((tag) => tag.id)))) {
      regressionIssues.push(
        `tags: [${draft.tags.map((tag) => tag.id).join(", ")}] != [${fixture.tags.map((tag) => tag.id).join(", ")}]`,
      );
    }
    if (!sameStringSet(fixture.nativeTraits, nativeTraits)) {
      regressionIssues.push(
        `nativeTraits: [${draft.nativeTraits.join(", ")}] != [${fixture.nativeTraits.join(", ")}]`,
      );
    }
    if (!sameStringSet(fixture.statusReductions ?? [], statusReductions)) {
      regressionIssues.push(
        `statusReductions: [${draft.statusReductions?.join(", ") ?? ""}] != [${fixture.statusReductions?.join(", ") ?? ""}]`,
      );
    }
    if (regressionIssues.length > 0) {
      throw new Error(
        `Regression fixture failed: ${fixture.name}\n${regressionIssues.map((value) => (typeof value === "string" ? value : JSON.stringify(value))).join("\n")}`,
      );
    }

    draft.id = fixture.id;
    draft.name = fixture.name;
    draft.category = fixture.category;
    draft.uniqueTrait = fixture.uniqueTrait;
    draft.tags = fixture.tags;
    draft.nativeTraits = fixture.nativeTraits;
    if (fixture.statusReductions) {
      draft.statusReductions = fixture.statusReductions;
    }
  }

  drafts.push(draft);
}

const firstDraftById = new Map();
for (const draft of drafts) {
  if (!draft.id) continue;
  const existing = firstDraftById.get(draft.id);
  if (!existing) {
    firstDraftById.set(draft.id, draft);
    continue;
  }
  if (
    JSON.stringify(comparableProductionContent(existing)) ===
    JSON.stringify(comparableProductionContent(draft))
  ) {
    draft.duplicateOf = existing.sources.details;
    continue;
  }

  const conflict = issue(
    "medal-id-conflict",
    `Medal ID ${draft.id} has different content from ${existing.sources.details}`,
    draft.sources.details,
    JSON.stringify(comparableProductionContent(draft)),
    { medalName: draft.name, conflictingScreenshot: existing.sources.details },
  );
  draft.issues.push(conflict);
  if (!existing.fixture) existing.issues.push(conflict);
}

for (const draft of drafts) {
  draft.needsReview = draft.issues.length > 0;
  draft.validationPassed = !draft.needsReview;
}

const importCandidates = drafts
  .filter((draft) => draft.validationPassed)
  .map((draft) => ({
    ...productionContent(draft),
    sources: draft.sources,
  }));
const mergePlan = mergeProductionMedals(existingProduction, importCandidates);

for (const conflict of mergePlan.conflicts) {
  const draft = drafts.find(
    (candidate) =>
      candidate.id === conflict.id &&
      candidate.sources.details === conflict.sourceScreenshots?.details,
  );
  if (!draft) continue;
  draft.issues.push(
    issue(
      "production-medal-id-conflict",
      `Medal ID ${conflict.id} differs from ${conflict.scope}`,
      draft.sources.details,
      JSON.stringify(productionContent(draft)),
      {
        medalName: draft.name,
        medalId: conflict.id,
        existingProductionValue: conflict.existing,
        currentBatchValue: conflict.incoming,
        differingFields: conflict.differingFields,
      },
    ),
  );
  draft.needsReview = true;
  draft.validationPassed = false;
}

const summary = {
  inputScreenshots: inputFiles.length,
  recognizedMedals: drafts.length,
  existingProductionMedals: existingProduction.length,
  batchMedals: drafts.length,
  newMedals: mergePlan.newMedals.length,
  duplicateMedals: mergePlan.duplicates.length,
  conflicts: mergePlan.conflicts.length,
  nextProductionMedals: mergePlan.merged.length,
  regressionFixtures: drafts.filter((draft) => draft.fixture).length,
  validationPassed: drafts.filter((draft) => draft.validationPassed).length,
  needsReview: drafts.filter((draft) => draft.needsReview).length,
  skippedDuplicateScreenshots: screenshotDeduplication.skipped.length,
};

await writeFile(
  draftPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      mode: regressionMode ? "regression" : "incremental",
      order: { source: inputOrder.source, warnings: inputOrder.warnings },
      summary,
      merge: {
        previousProduction: existingProduction,
        newMedalIds: mergePlan.newMedals.map((medal) => medal.id),
        duplicateMedalIds: mergePlan.duplicates.map(({ medal }) => medal.id),
        conflicts: mergePlan.conflicts,
      },
      medals: drafts,
    },
    null,
    2,
  )}\n`,
);

for (const { item, duplicateOf } of screenshotDeduplication.skipped) {
  console.log(
    `Skipped identical screenshot: ${item.file} (same pixels as ${duplicateOf.file})`,
  );
}
console.log(
  `Parsed ${summary.inputScreenshots} screenshots into ${summary.recognizedMedals} medal groups`,
);
console.log(
  `Merge: existing ${summary.existingProductionMedals}; batch ${summary.batchMedals}; new ${summary.newMedals}; duplicate ${summary.duplicateMedals}; conflict ${summary.conflicts}; next production ${summary.nextProductionMedals}`,
);
console.log(
  `Validation passed: ${summary.validationPassed}; needs review: ${summary.needsReview}`,
);
if (regressionMode) {
  console.log(`Regression fixtures checked: ${summary.regressionFixtures}`);
}
console.log("");
for (const [index, draft] of drafts.entries()) {
  const rgb = draft.cropCheck.meanRgb;
  console.log(
    `Group ${index + 1}: ${draft.name ?? "<missing name>"} | ${draft.category ?? "ambiguous"} | ${draft.fixture ? "fixture" : "batch"} | ${draft.validationPassed ? "validation passed" : "needs review"}`,
  );
  console.log(
    `  sources: ${draft.sources.details}, ${draft.sources.tags.join(", ")}, ${draft.sources.rates.join(", ")}`,
  );
  console.log(
    `  crop mean RGB: ${rgb.red.toFixed(3)}, ${rgb.green.toFixed(3)}, ${rgb.blue.toFixed(3)} -> ${draft.cropCheck.detected ?? "ambiguous"}`,
  );
  for (const draftIssue of draft.issues) {
    console.log(
      `  issue: ${draftIssue.code} | ${draftIssue.screenshot} | ${draftIssue.message}`,
    );
  }
}
for (const { medal } of mergePlan.duplicates) {
  console.log(
    `Skipped identical production medal: ${medal.id} (${medal.sources.details})`,
  );
}
for (const conflict of mergePlan.conflicts) {
  console.error(`Medal ID conflict: ${conflict.id}`);
  console.error(`  differing fields: ${conflict.differingFields.join(", ")}`);
  console.error(`  existing: ${JSON.stringify(conflict.existing)}`);
  console.error(`  incoming: ${JSON.stringify(conflict.incoming)}`);
  console.error(
    `  source screenshots: ${JSON.stringify(conflict.sourceScreenshots)}`,
  );
}

const existingIds = new Set(existingProduction.map((medal) => medal.id));
const duplicateBatchById = new Map(
  mergePlan.duplicates.map(({ medal }) => [medal.id, medal]),
);
const currentImageFiles = (await readdir(imageDir)).filter((file) =>
  file.endsWith(".webp"),
);
const orphanImages = currentImageFiles.filter(
  (file) => !existingIds.has(file.replace(/\.webp$/, "")),
);
if (orphanImages.length > 0) {
  throw new Error(
    `Existing WebP files have no production medal: ${orphanImages.join(", ")}`,
  );
}

const imagesToRecover = [];
for (const medal of existingProduction) {
  const productionImage = path.join(imageDir, `${medal.id}.webp`);
  if (await pathExists(productionImage)) {
    assertWebp(productionImage);
    continue;
  }
  const duplicate = duplicateBatchById.get(medal.id);
  if (!duplicate) {
    throw new Error(
      `Missing existing WebP for ${medal.id}; include an identical validated batch medal to recover it safely`,
    );
  }
  imagesToRecover.push(duplicate);
}

for (const medal of mergePlan.newMedals) {
  const productionImage = path.join(imageDir, `${medal.id}.webp`);
  if (await pathExists(productionImage)) {
    throw new Error(
      `Refusing to overwrite pre-existing WebP for new medal ID ${medal.id}`,
    );
  }
}

if (dryRun) {
  if (mergePlan.conflicts.length > 0) {
    throw new Error(
      `Dry run stopped with ${mergePlan.conflicts.length} medal ID conflict(s)`,
    );
  }
  console.log(
    `\nDry run complete; wrote ${path.relative(projectDir, draftPath)} only. Production data and WebP files were not changed.`,
  );
  process.exit(0);
}

validateMergePlan(mergePlan);
if (mergePlan.newMedals.length === 0 && imagesToRecover.length === 0) {
  console.log(
    "\nImport complete; every validated batch medal is an identical production duplicate. Production files were not changed.",
  );
  process.exit(0);
}
await mkdir(path.dirname(dataPath), { recursive: true });
await mkdir(imageDir, { recursive: true });
const temporaryRoot = path.join(importerDir, ".tmp");
await mkdir(temporaryRoot, { recursive: true });
const stageDir = await mkdtemp(path.join(temporaryRoot, "incremental-"));
const stagedDataPath = path.join(stageDir, "medals.ts");
const stagedImageDir = path.join(stageDir, "medals");
const stagedValidationPath = path.join(stageDir, "validation.json");
const stagedImages = [];

try {
  await mkdir(stagedImageDir, { recursive: true });
  const renderedData = renderData(mergePlan.merged);
  await writeFile(stagedDataPath, renderedData);
  const parsedStagedData = parseGeneratedMedals(await readFile(stagedDataPath, "utf8"));
  if (JSON.stringify(parsedStagedData) !== JSON.stringify(mergePlan.merged)) {
    throw new Error("Staged medals.ts does not match the validated merge plan");
  }

  const geometry = `${review.crop.width}x${review.crop.height}+${review.crop.x}+${review.crop.y}`;
  for (const medal of [...mergePlan.newMedals, ...imagesToRecover]) {
    const stagedPath = path.join(stagedImageDir, `${medal.id}.webp`);
    run(magickCommand, [
      path.join(inputDir, medal.sources.details),
      "-crop",
      geometry,
      "+repage",
      "-quality",
      "90",
      stagedPath,
    ]);
    assertWebp(stagedPath);
    stagedImages.push({
      id: medal.id,
      stagedPath,
      productionPath: path.join(imageDir, `${medal.id}.webp`),
    });
  }

  await writeFile(
    stagedValidationPath,
    `${JSON.stringify(
      {
        existing: existingProduction.length,
        batch: drafts.length,
        new: mergePlan.newMedals.length,
        duplicate: mergePlan.duplicates.length,
        conflict: mergePlan.conflicts.length,
        nextProduction: mergePlan.merged.length,
        recoveredWebP: imagesToRecover.map((medal) => medal.id),
      },
      null,
      2,
    )}\n`,
  );

  await publishAtomic({
    stagedDataPath,
    stagedImages,
    dataPath,
    imageDir,
  });
} finally {
  await rm(stageDir, { recursive: true, force: true });
}

console.log(`\nAtomically updated ${path.relative(projectDir, dataPath)}`);
console.log(
  `Added ${mergePlan.newMedals.length} new WebP image(s); recovered ${imagesToRecover.length}; preserved ${existingProduction.length} existing production medal(s).`,
);
