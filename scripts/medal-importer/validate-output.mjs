import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");

function readJson(file) {
  return JSON.parse(readFileSync(path.join(importerDir, file), "utf8"));
}

function productionFields(medal) {
  return {
    id: medal.id,
    name: medal.name,
    category: medal.category,
    uniqueTrait: medal.uniqueTrait,
    tags: medal.tags,
    nativeTraits: medal.nativeTraits,
    ...(medal.statusReductions?.length
      ? { statusReductions: medal.statusReductions }
      : {}),
  };
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message);
  }
}

const productionText = readFileSync(
  path.join(projectDir, "src/data/medals/medals.ts"),
  "utf8",
);
const productionMatch = productionText.match(
  /export const medals = ([\s\S]+) as const satisfies readonly Medal\[\];/,
);
if (!productionMatch) throw new Error("Could not parse generated medals.ts");

const production = JSON.parse(productionMatch[1]);
const draft = readJson("draft-medals.json");
const review = readJson("reviewed-medals.json");
const eligibleDraft = draft.medals
  .filter((medal) => medal.validationPassed)
  .map(productionFields);
assertEqual(
  production,
  eligibleDraft,
  "Production medals do not match validationPassed Draft fields",
);

const ids = production.map((medal) => medal.id);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate medal IDs found");

const reviewed = review.medals.map(productionFields);
const reviewedIds = new Set(reviewed.map((medal) => medal.id));
const productionFixtures = production.filter((medal) => reviewedIds.has(medal.id));
assertEqual(
  productionFixtures,
  reviewed,
  "Existing regression fixtures changed during generation",
);

const imageDir = path.join(projectDir, "public/medals");
const imageFiles = readdirSync(imageDir)
  .filter((file) => file.endsWith(".webp"))
  .sort();
const expectedImages = ids.map((id) => `${id}.webp`).sort();
assertEqual(imageFiles, expectedImages, "WebP filenames do not match medal IDs");

for (const file of imageFiles) {
  const metadata = execFileSync(
    "/usr/bin/env",
    ["magick", "identify", "-format", "%m %w %h", path.join(imageDir, file)],
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
      productionMedals: production.length,
      existingFixtures: productionFixtures.length,
      newMedals: production.length - productionFixtures.length,
      uniqueIds: new Set(ids).size,
      webpFiles: imageFiles.length,
      webpSize: "200x200",
      draftFieldMatch: true,
      existingFixtureMatch: true,
      targetedRetryValuesMatch: true,
    },
    null,
    2,
  ),
);
