import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertInputNotEmpty,
  mergeProductionMedals,
  productionContent,
  publishAtomic,
  readProductionMedals,
  validateMergePlan,
} from "./incremental.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const production = await readProductionMedals(
  path.join(projectDir, "src/data/medals/medals.ts"),
);

assert.ok(production.length > 0, "test baseline must contain production medals");
const baselineCount = production.length;

function newMedal(overrides = {}) {
  return {
    id: "incremental-test-medal",
    name: "Incremental Test Medal",
    category: "character",
    uniqueTrait: "When testing: Preserve production data.",
    tags: [
      { id: "second-tag", name: "Second Tag" },
      { id: "first-tag", name: "First Tag" },
    ],
    nativeTraits: ["hp", "atk"],
    nativeEffects: ["skill2-cooldown-reduction-speed"],
    statusReductions: ["stun"],
    sources: {
      details: "IMG_9000.PNG",
      tag: "IMG_9001.PNG",
      rates: ["IMG_9002.PNG"],
    },
    ...overrides,
  };
}

test("A. empty input stops safely", () => {
  assert.throws(() => assertInputNotEmpty([]), /No input screenshots found/);
});

test("B. a new-only batch appends after existing production", () => {
  const incoming = newMedal();
  const plan = mergeProductionMedals(production, [incoming]);
  validateMergePlan(plan);
  assert.equal(plan.existing.length, baselineCount);
  assert.equal(plan.newMedals.length, 1);
  assert.equal(plan.duplicates.length, 0);
  assert.equal(plan.conflicts.length, 0);
  assert.equal(plan.merged.length, baselineCount + 1);
  assert.deepEqual(plan.merged.slice(0, baselineCount), production);
  assert.deepEqual(plan.merged[baselineCount], productionContent(incoming));
});

test("C. a semantically identical production medal is skipped", () => {
  const existing = production[0];
  const reordered = {
    ...structuredClone(existing),
    tags: [...existing.tags].reverse(),
    nativeTraits: [...existing.nativeTraits].reverse(),
    ...(existing.nativeEffects
      ? { nativeEffects: [...existing.nativeEffects].reverse() }
      : {}),
    ...(existing.statusReductions
      ? { statusReductions: [...existing.statusReductions].reverse() }
      : {}),
    sources: newMedal().sources,
  };
  const plan = mergeProductionMedals(production, [reordered]);
  validateMergePlan(plan);
  assert.equal(plan.newMedals.length, 0);
  assert.equal(plan.duplicates.length, 1);
  assert.equal(plan.conflicts.length, 0);
  assert.deepEqual(plan.merged, production);
});

test("D. same production ID with different content is a blocking conflict", () => {
  const changed = {
    ...structuredClone(production[0]),
    uniqueTrait: "Different content must never overwrite production.",
    sources: newMedal().sources,
  };
  const plan = mergeProductionMedals(production, [changed]);
  assert.equal(plan.conflicts.length, 1);
  assert.deepEqual(plan.conflicts[0].differingFields, ["uniqueTrait"]);
  assert.deepEqual(plan.merged, production);
  assert.throws(() => validateMergePlan(plan), /medal ID conflict/);
});

test("E. mixed new and identical duplicate batch appends only the new ID", () => {
  const duplicate = {
    ...structuredClone(production[0]),
    sources: newMedal().sources,
  };
  const plan = mergeProductionMedals(production, [duplicate, newMedal()]);
  validateMergePlan(plan);
  assert.equal(plan.newMedals.length, 1);
  assert.equal(plan.duplicates.length, 1);
  assert.equal(plan.merged.length, baselineCount + 1);
});

test("F. needsReview medals are excluded while validated medals remain eligible", () => {
  const drafts = [
    { ...newMedal(), validationPassed: true, needsReview: false },
    {
      ...newMedal({ id: "needs-review-medal", name: "Needs Review Medal" }),
      validationPassed: false,
      needsReview: true,
    },
  ];
  const eligible = drafts.filter((medal) => medal.validationPassed);
  const plan = mergeProductionMedals(production, eligible);
  validateMergePlan(plan);
  assert.deepEqual(plan.newMedals.map((medal) => medal.id), [
    "incremental-test-medal",
  ]);
  assert.equal(plan.merged.length, baselineCount + 1);
});

test("G. a failure before data commit rolls back added WebPs", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "opbr-incremental-test-"));
  const dataDir = path.join(root, "src/data/medals");
  const imageDir = path.join(root, "public/medals");
  const stageDir = path.join(root, "stage");
  const dataPath = path.join(dataDir, "medals.ts");
  const existingImage = path.join(imageDir, "existing.webp");
  const newImage = path.join(imageDir, "new.webp");
  const stagedDataPath = path.join(stageDir, "medals.ts");
  const stagedImagePath = path.join(stageDir, "new.webp");

  try {
    await mkdir(dataDir, { recursive: true });
    await mkdir(imageDir, { recursive: true });
    await mkdir(stageDir, { recursive: true });
    await writeFile(dataPath, "original production data");
    await writeFile(existingImage, "original image");
    await writeFile(stagedDataPath, "replacement production data");
    await writeFile(stagedImagePath, "new image");

    await assert.rejects(
      publishAtomic({
        stagedDataPath,
        stagedImages: [
          {
            stagedPath: stagedImagePath,
            productionPath: newImage,
          },
        ],
        dataPath,
        imageDir,
        failBeforeDataCommit: true,
      }),
      /Intentional failure/,
    );

    assert.equal(await readFile(dataPath, "utf8"), "original production data");
    assert.equal(await readFile(existingImage, "utf8"), "original image");
    await assert.rejects(readFile(newImage), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
