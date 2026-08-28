import { copyFile, mkdir, readFile, rename, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { comparableMedal, differingFields } from "./dedupe.mjs";

export function productionContent(medal) {
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

export function comparableProductionContent(medal) {
  return comparableMedal(productionContent(medal));
}

export function differingProductionFields(left, right) {
  const comparableLeft = comparableProductionContent(left);
  const comparableRight = comparableProductionContent(right);
  return differingFields(comparableLeft, comparableRight);
}

export function parseGeneratedMedals(source) {
  const match = source.match(
    /export const medals = ([\s\S]+) as const satisfies readonly Medal\[\];/,
  );
  if (!match) throw new Error("Could not parse generated medals.ts");
  const medals = JSON.parse(match[1]);
  if (!Array.isArray(medals)) {
    throw new Error("Generated medals.ts does not contain a medal array");
  }
  return medals;
}

export async function readProductionMedals(dataPath) {
  return parseGeneratedMedals(await readFile(dataPath, "utf8"));
}

export function assertInputNotEmpty(items) {
  if (items.length === 0) throw new Error("No input screenshots found");
}

export function mergeProductionMedals(existingProduction, batchMedals) {
  const existingById = new Map();
  for (const medal of existingProduction) {
    if (existingById.has(medal.id)) {
      throw new Error(`Existing production has duplicate medal ID: ${medal.id}`);
    }
    existingById.set(medal.id, medal);
  }

  const newMedals = [];
  const duplicates = [];
  const conflicts = [];
  const acceptedBatchById = new Map();

  for (const medal of batchMedals) {
    const existing = existingById.get(medal.id);
    const accepted = acceptedBatchById.get(medal.id);
    const comparisonTarget = existing ?? accepted;

    if (!comparisonTarget) {
      acceptedBatchById.set(medal.id, medal);
      newMedals.push(medal);
      continue;
    }

    const differingFields = differingProductionFields(comparisonTarget, medal);
    if (differingFields.length === 0) {
      duplicates.push({ medal, duplicateOf: comparisonTarget });
      continue;
    }

    conflicts.push({
      id: medal.id,
      existing: productionContent(comparisonTarget),
      incoming: productionContent(medal),
      differingFields,
      sourceScreenshots: medal.sources ?? null,
      scope: existing ? "production" : "batch",
    });
  }

  return {
    existing: existingProduction,
    newMedals,
    duplicates,
    conflicts,
    merged: [...existingProduction, ...newMedals.map(productionContent)],
  };
}

export function validateMergePlan(plan) {
  const existingIds = plan.existing.map((medal) => medal.id);
  const mergedIds = plan.merged.map((medal) => medal.id);
  if (plan.conflicts.length > 0) {
    throw new Error(
      `Cannot publish a merge with ${plan.conflicts.length} medal ID conflict(s)`,
    );
  }
  if (new Set(existingIds).size !== existingIds.length) {
    throw new Error("Existing production medal IDs are not unique");
  }
  if (new Set(mergedIds).size !== mergedIds.length) {
    throw new Error("Merged production medal IDs are not unique");
  }
  if (plan.merged.length !== plan.existing.length + plan.newMedals.length) {
    throw new Error("Merged production count is inconsistent");
  }
  for (let index = 0; index < plan.existing.length; index += 1) {
    if (
      JSON.stringify(plan.merged[index]) !==
      JSON.stringify(plan.existing[index])
    ) {
      throw new Error(`Existing production changed at index ${index}`);
    }
  }
}

export async function publishAtomic({
  stagedDataPath,
  stagedImages,
  dataPath,
  imageDir,
  failBeforeDataCommit = false,
}) {
  const publishedImages = [];
  await mkdir(imageDir, { recursive: true });
  try {
    for (const image of stagedImages) {
      await copyFile(
        image.stagedPath,
        image.productionPath,
        constants.COPYFILE_EXCL,
      );
      publishedImages.push(image.productionPath);
    }
    if (failBeforeDataCommit) {
      throw new Error("Intentional failure before medals.ts commit");
    }
    await rename(stagedDataPath, dataPath);
  } catch (error) {
    await Promise.all(
      publishedImages.map((file) => rm(file, { force: true })),
    );
    throw error;
  }
}
