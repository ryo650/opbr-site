import assert from "node:assert/strict";
import test from "node:test";
import { validateImporterBatch } from "./batch-validation.mjs";

function medal(id, name = id) {
  return {
    id,
    name,
    category: "character",
    uniqueTrait: "Test trait.",
    tags: [{ id: "test", name: "Test" }],
    nativeTraits: ["atk"],
  };
}

function draft(previousProduction, medals) {
  const eligible = medals.filter((entry) => entry.validationPassed);
  return {
    mode: "incremental",
    merge: { previousProduction },
    medals,
    summary: {
      existingProductionMedals: previousProduction.length,
      batchMedals: medals.length,
      newMedals: eligible.length,
      duplicateMedals: 0,
      conflicts: 0,
      nextProductionMedals: previousProduction.length + eligible.length,
    },
  };
}

test("current importer batch reconciles strictly with production", () => {
  const previousProduction = [medal("existing")];
  const newMedal = {
    ...medal("new"),
    validationPassed: true,
    sources: { details: "IMG_0001.PNG", tags: [], rates: [] },
  };
  const currentDraft = draft(previousProduction, [newMedal]);
  const production = [...previousProduction, medal("new")];

  assert.equal(
    validateImporterBatch(production, currentDraft).batchFieldsMatch,
    true,
  );
});

test("stale importer batch still fails explicit batch reconciliation", () => {
  const previousProduction = [medal("existing")];
  const currentDraft = draft(previousProduction, []);
  const manuallyRepairedProduction = [
    { ...medal("existing"), tags: [{ id: "repaired", name: "Repaired" }] },
  ];

  assert.throws(
    () => validateImporterBatch(manuallyRepairedProduction, currentDraft),
    /Production does not equal previous production plus validated new batch medals/,
  );
});

test("regression drafts cannot be used for importer batch reconciliation", () => {
  const regressionDraft = { ...draft([], []), mode: "regression" };

  assert.throws(
    () => validateImporterBatch([], regressionDraft),
    /not an incremental importer batch/,
  );
});
