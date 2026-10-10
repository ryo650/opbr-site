import assert from "node:assert/strict";
import { test } from "node:test";
import { getRecentlyAddedMedals, RECENT_MEDAL_LIMIT } from "../../src/data/medal-sets/recent-medals.ts";

const sample = Array.from({ length: 15 }, (_, index) => ({
  id: `medal-${index + 1}`,
  name: `Medal ${index + 1}`,
  category: "event",
  uniqueTrait: "",
  tags: [],
  nativeTraits: [],
}));

test("latest site additions are the last imported medal IDs, newest first", () => {
  assert.equal(RECENT_MEDAL_LIMIT, 10);
  assert.deepEqual(getRecentlyAddedMedals(sample).map((medal) => medal.id),
    Array.from({ length: 10 }, (_, index) => `medal-${15 - index}`));
});

test("a newly appended medal automatically appears first and displaces the oldest shortcut", () => {
  const before = getRecentlyAddedMedals(sample);
  const nextCatalog = [...sample, { ...sample[0], id: "new-medal" }];
  const after = getRecentlyAddedMedals(nextCatalog);
  assert.equal(after[0].id, "new-medal");
  assert.equal(after.length, 10);
  assert.equal(after.includes(before[before.length - 1]), false);
});

test("small/empty catalogs, custom limits and invalid limits are safe", () => {
  assert.deepEqual(getRecentlyAddedMedals([]), []);
  assert.deepEqual(getRecentlyAddedMedals(sample.slice(0, 2)).map((medal) => medal.id), ["medal-2", "medal-1"]);
  assert.deepEqual(getRecentlyAddedMedals(sample, 3).map((medal) => medal.id), ["medal-15", "medal-14", "medal-13"]);
  assert.deepEqual(getRecentlyAddedMedals(sample, 0), []);
  assert.deepEqual(getRecentlyAddedMedals(sample, Number.NaN), []);
});

test("the recent-medals selector never modifies the source order", () => {
  const idsBefore = sample.map(({ id }) => id);
  const latest = getRecentlyAddedMedals(sample);
  latest.reverse();
  assert.deepEqual(sample.map(({ id }) => id), idsBefore);
  assert.equal(sample[0].id, "medal-1");
});
