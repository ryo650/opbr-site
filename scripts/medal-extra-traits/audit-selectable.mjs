import {
  excludedRawExtraTraits,
  extraTraitCatalog,
  extraTraitCatalogNeedsReview,
  extraTraitSourceMetadataById,
  selectableExtraTraitMissingEvidence,
  selectableExtraTraits,
  supplementalExtraTraits,
} from "../../src/data/medals/extra-traits.ts";

function conditionText(definition) {
  return definition.condition?.kind === "text"
    ? definition.condition.description
    : "Unconditional";
}

function valueText(definition) {
  if (definition.unit === "percent") return `${definition.value}%`;
  if (definition.unit === "points") return `${definition.value} Pts`;
  return `${definition.value} ${definition.unit}`;
}

function sourceText(definition) {
  return (extraTraitSourceMetadataById[definition.id] ?? [])
    .map(({ source, evidenceRefs }) => `${source} [${evidenceRefs.join(", ")}]`)
    .join("; ") || "missing";
}

function groupByEffect(definitions) {
  const groups = new Map();
  definitions.forEach((definition) => {
    const key = `${definition.label} (${definition.unit})`;
    const group = groups.get(key) ?? [];
    group.push(definition);
    groups.set(key, group);
  });
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
}

function selectableTuple(definition) {
  return `${definition.effectId}:${definition.value}:${definition.unit}`;
}

console.log("=== SELECTABLE ===");
for (const [effect, definitions] of groupByEffect(selectableExtraTraits)) {
  console.log(`\n${effect}`);
  definitions.forEach((definition) => {
    console.log(`- ${definition.label} | ${valueText(definition)} | ${definition.unit} | ${conditionText(definition)} | sources: ${sourceText(definition)} | id: ${definition.id}`);
  });
}

console.log("\n=== EXCLUDED RAW DEFINITIONS ===");
for (const { definition, reason } of excludedRawExtraTraits) {
  console.log(`- ${definition.label} | ${valueText(definition)} | ${definition.unit} | ${conditionText(definition)} | reason: ${reason} | id: ${definition.id}`);
}

console.log("\n=== RAW CONDITION VARIANTS -> SELECTABLE ===");
const selectableByTuple = new Map(selectableExtraTraits.map((definition) => [selectableTuple(definition), definition]));
const rawVariantsByTuple = new Map();
extraTraitCatalog.forEach((definition) => {
  const key = selectableTuple(definition);
  if (!selectableByTuple.has(key)) return;
  const variants = rawVariantsByTuple.get(key) ?? [];
  variants.push(definition);
  rawVariantsByTuple.set(key, variants);
});
for (const [tuple, definitions] of [...rawVariantsByTuple.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  const selectable = selectableByTuple.get(tuple);
  const rawConditions = definitions.map(conditionText);
  console.log(`- ${selectable.label} | ${valueText(selectable)} | Raw definitions: ${definitions.length} | Raw conditions: ${rawConditions.join("; ")} | Selectable: 1 conditionless definition | id: ${selectable.id}`);
}

console.log("\n=== SUPPLEMENTAL ===");
for (const definition of supplementalExtraTraits) {
  console.log(`- ${definition.label} | ${valueText(definition)} | ${definition.unit} | ${conditionText(definition)} | sources: ${sourceText(definition)} | id: ${definition.id}`);
}

console.log("\n=== NEEDS REVIEW / MISSING ===");
for (const issue of extraTraitCatalogNeedsReview) {
  console.log(`- Raw needsReview | ${issue.text} | source: ${issue.sourceRef} | reason: ${issue.reason}`);
}
for (const missing of selectableExtraTraitMissingEvidence) {
  const value = missing.value === null ? "unknown value" : `${missing.value}${missing.unit === "percent" ? "%" : ` ${missing.unit}`}`;
  console.log(`- Missing | ${missing.label} | ${value} | expected source: ${missing.expectedSource} | missing: ${missing.missing.join(", ")} | reason: ${missing.reason}`);
}

console.log("\n=== SUMMARY ===");
console.log(`Raw definitions: ${extraTraitCatalog.length}`);
console.log(`Supplemental definitions: ${supplementalExtraTraits.length}`);
console.log(`Selectable definitions: ${selectableExtraTraits.length}`);
console.log(`Selectable conditionless definitions: ${selectableExtraTraits.filter((definition) => !definition.condition).length}`);
console.log(`Raw conditional definitions: ${extraTraitCatalog.filter((definition) => definition.condition).length}`);
console.log(`Excluded raw definitions: ${excludedRawExtraTraits.length}`);
console.log(`Raw needsReview: ${extraTraitCatalogNeedsReview.length}`);
console.log(`Missing evidence: ${selectableExtraTraitMissingEvidence.length}`);
console.log(`Needs review / missing total: ${extraTraitCatalogNeedsReview.length + selectableExtraTraitMissingEvidence.length}`);

const excludedDefinitions = excludedRawExtraTraits.map(({ definition }) => definition);
const effectKeys = new Set([
  ...groupByEffect(selectableExtraTraits).map(([effect]) => effect),
  ...groupByEffect(excludedDefinitions).map(([effect]) => effect),
]);
for (const effect of [...effectKeys].sort()) {
  const selectable = selectableExtraTraits.filter((definition) => `${definition.label} (${definition.unit})` === effect);
  const excluded = excludedRawExtraTraits.filter(({ definition }) => `${definition.label} (${definition.unit})` === effect);
  const selectableValues = [...new Set(selectable.map(valueText))].join(", ") || "none";
  const excludedValues = [...new Set(excluded.map(({ definition }) => valueText(definition)))].join(", ") || "none";
  const reasons = [...new Set(excluded.map(({ reason }) => reason))].join(", ") || "none";
  console.log(`\n${effect}`);
  console.log(`  Selectable definitions: ${selectable.length}`);
  console.log(`  Selectable values: ${selectableValues}`);
  console.log(`  Excluded definitions: ${excluded.length}`);
  console.log(`  Excluded values: ${excludedValues}`);
  console.log(`  Excluded reasons: ${reasons}`);
  if (effect === "CRIT Increase (percent)") {
    const special24 = selectable.filter((definition) => definition.value === 24);
    console.log(`  Special 24%: ${special24.length ? `${special24.length} definition(s)` : "none"}`);
  }
}
