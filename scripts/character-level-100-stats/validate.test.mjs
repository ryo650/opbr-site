import assert from "node:assert/strict";
import test from "node:test";
import { characters } from "../../src/data/characters/index.ts";
import { characterLevel100StatsCatalog } from "../../src/data/characters/level-100-stats.ts";
import { validateCharacterLevel100Stats } from "./validate.mjs";

const canonicalFixture = {
  "fixture-character": {
    id: "fixture-character",
    name: "Fixture Character",
    image: "/fixture.webp",
    grade: "ex",
    element: "red",
    role: "attacker",
  },
};
const validEntry = { characterId: "fixture-character", hp: 10_000, atk: 2_000, def: 1_500 };

test("production Lv.100 stats catalog passes validation", () => {
  assert.deepEqual(
    validateCharacterLevel100Stats(characterLevel100StatsCatalog, characters),
    { entryCount: characterLevel100StatsCatalog.length, errors: [] },
  );
});

test("Jewelry Bonney uses the migrated canonical ID", () => {
  const id = "future-where-i-m-the-most-free-jewelry-bonney";
  assert.equal(characters[id]?.id, id);
  assert.equal(characters[id]?.name, "Future-Where-I-m-the-Most-Free-Jewelry-Bonney");
  assert.equal(characters[`${id.slice(0, -1)}`], undefined);
});

test("Marshall D. Teach uses the migrated canonical ID", () => {
  const id = "the-four-emperors-marshall-d-teach";
  assert.equal(characters[id]?.id, id);
  assert.equal(characters[id]?.name, "The-Four-Emperors-Marshall-D-Teach");
  assert.equal(characters[id.replace("four-emperors", "fouremperors")], undefined);
  assert.deepEqual(
    characterLevel100StatsCatalog.find((stats) => stats.characterId === id),
    { characterId: id, hp: 9819, atk: 2471, def: 1996 },
  );
});

test("a valid entry resolves through the canonical Character catalog", () => {
  assert.deepEqual(
    validateCharacterLevel100Stats([validEntry], canonicalFixture),
    { entryCount: 1, errors: [] },
  );
});

test("duplicate character IDs and duplicate entries are both reported", () => {
  const result = validateCharacterLevel100Stats([validEntry, validEntry], canonicalFixture);
  assert.equal(result.entryCount, 2);
  assert.ok(result.errors.some((error) => error.includes("duplicate characterId")));
  assert.ok(result.errors.some((error) => error.includes("duplicate entry")));
});

test("unknown canonical character IDs are rejected", () => {
  const result = validateCharacterLevel100Stats([
    { ...validEntry, characterId: "missing-character" },
  ], canonicalFixture);
  assert.ok(result.errors.some((error) => error.includes("does not exist in canonical catalog")));
});

test("HP, ATK, and DEF must each be positive integers", () => {
  const result = validateCharacterLevel100Stats([
    { characterId: "fixture-character", hp: 0, atk: 2.5, def: -1 },
  ], canonicalFixture);
  assert.ok(result.errors.some((error) => error.includes("hp must be an integer greater than 0")));
  assert.ok(result.errors.some((error) => error.includes("atk must be an integer greater than 0")));
  assert.ok(result.errors.some((error) => error.includes("def must be an integer greater than 0")));
});
