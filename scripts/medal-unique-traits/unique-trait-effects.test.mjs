import assert from "node:assert/strict";
import test from "node:test";
import { medals } from "../../src/data/medals/medals.ts";
import { medalEffectCatalog } from "../../src/data/medals/medal-effect-catalog.ts";
import {
  uniqueTraitEffectNeedsReview,
  uniqueTraitEffectsByMedalId,
} from "../../src/data/medals/unique-trait-effects.generated.ts";
import { uniqueTraitCategoryIdsByMedalId } from "../../src/data/medals/unique-trait-categories.generated.ts";
import {
  getBuildEffectCapUsage,
  getEffectContributions,
} from "../../src/data/medals/effect-cap-usage.ts";
import {
  createEmptyEquippedExtraTraits,
  setEquippedExtraTrait,
} from "../../src/data/medals/extra-traits.ts";
import { selectableExtraTraits } from "../../src/data/medals/selectable-extra-traits.ts";
import { getActiveTagSetEffects } from "../../src/data/medals/active-tag-set-effects.ts";
import {
  buildUniqueTraitEffectData,
  extractUniqueTraitEffects,
  getUniqueTraitEffectReviewReason,
  summarizeUniqueTraitEffects,
} from "./extract-unique-trait-effects.mjs";

function medal(id) {
  const found = medals.find((candidate) => candidate.id === id);
  assert.ok(found, `Missing Medal fixture: ${id}`);
  return found;
}

test("Damage Dealt and Damage Received values extract as percentages", () => {
  assert.deepEqual(
    extractUniqueTraitEffects("When in the Treasure Area: Increase damage dealt by 5%."),
    [{
      effectId: "damage-dealt-increase",
      value: 5,
      unit: "percent",
      originalText: "When in the Treasure Area: Increase damage dealt by 5%.",
    }],
  );
  assert.equal(
    extractUniqueTraitEffects("When in the Treasure Area: Reduce damage received by 3%.")[0]?.effectId,
    "damage-received-reduction",
  );
  assert.equal(
    extractUniqueTraitEffects("When in the Treasure Area: Reduce damage received by 3%.")[0]?.value,
    3,
  );
});

test("Normal Attack damage remains distinct from general Damage Dealt", () => {
  const effects = extractUniqueTraitEffects("When attacking: Increase Normal Attack damage dealt by 3%.");
  assert.deepEqual(effects.map(({ effectId, value }) => ({ effectId, value })), [{
    effectId: "normal-attack-damage-dealt-increase",
    value: 3,
  }]);
});

test("Skill 1 cooldown extraction contributes to its verified cap group", () => {
  const sourceMedal = medal("tempest-kick-white-thunder");
  const usage = getBuildEffectCapUsage(createEmptyEquippedExtraTraits(), [], [sourceMedal])
    .find(({ capGroup }) => capGroup === "skill1-cooldown-reduction-speed");
  assert.deepEqual(
    { total: usage?.total, cap: usage?.cap, effective: usage?.effective },
    { total: 13, cap: 30, effective: 13 },
  );
  assert.equal(usage?.hasPotentialContributions, true);
});

test("reviewed production OCR fixes extract Bed Rest and Usopp FILM RED safely", () => {
  const bedRest = medal("bed-rest");
  assert.equal(
    bedRest.uniqueTrait,
    "When your team has less Treasure secured: Reduce damage received by 5%.",
  );
  assert.deepEqual(
    extractUniqueTraitEffects(bedRest.uniqueTrait).map(({ effectId, value, unit }) => ({ effectId, value, unit })),
    [{ effectId: "damage-received-reduction", value: 5, unit: "percent" }],
  );

  const usoppFilmRed = medal("usopp-film-red");
  assert.equal(
    usoppFilmRed.uniqueTrait,
    "Reduce the cooldown time of skill 1 by 5%.",
  );
  assert.deepEqual(
    extractUniqueTraitEffects(usoppFilmRed.uniqueTrait).map(({ effectId, value, unit }) => ({ effectId, value, unit })),
    [{ effectId: "skill1-cooldown-reduction-speed", value: 5, unit: "percent" }],
  );
});

test("one Unique Trait can produce two ordered Effects", () => {
  const originalText = "When the gauge is full: Increase damage dealt by 3%. and Reduce damage received by 3%.";
  const effects = extractUniqueTraitEffects(originalText);
  assert.deepEqual(effects.map(({ effectId, value }) => ({ effectId, value })), [
    { effectId: "damage-dealt-increase", value: 3 },
    { effectId: "damage-received-reduction", value: 3 },
  ]);
  assert.ok(effects.every((effect) => effect.originalText === originalText));
});

test("Unique Trait, Extra Trait, and Set Effect share one cap bucket", () => {
  const damage8 = selectableExtraTraits.find((trait) =>
    trait.effectId === "damage-dealt-increase" && trait.value === 8 && trait.unit === "percent"
  );
  assert.ok(damage8);
  let equipped = setEquippedExtraTrait(createEmptyEquippedExtraTraits(), 0, 0, damage8.id);
  equipped = setEquippedExtraTrait(equipped, 0, 1, damage8.id);
  const setEffects = getActiveTagSetEffects(["one", "two", "three"].map((id) => ({
    id,
    tags: [{ id: "worst-generation", name: "Worst Generation" }],
  })));
  const sourceMedal = medal("roger-captain");
  const usage = getBuildEffectCapUsage(equipped, setEffects, [sourceMedal])
    .find(({ capGroup }) => capGroup === "damage-dealt-increase");

  assert.deepEqual(
    { total: usage?.total, cap: usage?.cap, effective: usage?.effective, overflow: usage?.overflow },
    { total: 31, cap: 30, effective: 30, overflow: 1 },
  );
  assert.deepEqual(usage?.contributions.map(({ source }) => source), [
    "extra-trait",
    "extra-trait",
    "tag-set-effect",
    "unique-trait",
  ]);
  assert.equal(usage?.hasPotentialContributions, true);
});

test("Unique Trait Contribution retains Medal label and full originalText for UI details", () => {
  const sourceMedal = medal("roger-captain");
  const contribution = getEffectContributions(
    createEmptyEquippedExtraTraits(),
    [],
    [null, sourceMedal],
  )[0];
  assert.equal(contribution?.source, "unique-trait");
  assert.equal(contribution?.sourceId, `${sourceMedal.id}:1:0`);
  assert.equal(contribution?.sourceLabel, `${sourceMedal.name} · Unique Trait`);
  assert.equal(contribution?.originalText, sourceMedal.uniqueTrait);
  assert.equal(contribution?.isPotential, true);
});

test("same Medal x3 contributes per slot and slot removal drops only that contribution", () => {
  const sourceMedal = medal("gungnir");
  const equipped = createEmptyEquippedExtraTraits();
  const allThree = getBuildEffectCapUsage(equipped, [], [sourceMedal, sourceMedal, sourceMedal])
    .find(({ capGroup }) => capGroup === "damage-dealt-increase");
  assert.equal(allThree?.total, 15);
  assert.equal(allThree?.contributions.length, 3);

  const afterRemoval = getBuildEffectCapUsage(equipped, [], [sourceMedal, null, sourceMedal])
    .find(({ capGroup }) => capGroup === "damage-dealt-increase");
  assert.equal(afterRemoval?.total, 10);
  assert.deepEqual(afterRemoval?.contributions.map(({ sourceId }) => sourceId), [
    `${sourceMedal.id}:0:0`,
    `${sourceMedal.id}:2:0`,
  ]);
});

test("ambiguous and OCR-corrupted supported Effects go to needsReview", () => {
  assert.equal(
    getUniqueTraitEffectReviewReason("When in Treasure: Reduce damage received by"),
    "Damage Received Reduction is missing its numeric value.",
  );
  assert.match(
    getUniqueTraitEffectReviewReason("Reduce the cooldown time ot skill l by 5%. xO"),
    /ambiguous or OCR-corrupted/,
  );
  assert.equal(
    getUniqueTraitEffectReviewReason("When attacking: Recover HP by"),
    "The Effect is missing its numeric value.",
  );
});

test("generated Effect extraction stays in sync with all production Medals", () => {
  const generated = buildUniqueTraitEffectData(medals);
  const summary = summarizeUniqueTraitEffects(medals);
  assert.deepEqual(uniqueTraitEffectsByMedalId, generated.effectsByMedalId);
  assert.deepEqual(uniqueTraitEffectNeedsReview, generated.needsReview);
  assert.equal(Object.keys(uniqueTraitEffectsByMedalId).length, 666);
  for (const sourceMedal of medals) {
    assert.ok(
      uniqueTraitEffectsByMedalId[sourceMedal.id].every(({ originalText }) => originalText === sourceMedal.uniqueTrait),
      `Generated originalText drifted for ${sourceMedal.id}`,
    );
  }
  assert.deepEqual({
    productionUniqueTraits: summary.productionUniqueTraits,
    extractedMedals: summary.extractedMedals,
    extractionCount: summary.extractionCount,
    multipleEffectMedals: summary.multipleEffectMedals,
    needsReviewCount: summary.needsReviewCount,
    unclassifiedCount: summary.unclassifiedCount,
  }, {
    productionUniqueTraits: 666,
    extractedMedals: 579,
    extractionCount: 583,
    multipleEffectMedals: 4,
    needsReviewCount: 10,
    unclassifiedCount: 77,
  });
});

test("every unextracted cap-relevant production Trait is explicitly in needsReview", () => {
  const capRelevantCategories = new Set([
    "cooldown",
    "damage-increase",
    "damage-reduction",
    "capture-speed",
    "hp-increase",
    "atk-increase",
    "def-increase",
    "crit-increase",
    "spd-increase",
    "status-effect-reduction",
  ]);
  const reviewIds = new Set(uniqueTraitEffectNeedsReview.map(({ medalId }) => medalId));
  const unresolvedCapRelevantIds = medals.filter((sourceMedal) =>
    uniqueTraitEffectsByMedalId[sourceMedal.id].length === 0
      && uniqueTraitCategoryIdsByMedalId[sourceMedal.id].some((categoryId) => capRelevantCategories.has(categoryId))
  ).map(({ id }) => id);

  assert.deepEqual(unresolvedCapRelevantIds, []);
  assert.ok(unresolvedCapRelevantIds.every((id) => reviewIds.has(id)));
});

test("every generated effectId is canonical and timed Cannot Stack Effects stay out of Cap Usage", () => {
  const canonicalIds = new Set(medalEffectCatalog.map(({ id }) => id));
  const generatedEffects = Object.values(uniqueTraitEffectsByMedalId).flat();
  assert.ok(generatedEffects.every(({ effectId }) => canonicalIds.has(effectId)));

  const timedMedal = medal("luffy");
  assert.equal(uniqueTraitEffectsByMedalId[timedMedal.id][0]?.effectId, "crit-increase-timed-cannot-stack");
  assert.deepEqual(getBuildEffectCapUsage(createEmptyEquippedExtraTraits(), [], [timedMedal]), []);
});
