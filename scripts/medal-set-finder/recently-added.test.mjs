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

test("production catalog contains the documented 2026-10-01 addition anchor", () => {
  const current = getRecentlyAddedMedals(medals);
  assert.ok(RECENT_MEDALS_LIMIT > 0 && RECENT_MEDALS_LIMIT <= 10);
  assert.ok(current.length >= 2 && current.length <= RECENT_MEDALS_LIMIT);
  assert.ok(current.some((medal) => medal.id === "halloween-perona"));
  assert.ok(current.some((medal) => medal.id === "ill-trick-you"));
  assert.ok(current.every((medal) => medals.some(({ id }) => id === medal.id)));
});
