import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createFinderIndex,
  findNextMedals,
  getCommonTagCount,
  getCommonTags,
  getSharedPurposes,
  matchesCompletedSet,
  removeMedalFromSlots,
  sortFinderCandidates,
} from "../../src/data/medal-sets/finder.ts";

const makeMedal = (id, tagIds) => ({
  id,
  name: id,
  category: "character",
  uniqueTrait: "Fixture",
  tags: tagIds.map((tagId) => ({ id: tagId, name: tagId })),
  nativeTraits: [],
});
const medals = [
  makeMedal("skill1-a", ["a", "b", "c", "d", "x"]),
  makeMedal("skill2-b", ["a", "b", "c", "d"]),
  makeMedal("skill1-c", ["a", "b", "c", "d"]),
  makeMedal("recovery-d", ["a", "b", "e"]),
  makeMedal("recovery-e", ["a", "b", "c", "d"]),
  makeMedal("isolated", ["z"]),
];
const index = createFinderIndex(medals, {
  "skill1-a": ["cooldown", "skill-1"],
  "skill2-b": ["cooldown", "skill-2"],
  "skill1-c": ["cooldown", "skill-1"],
  "recovery-d": ["hp-recovery"],
  "recovery-e": ["hp-recovery"],
  isolated: [],
});
const byId = new Map(index.map((entry) => [entry.medal.id, entry]));
const take = (...ids) => ids.map((id) => byId.get(id));
const filters = (mode, minTags = 2, purposeId = null) => ({ mode, minTags, purposeId });

test("triple matches use the three-way intersection, not pairwise tag unions", () => {
  assert.equal(getCommonTagCount(take("skill1-a", "skill2-b", "recovery-d")), 2);
  assert.deepEqual(getCommonTags(medals.slice(0, 3)).map((tag) => tag.id), ["a", "b", "c", "d"]);
});

test("separately typed skill cooldowns do not count as one shared purpose", () => {
  assert.deepEqual(getSharedPurposes(take("skill1-a", "skill2-b", "recovery-e")), []);
  assert.deepEqual(getSharedPurposes(take("skill1-a", "skill2-b", "skill1-c")), [{ id: "skill-1", count: 2 }]);
});

test("hybrid enforces four triple-shared tags and two matching traits", () => {
  assert.equal(matchesCompletedSet(take("skill1-a", "skill2-b", "skill1-c"), filters("hybrid")), true);
  assert.equal(matchesCompletedSet(take("skill1-a", "skill2-b", "recovery-e"), filters("hybrid")), false);
  assert.equal(matchesCompletedSet(take("skill1-a", "recovery-d", "recovery-e"), filters("hybrid")), false);
});

test("stage 2 only includes medals with a valid stage 3 completion", () => {
  const candidates = findNextMedals(index, ["skill1-a"], filters("hybrid"));
  const ids = candidates.map(({ medal }) => medal.id);
  assert.ok(ids.includes("skill2-b"));
  assert.ok(ids.includes("skill1-c"));
  assert.ok(!ids.includes("recovery-d"));
  assert.ok(!ids.includes("isolated"));
  assert.ok(candidates.every(({ completionCount }) => completionCount > 0));
});

test("stage 3 respects purpose filters and excludes already selected medals", () => {
  const candidates = findNextMedals(index, ["skill1-a", "skill2-b"], filters("trait", 2, "skill-1"));
  assert.deepEqual(candidates.map(({ medal }) => medal.id), ["skill1-c"]);
});

test("first slot is unrestricted; duplicates and invalid IDs are rejected", () => {
  assert.equal(findNextMedals(index, [], filters("hybrid")).length, medals.length);
  assert.deepEqual(findNextMedals(index, ["skill1-a", "skill1-a"], filters("all")), []);
  assert.deepEqual(findNextMedals(index, ["unknown"], filters("all")), []);
});

test("the minimum tag threshold can be adjusted without assigning a score", () => {
  assert.equal(matchesCompletedSet(take("skill1-a", "recovery-d", "recovery-e"), filters("all", 2)), true);
  assert.equal(matchesCompletedSet(take("skill1-a", "recovery-d", "recovery-e"), filters("all", 3)), false);
});

test("removing the third slot preserves the first two medals", () => {
  assert.deepEqual(
    removeMedalFromSlots(["skill1-a", "skill2-b", "skill1-c"], 2),
    ["skill1-a", "skill2-b", null],
  );
});

test("removing the middle medal retains the third and repacks the remaining pair", () => {
  const remaining = removeMedalFromSlots(["skill1-a", "skill2-b", "skill1-c"], 1);
  assert.deepEqual(remaining, ["skill1-a", "skill1-c", null]);
  assert.ok(findNextMedals(index, remaining.filter(Boolean), filters("hybrid"))
    .some(({ medal }) => medal.id === "skill2-b"));
});

test("removing the first medal retains both others and allows a new third", () => {
  const remaining = removeMedalFromSlots(["skill1-a", "skill2-b", "skill1-c"], 0);
  assert.deepEqual(remaining, ["skill2-b", "skill1-c", null]);
  assert.ok(findNextMedals(index, remaining.filter(Boolean), filters("hybrid"))
    .some(({ medal }) => medal.id === "skill1-a"));
});

test("removing from one- and two-medal sets leaves other slots intact", () => {
  assert.deepEqual(removeMedalFromSlots(["skill1-a", "skill2-b", null], 0), ["skill2-b", null, null]);
  assert.deepEqual(removeMedalFromSlots(["skill1-a", null, null], 0), [null, null, null]);
  assert.deepEqual(removeMedalFromSlots(["skill1-a", "skill2-b", null], 2), ["skill1-a", "skill2-b", null]);
  assert.deepEqual(removeMedalFromSlots(["skill1-a", null, null], -1), ["skill1-a", null, null]);
});

test("Finder default sort matches Builder catalog order even if search returns a different order", () => {
  const mixed = findNextMedals(index, [], filters("all")).reverse();
  const sorted = sortFinderCandidates(mixed, "default", medals);
  assert.deepEqual(sorted.map(({ medal }) => medal.id), medals.map((medal) => medal.id));
  assert.deepEqual(mixed.map(({ medal }) => medal.id), medals.map((medal) => medal.id).reverse());
});

test("Finder name A-Z and Z-A sorting are consistent regardless of candidate ranking", () => {
  const mixed = findNextMedals(index, [], filters("all")).reverse();
  const alphabetical = [...medals].sort((a, b) => a.name.localeCompare(b.name)).map((medal) => medal.id);
  assert.deepEqual(sortFinderCandidates(mixed, "az", medals).map(({ medal }) => medal.id), alphabetical);
  assert.deepEqual(sortFinderCandidates(mixed, "za", medals).map(({ medal }) => medal.id), [...alphabetical].reverse());
});

test("Finder category sort groups medals and keeps source order within each category", () => {
  const catalog = [
    { ...medals[0], category: "event" },
    { ...medals[1], category: "character" },
    { ...medals[2], category: "event" },
    { ...medals[3], category: "character" },
  ];
  const mixed = catalog.map((medal, commonTagCount) => ({ medal, commonTagCount, completionCount: null })).reverse();
  assert.deepEqual(sortFinderCandidates(mixed, "category", catalog).map(({ medal }) => medal.id),
    [medals[1].id, medals[3].id, medals[0].id, medals[2].id]);
});

test("Finder Best Tag Match sorts by active pair/trio overlap and keeps matching candidates", () => {
  const candidates = findNextMedals(index, ["skill1-a"], filters("all", 2));
  const sorted = sortFinderCandidates([...candidates].reverse(), "match", medals);
  assert.deepEqual(sorted.map(({ commonTagCount }) => commonTagCount),
    [...sorted.map(({ commonTagCount }) => commonTagCount)].sort((a, b) => b - a));
  assert.deepEqual(new Set(sorted.map(({ medal }) => medal.id)), new Set(candidates.map(({ medal }) => medal.id)));
  assert.deepEqual(candidates.map(({ medal }) => medal.id).sort(),
    sortFinderCandidates(candidates, "az", medals).map(({ medal }) => medal.id).sort());
});
