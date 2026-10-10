import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countFinderCatalogFilters,
  emptyFinderCatalogFilters,
  matchesFinderCatalogFilters,
} from "../../src/data/medal-sets/finder-catalog-filters.ts";
import { createFinderIndex, findNextMedals } from "../../src/data/medal-sets/finder.ts";

function medal(id, tags, extra = {}) {
  return {
    id, name: id, category: "character", uniqueTrait: "Skill cooldown reduced",
    tags: tags.map((tag) => ({ id: tag, name: tag })),
    nativeTraits: ["atk"], nativeEffects: ["damage-dealt-increase"],
    statusReductions: ["capture-block"], ...extra,
  };
}
const catalog = [
  medal("start", ["egghead", "zoan", "captain"]),
  medal("second", ["egghead", "zoan", "captain"], { category: "event" }),
  medal("third", ["egghead", "zoan", "captain"]),
  medal("other", ["dressrosa", "paramecia"], { nativeTraits: ["def"], nativeEffects: [], statusReductions: [] }),
];
const categoriesById = {
  start: ["cooldown", "skill-1"],
  second: ["cooldown", "skill-2"],
  third: ["cooldown", "skill-1"],
  other: ["hp-recovery"],
};
const effectIndex = new Map([
  ["skill1-cooldown-reduction-speed", new Set(["egghead", "dressrosa"])],
  ["skill2-cooldown-reduction-speed", new Set(["captain"])],
]);
const filters = (changes = {}) => ({ ...emptyFinderCatalogFilters, ...changes });

test("no catalog filters accepts the first-slot catalog unchanged", () => {
  assert.equal(countFinderCatalogFilters(filters()), 0);
  const first = findNextMedals(createFinderIndex(catalog, categoriesById), [], { mode: "all", minTags: 2, purposeId: null });
  assert.equal(first.length, 4);
  assert.equal(first.filter(({ medal: entry }) =>
    matchesFinderCatalogFilters(entry, filters(), effectIndex, categoriesById)).length, 4);
});

test("category and native traits refine only candidate medals", () => {
  const chosen = filters({ category: "event", nativeTraits: ["atk"] });
  assert.equal(matchesFinderCatalogFilters(catalog[1], chosen, effectIndex, categoriesById), true);
  assert.equal(matchesFinderCatalogFilters(catalog[0], chosen, effectIndex, categoriesById), false);
  assert.equal(matchesFinderCatalogFilters(catalog[3], filters({ nativeTraits: ["def"] }), effectIndex, categoriesById), true);
  assert.equal(countFinderCatalogFilters(chosen), 2);
});

test("selected effect groups accept any tag, while explicit selected tags all match", () => {
  assert.equal(matchesFinderCatalogFilters(catalog[0], filters({
    setEffectIds: ["skill1-cooldown-reduction-speed", "skill2-cooldown-reduction-speed"],
    tagIds: ["egghead", "captain"],
  }), effectIndex, categoriesById), true);
  assert.equal(matchesFinderCatalogFilters(catalog[3], filters({
    setEffectIds: ["skill1-cooldown-reduction-speed"],
  }), effectIndex, categoriesById), true);
  assert.equal(matchesFinderCatalogFilters(catalog[0], filters({
    tagIds: ["egghead", "dressrosa"],
  }), effectIndex, categoriesById), false);
});

test("unique trait filters honor Any/All and normalized text", () => {
  assert.equal(matchesFinderCatalogFilters(catalog[0], filters({
    uniqueTraitCategories: ["skill-1", "hp-recovery"],
    uniqueTraitMatchMode: "any",
    uniqueTraitQuery: "  SKILL  ",
  }), effectIndex, categoriesById), true);
  assert.equal(matchesFinderCatalogFilters(catalog[0], filters({
    uniqueTraitCategories: ["skill-1", "hp-recovery"],
    uniqueTraitMatchMode: "all",
  }), effectIndex, categoriesById), false);
  assert.equal(matchesFinderCatalogFilters(catalog[1], filters({
    uniqueTraitCategories: ["skill-1"],
  }), effectIndex, categoriesById), false);
});

test("extra trait effects and status reductions use all-selected matching", () => {
  assert.equal(matchesFinderCatalogFilters(catalog[0], filters({
    nativeEffects: ["damage-dealt-increase"],
    statusReductions: ["capture-block"],
  }), effectIndex, categoriesById), true);
  assert.equal(matchesFinderCatalogFilters(catalog[3], filters({
    nativeEffects: ["damage-dealt-increase"],
  }), effectIndex, categoriesById), false);
});

test("filtering next medals does not modify the completion engine or selected slots", () => {
  const index = createFinderIndex(catalog, categoriesById);
  const next = findNextMedals(index, ["start", "second"], { mode: "all", minTags: 2, purposeId: null });
  assert.deepEqual(next.map(({ medal: candidate }) => candidate.id), ["third"]);
  const excluded = next.filter(({ medal: candidate }) =>
    matchesFinderCatalogFilters(candidate, filters({ category: "event" }), effectIndex, categoriesById));
  assert.equal(excluded.length, 0);
  assert.deepEqual(next.map(({ medal: candidate }) => candidate.id), ["third"]);
});
