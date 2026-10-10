import assert from "node:assert/strict";
import { test } from "node:test";
import { medals } from "../../src/data/medals/medals.ts";
import { getRecentlyAddedMedals, RECENT_MEDALS_LIMIT } from "../../src/data/medals/recently-added.ts";

const fixtures = [
  { id: "old-medal", name: "Old Medal" },
  { id: "halloween-perona", name: "Halloween Perona" },
  { id: "ill-trick-you", name: "I'll Trick You" },
];

test("catalog history only exposes verified newly added records, not old baseline medals", () => {
  assert.deepEqual(getRecentlyAddedMedals(fixtures).map((m) => m.id), [
    "ill-trick-you", "halloween-perona",
  ]);
});

test("future imported medals append automatically and appear newest first", () => {
  const newMedals = [
    { id: "next-import", name: "Next Medal" },
    { id: "after-next", name: "After Next" },
  ];
  const current = [...fixtures, ...newMedals];
  assert.deepEqual(getRecentlyAddedMedals(current).map((m) => m.id), [
    "after-next", "next-import", "ill-trick-you", "halloween-perona",
  ]);
  assert.deepEqual(getRecentlyAddedMedals(current, 2).map((m) => m.id), [
    "after-next", "next-import",
  ]);
});

test("invalid history anchors never result in guessed latest medals", () => {
  assert.deepEqual(getRecentlyAddedMedals(fixtures.slice(0, 1)), []);
  assert.deepEqual(getRecentlyAddedMedals([fixtures[0], fixtures[2], fixtures[1]]), []);
  assert.deepEqual(getRecentlyAddedMedals(fixtures, 0), []);
  assert.deepEqual(getRecentlyAddedMedals(fixtures, Number.NaN), []);
  assert.deepEqual(getRecentlyAddedMedals(fixtures, -1), []);
});

test("production catalog uses the confirmed append anchor even after more than eight new imports", () => {
  const anchor = medals.findIndex(({ id }) => id === "halloween-perona");
  assert.ok(anchor >= 0);
  assert.equal(medals[anchor + 1]?.id, "ill-trick-you");
  assert.ok(RECENT_MEDALS_LIMIT > 0 && RECENT_MEDALS_LIMIT <= 10);
  const current = getRecentlyAddedMedals(medals);
  const expected = medals.slice(anchor).slice(-RECENT_MEDALS_LIMIT).reverse();
  assert.deepEqual(current.map(({ id }) => id), expected.map(({ id }) => id));
  assert.ok(current.length >= 1 && current.length <= RECENT_MEDALS_LIMIT);
});
