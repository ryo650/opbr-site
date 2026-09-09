import {
  mergeProductionMedals,
  productionContent,
  validateMergePlan,
} from "./incremental.mjs";

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message);
  }
}

export function validateImporterBatch(production, draft) {
  if (draft.mode !== "incremental") {
    throw new Error("Draft is not an incremental importer batch");
  }
  if (!draft.merge?.previousProduction) {
    throw new Error("Draft does not contain an incremental production snapshot");
  }
  if (!Array.isArray(draft.medals)) {
    throw new Error("Draft does not contain a medal batch");
  }

  const eligibleBatch = draft.medals
    .filter((medal) => medal.validationPassed)
    .map((medal) => ({ ...productionContent(medal), sources: medal.sources }));
  const plan = mergeProductionMedals(
    draft.merge.previousProduction,
    eligibleBatch,
  );
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
    assertEqual(
      draft.summary?.[field],
      expected,
      `Draft summary ${field} is incorrect`,
    );
  }

  return {
    validationScope: "importer-batch",
    previousProduction: plan.existing.length,
    batchMedals: draft.medals.length,
    newMedals: plan.newMedals.length,
    duplicateSkipped: plan.duplicates.length,
    mergedProduction: production.length,
    existingProductionPreserved: true,
    batchFieldsMatch: true,
  };
}
