import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  mergeProductionMedals,
  parseGeneratedMedals,
  productionContent,
  validateMergePlan,
} from "./incremental.mjs";
import {
  renderStatusEffectTypes,
  validateProductionStatusEffects,
  validateStatusEffectCatalog,
} from "./status-effects.mjs";
import {
  renderNativeEffectTypes,
  validateNativeEffectCatalog,
  validateProductionNativeEffects,
} from "./native-effects.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const magickCommand = ["/opt/homebrew/bin/magick", "/usr/local/bin/magick"].find(
  (candidate) => {
    try {
      execFileSync(candidate, ["-version"], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  },
);
if (!magickCommand) throw new Error("Required command not found: magick");

function readJson(file) {
  return JSON.parse(readFileSync(path.join(importerDir, file), "utf8"));
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message);
  }
}

const production = parseGeneratedMedals(
  readFileSync(path.join(projectDir, "src/data/medals/medals.ts"), "utf8"),
);
const draft = readJson("draft-medals.json");
const review = readJson("reviewed-medals.json");
const statusEffectCatalog = validateStatusEffectCatalog(
  readJson("status-effects.json"),
);
const nativeEffectCatalog = validateNativeEffectCatalog(
  readJson("native-effects.json"),
);
const generatedStatusEffectTypesPath = path.join(
  projectDir,
  "src/data/medals/status-effects.generated.ts",
);
assertEqual(
  readFileSync(generatedStatusEffectTypesPath, "utf8"),
  renderStatusEffectTypes(statusEffectCatalog),
  "Generated StatusEffectType is out of sync with status-effects.json",
);
const generatedNativeEffectTypesPath = path.join(
  projectDir,
  "src/data/medals/native-effects.generated.ts",
);
assertEqual(
  readFileSync(generatedNativeEffectTypesPath, "utf8"),
  renderNativeEffectTypes(nativeEffectCatalog),
  "Generated NativeEffectType is out of sync with native-effects.json",
);
if (!draft.merge?.previousProduction) {
  throw new Error("Draft does not contain an incremental production snapshot");
}

const eligibleBatch = draft.medals
  .filter((medal) => medal.validationPassed)
  .map((medal) => ({ ...productionContent(medal), sources: medal.sources }));
const plan = mergeProductionMedals(draft.merge.previousProduction, eligibleBatch);
validateMergePlan(plan);

assertEqual(
  production,
  plan.merged,
  "Production does not equal previous production plus validated new batch medals",
);
assertEqual(
  production.slice(0, plan.existing.length),
  plan.existing,
  "Existing production content or order changed",
);
assertEqual(
  plan.newMedals.map(productionContent),
  production.slice(plan.existing.length),
  "New production suffix does not match validated batch fields",
);

const expectedSummary = {
  existingProductionMedals: plan.existing.length,
  batchMedals: draft.medals.length,
  newMedals: plan.newMedals.length,
  duplicateMedals: plan.duplicates.length,
  conflicts: plan.conflicts.length,
  nextProductionMedals: plan.merged.length,
};
for (const [field, expected] of Object.entries(expectedSummary)) {
  assertEqual(draft.summary[field], expected, `Draft summary ${field} is incorrect`);
}

const ids = production.map((medal) => medal.id);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate medal IDs found");

validateProductionStatusEffects(production, statusEffectCatalog);
validateProductionNativeEffects(production, nativeEffectCatalog);

const reviewed = review.medals.map(productionContent);
const productionById = new Map(production.map((medal) => [medal.id, medal]));
for (const fixture of reviewed) {
  assertEqual(
    productionById.get(fixture.id),
    fixture,
    `Regression fixture changed in production: ${fixture.id}`,
  );
}

const imageDir = path.join(projectDir, "public/medals");
const imageFiles = readdirSync(imageDir)
  .filter((file) => file.endsWith(".webp"))
  .sort();
const expectedImages = ids.map((id) => `${id}.webp`).sort();
assertEqual(imageFiles, expectedImages, "WebP filenames do not match medal IDs");

for (const file of imageFiles) {
  const metadata = execFileSync(
    magickCommand,
    ["identify", "-format", "%m %w %h", path.join(imageDir, file)],
    { encoding: "utf8" },
  ).trim();
  if (metadata !== "WEBP 200 200") {
    throw new Error(`${file}: expected WEBP 200 200, found ${metadata}`);
  }
}

const byName = new Map(production.map((medal) => [medal.name, medal]));
const targetedValues = {
  "Don Krieg Medal": {
    uniqueTrait:
      "When an ally is KO'd (not including you): Reduce the cooldown time of Skill 1 by 3%.",
    nativeTraits: ["atk", "crit"],
    statusReductions: ["poison"],
  },
  "Buggy Medal": {
    uniqueTrait:
      "When your allies are near the Treasure area where you are at: Boost the cooldown reduction speed of Skill 1 by 10%.",
  },
  "Saw Medal": {
    uniqueTrait:
      "After KOing an enemy, CRIT: Boosted by 120% for 20 second(s). (Cannot Stack)",
  },
  "Butchie Medal": { statusReductions: ["tremor"] },
  "Koby Medal": { statusReductions: ["stun"] },
  "Alvida Medal": { statusReductions: ["stun"] },
};

for (const [name, expected] of Object.entries(targetedValues)) {
  const actual = byName.get(name);
  if (!actual) throw new Error(`Missing target medal: ${name}`);
  for (const [field, value] of Object.entries(expected)) {
    assertEqual(actual[field], value, `${name}: generated ${field} is incorrect`);
  }
}

console.log(
  JSON.stringify(
    {
      previousProduction: plan.existing.length,
      batchMedals: draft.medals.length,
      newMedals: plan.newMedals.length,
      duplicateSkipped: plan.duplicates.length,
      mergedProduction: production.length,
      uniqueIds: new Set(ids).size,
      existingProductionPreserved: true,
      batchFieldsMatch: true,
      regressionFixturesPreserved: reviewed.length,
      webpFiles: imageFiles.length,
      webpSize: "200x200",
      targetedRetryValuesMatch: true,
      approvedStatusEffects: statusEffectCatalog.length,
      productionStatusEffectsCatalogued: true,
      generatedStatusEffectTypeCurrent: true,
      approvedNativeEffects: nativeEffectCatalog.length,
      productionNativeEffectsCatalogued: true,
      generatedNativeEffectTypeCurrent: true,
    },
    null,
    2,
  ),
);
