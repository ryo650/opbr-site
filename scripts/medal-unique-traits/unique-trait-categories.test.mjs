import assert from "node:assert/strict";
import test from "node:test";
import { medals } from "../../src/data/medals/medals.ts";
import {
  uniqueTraitCategoryIdsByMedalId,
  uniqueTraitCategoryNeedsReview,
} from "../../src/data/medals/unique-trait-categories.generated.ts";
import {
  matchesUniqueTraitFilters,
  uniqueTraitCategoryCatalog,
} from "../../src/data/medals/unique-trait-categories.ts";
import {
  buildUniqueTraitCategoryData,
  classifyUniqueTrait,
} from "./classify-unique-traits.mjs";

function categoriesFor(medalId) {
  return new Set(uniqueTraitCategoryIdsByMedalId[medalId] ?? []);
}

function filterMedals(categoryIds, matchMode, textQuery = "") {
  const normalizedTextQuery = textQuery.trim().toLocaleLowerCase();
  return medals.filter((medal) => matchesUniqueTraitFilters(
    medal.uniqueTrait.toLocaleLowerCase(),
    categoriesFor(medal.id),
    categoryIds,
    matchMode,
    normalizedTextQuery,
  ));
}

test("generated category data stays in sync with all production Medals", () => {
  const generated = buildUniqueTraitCategoryData(medals);

  assert.deepEqual(
    uniqueTraitCategoryIdsByMedalId,
    generated.categoryIdsByMedalId,
  );
  assert.deepEqual(uniqueTraitCategoryNeedsReview, generated.needsReview);
  assert.equal(Object.keys(uniqueTraitCategoryIdsByMedalId).length, medals.length);
  assert.equal(uniqueTraitCategoryNeedsReview.length, 9);
});

test("the catalog contains exactly the in-game canonical categories", () => {
  assert.deepEqual(
    uniqueTraitCategoryCatalog.map(({ label }) => label),
    [
      "Cooldown",
      "Damage Increase",
      "Damage Reduction",
      "HP Recovery",
      "Capture Speed",
      "Treasure Gauge",
      "HP Increase",
      "ATK Increase",
      "DEF Increase",
      "CRIT Increase",
      "Status Effect Reduction",
      "Status Effect Nullification",
      "Status Effect Infliction",
      "Power Up/Down",
      "SPD Increase",
      "Skill 1",
      "Skill 2",
    ],
  );
});

test("representative Damage Increase, Damage Reduction, Skill 1, and Skill 2 traits classify correctly", () => {
  assert.ok(categoriesFor("roger-captain").has("damage-increase"));
  assert.ok(categoriesFor("corazon").has("damage-reduction"));
  assert.ok(categoriesFor("tempest-kick-white-thunder").has("skill-1"));
  assert.ok(categoriesFor("future-where-im-the-most-free").has("skill-2"));
});

test("Match Any returns the union and Match All returns the intersection", () => {
  const selected = ["damage-increase", "damage-reduction"];
  const anyMatches = filterMedals(selected, "any");
  const allMatches = filterMedals(selected, "all");

  assert.ok(anyMatches.length > allMatches.length);
  assert.ok(anyMatches.some((medal) => medal.id === "roger-captain"));
  assert.ok(anyMatches.some((medal) => medal.id === "corazon"));
  assert.ok(allMatches.length > 0);
  assert.ok(allMatches.every((medal) => {
    const categories = categoriesFor(medal.id);
    return categories.has("damage-increase") && categories.has("damage-reduction");
  }));
});

test("one selected category has identical Match Any and Match All results", () => {
  assert.deepEqual(
    filterMedals(["damage-reduction"], "any").map(({ id }) => id),
    filterMedals(["damage-reduction"], "all").map(({ id }) => id),
  );
});

test("category filtering combines with Unique Trait text search", () => {
  const matches = filterMedals(
    ["damage-increase"],
    "any",
    "Treasure area",
  );

  assert.ok(matches.length > 0);
  assert.ok(matches.every((medal) => (
    classifyUniqueTrait(medal.uniqueTrait).includes("damage-increase")
    && medal.uniqueTrait.toLocaleLowerCase().includes("treasure area")
  )));
});

test("cleared Unique Trait filters return the full catalog", () => {
  assert.equal(filterMedals([], "any", "").length, medals.length);
});
