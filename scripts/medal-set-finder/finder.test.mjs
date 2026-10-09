import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createFinderIndex,
  findNextMedals,
  getCommonTagCount,
  getCommonTags,
  getSharedPurposes,
  matchesCompletedSet,
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
