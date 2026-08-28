import { execFileSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deduplicateMedals,
  deduplicateScreenshots,
} from "./dedupe.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const inputDir = path.join(importerDir, "input");
const reviewPath = path.join(importerDir, "reviewed-medals.json");
const draftPath = path.join(importerDir, "draft-medals.json");
const ocrPath = path.join(importerDir, "ocr.swift");
const dataPath = path.join(projectDir, "src/data/medals/medals.ts");
const imageDir = path.join(projectDir, "public/medals");
const dryRun = process.argv.includes("--dry-run");
const knownNativeTraits = new Set(["atk", "def", "hp", "crit"]);
const knownStatusEffects = new Set([
  "clawed",
  "capture-block",
  "aflame",
  "tremor",
  "stun",
  "poison",
]);

function requireCommand(command) {
  try {
    execFileSync("/usr/bin/env", ["which", command], { stdio: "ignore" });
  } catch {
    throw new Error(`Required command not found: ${command}`);
  }
}

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
    run("magick", [
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
    const [result] = JSON.parse(run("swift", [ocrPath, outputPath]));
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
  const value = run("magick", [
    "identify",
    "-format",
    "%[EXIF:DateTimeOriginal]",
    filePath,
  ]);
  return value || null;
}

function screenshotSignature(filePath) {
  return run("magick", [filePath, "-format", "%#", "info:"]);
}

function dimensions(filePath) {
  const [width, height] = run("magick", [
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
  const values = run("magick", [
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
  if (type === "details" && !hasDetailsSignature) {
    throw new Error(
      `${file}: Medal Details title conflicts with missing Unique Trait signature\nOCR: ${ocrText}`,
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
  return slugify(name.replace(/\s+medal$/i, ""));
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

function groupScreens(screens) {
  const groups = [];
  let current = null;

  for (const screen of screens) {
    if (screen.type === "details") {
      current = { details: screen.file, tag: null, rates: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      throw new Error(`${screen.file} appears before the first Medal Details screen`);
    }
    if (screen.type === "tag") {
      if (current.tag) {
        throw new Error(`Duplicate Tag screens in group beginning ${current.details}`);
      }
      current.tag = screen.file;
      continue;
    }
    if (screen.type === "rate") {
      current.rates.push(screen.file);
      continue;
    }
    throw new Error(`Could not classify ${screen.file}; refusing to guess`);
  }

  for (const group of groups) {
    if (!group.tag || group.rates.length === 0) {
      throw new Error(`Incomplete group beginning ${group.details}`);
    }
  }
  return groups;
}

function sameSources(group, sources) {
  return (
    group.details === sources.details &&
    group.tag === sources.tag &&
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

requireCommand("magick");
requireCommand("swift");
accessSync(inputDir, constants.R_OK);

const review = JSON.parse(await readFile(reviewPath, "utf8"));
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
for (const fieldName of ["uniqueTrait", "rateTraits"]) {
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

if (discoveredInputFiles.length === 0) {
  throw new Error("No input screenshots found");
}

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
const activeReviewMedals = review.medals.filter((medal) => {
  const sourceFiles = [
    medal.sources.details,
    medal.sources.tag,
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
  run("swift", [ocrPath, ...inputFiles.map((item) => item.path)]),
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
  const tagOcr = ocrByFile.get(group.tag);
  if (!detailsOcr || !tagOcr) {
    throw new Error(`Missing OCR data for group beginning ${group.details}`);
  }

  const details = extractDetails(detailsOcr, group.details);
  const fieldOcrRetries = [];
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
  const tagResult = extractTags(tagOcr, group.tag);
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
      tag: group.tag,
      rates: group.rates,
    },
    cropCheck: colorCheck,
    ocr: {
      details: detailsOcr.lines,
      tag: tagOcr.lines,
      rates: rateOcr,
    },
    fieldOcrRetries,
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

function productionContent(medal) {
  return {
    id: medal.id,
    name: medal.name,
    category: medal.category,
    uniqueTrait: medal.uniqueTrait,
    tags: medal.tags,
    nativeTraits: medal.nativeTraits,
    ...(medal.statusReductions
      ? { statusReductions: medal.statusReductions }
      : {}),
  };
}

function comparableProductionContent(medal) {
  const content = productionContent(medal);
  return {
    ...content,
    tags: [...content.tags].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    nativeTraits: [...content.nativeTraits].sort(),
    ...(content.statusReductions
      ? { statusReductions: [...content.statusReductions].sort() }
      : {}),
  };
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
const medalDeduplication = deduplicateMedals(importCandidates);
const outputMedals = medalDeduplication.unique;

const existingCount = drafts.filter((draft) => draft.fixture).length;
const newDrafts = drafts.filter((draft) => !draft.fixture);
const summary = {
  inputScreenshots: inputFiles.length,
  recognizedMedals: drafts.length,
  existingMedals: existingCount,
  newMedals: newDrafts.length,
  validationPassed: drafts.filter((draft) => draft.validationPassed).length,
  needsReview: drafts.filter((draft) => draft.needsReview).length,
  newValidationPassed: newDrafts.filter((draft) => draft.validationPassed).length,
  newNeedsReview: newDrafts.filter((draft) => draft.needsReview).length,
  skippedDuplicateScreenshots: screenshotDeduplication.skipped.length,
  skippedDuplicateMedals: medalDeduplication.skipped.length,
};

await writeFile(
  draftPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      order: { source: inputOrder.source, warnings: inputOrder.warnings },
      summary,
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
  `Regression fixtures: ${summary.existingMedals}; new medals: ${summary.newMedals}`,
);
console.log(
  `Validation passed: ${summary.validationPassed}; needs review: ${summary.needsReview}`,
);
console.log("");
for (const [index, draft] of drafts.entries()) {
  const rgb = draft.cropCheck.meanRgb;
  console.log(
    `Group ${index + 1}: ${draft.name ?? "<missing name>"} | ${draft.category ?? "ambiguous"} | ${draft.fixture ? "fixture" : "new"} | ${draft.validationPassed ? "validation passed" : "needs review"}`,
  );
  console.log(
    `  sources: ${draft.sources.details}, ${draft.sources.tag}, ${draft.sources.rates.join(", ")}`,
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
for (const { medal, duplicateOf } of medalDeduplication.skipped) {
  console.log(
    `Skipped duplicate medal ID: ${medal.id} (${medal.sources.details}; same content as ${duplicateOf.sources.details})`,
  );
}

if (dryRun) {
  console.log(
    `\nDry run complete; wrote ${path.relative(projectDir, draftPath)} only. Production data and WebP files were not changed.`,
  );
  process.exit(0);
}

await mkdir(path.dirname(dataPath), { recursive: true });
await mkdir(imageDir, { recursive: true });
await writeFile(dataPath, renderData(outputMedals));

const geometry = `${review.crop.width}x${review.crop.height}+${review.crop.x}+${review.crop.y}`;
for (const medal of outputMedals) {
  run("magick", [
    path.join(inputDir, medal.sources.details),
    "-crop",
    geometry,
    "+repage",
    "-quality",
    "90",
    path.join(imageDir, `${medal.id}.webp`),
  ]);
}

console.log(`\nWrote ${path.relative(projectDir, dataPath)}`);
console.log(
  `Wrote ${outputMedals.length} WebP images to ${path.relative(projectDir, imageDir)}/`,
);
