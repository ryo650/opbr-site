import assert from "node:assert/strict";
import test from "node:test";
import { extraTraitCatalog, extraTraitCatalogNeedsReview } from "../../src/data/medals/extra-traits.generated.ts";
import { supplementalExtraTraits } from "../../src/data/medals/extra-traits-supplemental.ts";
import {
  excludedRawExtraTraits,
  extraTraitSourceMetadataById,
  mergeCanonicalExtraTraits,
  selectableExtraTraitMissingEvidence,
  selectableExtraTraits,
} from "../../src/data/medals/selectable-extra-traits.ts";
import { formatExtraTraitValue } from "../../src/data/medals/extra-traits.ts";
import { effectCaps } from "../../src/data/medals/effect-caps.ts";

test("Raw catalog remains complete and retains low-rarity definitions", () => {
  assert.equal(extraTraitCatalog.length, 96);
  assert.ok(extraTraitCatalog.some((definition) =>
    definition.effectId === "hp-increase" && definition.value === 6.5,
  ));
});

test("selectable stat policy includes practical and Special Transfer Item values", () => {
  for (const effectId of ["hp-increase", "atk-increase", "def-increase"]) {
    const values = new Set(selectableExtraTraits
      .filter((definition) => definition.effectId === effectId && definition.unit === "percent")
      .map((definition) => definition.value));
    assert.deepEqual([...values].sort((left, right) => left - right), [12, 14, 18, 24]);
  }
  assert.deepEqual(
    selectableExtraTraits
      .filter(({ effectId, unit }) => effectId === "crit-increase" && unit === "percent")
      .map(({ value }) => value)
      .sort((left, right) => left - right),
    [12, 14, 18],
  );
  assert.ok(!selectableExtraTraits.some((definition) =>
    ["hp-increase", "atk-increase", "def-increase", "crit-increase"].includes(definition.effectId)
      && definition.unit === "percent"
      && [6.5, 7.5, 16].includes(definition.value),
  ));
});

test("verified fixed-value supplemental definitions are selectable", () => {
  assert.deepEqual(
    supplementalExtraTraits
      .filter(({ unit }) => unit === "points")
      .map(({ effectId, value, unit }) => [effectId, value, unit]),
    [
      ["hp-increase", 640, "points"],
      ["atk-increase", 160, "points"],
      ["def-increase", 160, "points"],
    ],
  );
  assert.ok(supplementalExtraTraits.every((supplemental) =>
    selectableExtraTraits.some((selectable) => selectable.id === supplemental.id),
  ));
  assert.equal(formatExtraTraitValue(supplementalExtraTraits[0]), "+640 Pts");
});

test("same canonical definition merges sources instead of duplicating", () => {
  const definition = supplementalExtraTraits[0];
  const merged = mergeCanonicalExtraTraits([
    { definition, metadata: [{ source: "medal-rate", evidenceRefs: ["rate-a"] }] },
    { definition, metadata: [{ source: "transfer-item", evidenceRefs: ["transfer-a"] }] },
  ]);
  assert.equal(merged.definitions.length, 1);
  assert.deepEqual(merged.sourceMetadataById[definition.id].map(({ source }) => source), [
    "medal-rate",
    "transfer-item",
  ]);
});

test("Builder merges condition variants by effect, value, and unit", () => {
  const base = supplementalExtraTraits[0];
  const conditioned = {
    ...base,
    id: `${base.id}-when-runner`,
    condition: { kind: "text", description: "When the equipped character is a Runner" },
  };
  const merged = mergeCanonicalExtraTraits([
    { definition: base, metadata: [{ source: "transfer-item", evidenceRefs: ["transfer-a"] }] },
    { definition: conditioned, metadata: [{ source: "special-transfer-item", evidenceRefs: ["transfer-b"] }] },
  ]);
  assert.equal(merged.definitions.length, 1);
  assert.equal(merged.definitions[0].condition, undefined);
  assert.deepEqual(merged.sourceMetadataById[base.id].map(({ source }) => source), [
    "transfer-item",
    "special-transfer-item",
  ]);
});

test("Selectable catalog is conditionless and unique by effect, value, and unit", () => {
  assert.equal(selectableExtraTraits.length, 25);
  assert.ok(selectableExtraTraits.every((definition) => definition.condition === undefined));
  const tupleKeys = selectableExtraTraits.map(({ effectId, value, unit }) => `${effectId}:${value}:${unit}`);
  assert.equal(new Set(tupleKeys).size, tupleKeys.length);
  assert.equal(extraTraitCatalog.filter((definition) => definition.condition).length, 80);
});

test("verified HP/ATK/DEF 24% are Selectable but CRIT 24% remains absent", () => {
  assert.equal(extraTraitCatalogNeedsReview.length, 3);
  assert.ok(!selectableExtraTraits.some((definition) => definition.value === 1.6));
  assert.ok(!selectableExtraTraits.some((definition) =>
    definition.condition?.kind === "text" && definition.condition.description.includes("Ex-Roger, Pirates"),
  ));
  assert.deepEqual(
    selectableExtraTraits
      .filter(({ value }) => value === 24)
      .map(({ effectId }) => effectId)
      .sort(),
    ["atk-increase", "def-increase", "hp-increase"],
  );
  assert.ok(!selectableExtraTraits.some(({ effectId, value }) => effectId === "crit-increase" && value === 24));
  assert.equal(selectableExtraTraitMissingEvidence.length, 0);
  for (const effectId of ["hp-increase", "atk-increase", "def-increase"]) {
    const definition = selectableExtraTraits.find((candidate) => candidate.effectId === effectId && candidate.value === 24);
    assert.ok(definition);
    assert.equal(definition.condition, undefined);
    assert.deepEqual(extraTraitSourceMetadataById[definition.id].map(({ source }) => source), ["special-transfer-item"]);
  }
});

test("Damage Dealt and Skill cooldown practical values stay explicit", () => {
  assert.deepEqual(
    [...new Set(selectableExtraTraits.filter(({ effectId }) => effectId === "damage-dealt-increase").map(({ value }) => value))].sort((left, right) => left - right),
    [3, 6, 8],
  );
  assert.deepEqual(
    selectableExtraTraits.filter(({ effectId }) => effectId === "damage-received-reduction").map(({ value }) => value),
    [3],
  );
  assert.deepEqual(
    selectableExtraTraits.filter(({ effectId }) => effectId === "skill1-cooldown-reduction-speed").map(({ value }) => value),
    [3],
  );
  assert.deepEqual(
    selectableExtraTraits.filter(({ effectId }) => effectId === "skill2-cooldown-reduction-speed").map(({ value }) => value),
    [3],
  );
  assert.equal(effectCaps["skill1-cooldown-reduction-speed"]?.value, 30);
  assert.equal(effectCaps["skill2-cooldown-reduction-speed"]?.value, 30);
  assert.ok(excludedRawExtraTraits.some(({ definition, reason }) =>
    definition.effectId === "skill2-cooldown-reduction-speed" && reason === "low-rarity / not practical",
  ));
  assert.deepEqual(
    extraTraitSourceMetadataById["hp-increase-640-points-unconditional"].map(({ source }) => source),
    ["transfer-item"],
  );
});

test("Supplemental definitions never duplicate a Raw effect/value/unit/condition definition", () => {
  const signature = (definition) => JSON.stringify({
    effectId: definition.effectId,
    value: definition.value,
    unit: definition.unit,
    condition: definition.condition ?? null,
  });
  const rawSignatures = new Set(extraTraitCatalog.map(signature));
  assert.deepEqual(
    supplementalExtraTraits.filter((definition) => rawSignatures.has(signature(definition))),
    [],
  );
});

test("Selectable status reduction data contains only verified Stun 36%", () => {
  const statusReductions = selectableExtraTraits.filter(({ effectId }) => effectId.endsWith("-duration-reduction"));
  assert.deepEqual(
    statusReductions.map(({ effectId, value, capGroup }) => ({ effectId, value, capGroup })),
    [{
      effectId: "stun-duration-reduction",
      value: 36,
      capGroup: "stun-duration-reduction",
    }],
  );
  assert.equal(effectCaps["stun-duration-reduction"]?.value, 70);
  assert.ok(!supplementalExtraTraits.some(({ effectId }) => effectId.endsWith("-duration-reduction")));
});
