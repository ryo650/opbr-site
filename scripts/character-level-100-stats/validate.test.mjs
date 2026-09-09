import assert from "node:assert/strict";
import test from "node:test";
import {
  characterBoostProfiles,
  characterLevel100BaseStatsCatalog,
  characters,
  getSelectableCharacterLevel100BaseStats,
} from "../../src/data/characters/index.ts";
import { validateCharacterLevel100BaseStats } from "./validate.mjs";

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
const completeEntry = { characterId: "fixture-character", baseHp: 7_420, baseAtk: 1_630, baseDef: 1_500 };
const pendingEntry = { characterId: "fixture-character", baseHp: null, baseAtk: null, baseDef: null };
const partialEntry = { characterId: "fixture-character", baseHp: 7_420, baseAtk: null, baseDef: 1_500 };

test("production Base Stats catalog passes validation after the reviewed Max-to-Base conversion", () => {
  const result = validateCharacterLevel100BaseStats(characterLevel100BaseStatsCatalog, characters);
  assert.deepEqual(result.errors, []);
  assert.equal(result.entryCount, 33);
  assert.equal(result.verifiedCount, 33);
  assert.equal(result.pendingCount, 0);
  assert.equal(result.partialCount, 0);
});

test("the pre-existing Red Roc Luffy Base Stats are not converted a second time", () => {
  assert.deepEqual(
    characterLevel100BaseStatsCatalog.find(({ characterId }) => characterId === "red-rock-monkey-d-luffy"),
    { characterId: "red-rock-monkey-d-luffy", baseHp: 6_806, baseAtk: 1_535, baseDef: 1_688 },
  );
});

test("a newly entered Boost Max value is converted to Base exactly once", () => {
  assert.deepEqual(
    characterLevel100BaseStatsCatalog.find(({ characterId }) => characterId === "flame-emperor-sabo"),
    { characterId: "flame-emperor-sabo", baseHp: 7_212, baseAtk: 1_532, baseDef: 1_662 },
  );
});

test("a complete entry validates and is selectable", () => {
  const result = validateCharacterLevel100BaseStats([completeEntry], canonicalFixture);
  assert.deepEqual(result, { entryCount: 1, verifiedCount: 1, pendingCount: 0, partialCount: 0, errors: [] });
  assert.deepEqual(getSelectableCharacterLevel100BaseStats([completeEntry]), [completeEntry]);
});

test("a null entry validates as pending and remains out of the selector", () => {
  const result = validateCharacterLevel100BaseStats([pendingEntry], canonicalFixture);
  assert.deepEqual(result, { entryCount: 1, verifiedCount: 0, pendingCount: 1, partialCount: 0, errors: [] });
  assert.deepEqual(getSelectableCharacterLevel100BaseStats([pendingEntry]), []);
});

test("a partial entry validates as pending but remains out of the selector", () => {
  const result = validateCharacterLevel100BaseStats([partialEntry], canonicalFixture);
  assert.deepEqual(result, { entryCount: 1, verifiedCount: 0, pendingCount: 1, partialCount: 1, errors: [] });
  assert.deepEqual(getSelectableCharacterLevel100BaseStats([partialEntry]), []);
});

test("duplicate character IDs and duplicate Base entries are both reported", () => {
  const result = validateCharacterLevel100BaseStats([completeEntry, completeEntry], canonicalFixture);
  assert.ok(result.errors.some((error) => error.includes("duplicate characterId")));
  assert.ok(result.errors.some((error) => error.includes("duplicate entry")));
});

test("unknown canonical character IDs are rejected", () => {
  const result = validateCharacterLevel100BaseStats([{ ...completeEntry, characterId: "missing-character" }], canonicalFixture);
  assert.ok(result.errors.some((error) => error.includes("does not exist in canonical catalog")));
});

test("non-null Base Stats values must be positive integers", () => {
  const result = validateCharacterLevel100BaseStats([
    { characterId: "fixture-character", baseHp: 0, baseAtk: 2.5, baseDef: -1 },
  ], canonicalFixture);
  assert.ok(result.errors.some((error) => error.includes("baseHp must be an integer greater than 0")));
  assert.ok(result.errors.some((error) => error.includes("baseAtk must be an integer greater than 0")));
  assert.ok(result.errors.some((error) => error.includes("baseDef must be an integer greater than 0")));
});

test("Role-aware Boost profiles require complete non-negative integer values", () => {
  const invalidProfiles = {
    ...characterBoostProfiles,
    attacker: {
      ...characterBoostProfiles.attacker,
      "boost-1": { hp: -1, atk: 390, def: 280 },
    },
  };
  const result = validateCharacterLevel100BaseStats([completeEntry], canonicalFixture, invalidProfiles);
  assert.ok(result.errors.some((error) => error.includes("attacker/boost-1: hp Boost must be an integer greater than or equal to 0")));
});

test("a canonical Character with an unresolved role is rejected", () => {
  const unknownRoleCharacters = {
    "fixture-character": { ...canonicalFixture["fixture-character"], role: "unknown" },
  };
  const result = validateCharacterLevel100BaseStats([completeEntry], unknownRoleCharacters);
  assert.ok(result.errors.some((error) => error.includes("canonical role cannot resolve a Boost profile")));
});
