import assert from "node:assert/strict";
import test from "node:test";
import { getCharacterStatsPreview } from "../../src/data/medals/character-stats-preview.ts";
import {
  clearEquippedExtraTraitsForSlot,
  createEmptyEquippedExtraTraits,
  setEquippedExtraTrait,
} from "../../src/data/medals/extra-traits.ts";
import { selectableExtraTraits } from "../../src/data/medals/selectable-extra-traits.ts";

const characterA = { id: "fixture-a", name: "Fixture A", image: "/fixture-a.webp", grade: "ex", element: "red", role: "attacker" };
const characterB = { id: "fixture-b", name: "Fixture B", image: "/fixture-b.webp", grade: "bf", element: "blue", role: "defender" };
const statsA = { characterId: characterA.id, hp: 10_000, atk: 2_000, def: 1_500 };
const statsB = { characterId: characterB.id, hp: 8_000, atk: 2_500, def: 1_800 };

function findTrait(effectId, value, unit) {
  const definition = selectableExtraTraits.find((candidate) =>
    candidate.effectId === effectId
      && candidate.value === value
      && candidate.unit === unit
      && !candidate.condition,
  );
  assert.ok(definition, `Missing test Extra Trait: ${effectId} ${value} ${unit}`);
  return definition;
}

function equipTraits(definitions) {
  let equipped = createEmptyEquippedExtraTraits();
  definitions.forEach((definition, index) => {
    equipped = setEquippedExtraTrait(equipped, Math.floor(index / 3), index % 3, definition.id);
  });
  return equipped;
}

test("no selected Character returns no stats calculation", () => {
  assert.equal(getCharacterStatsPreview(null, null, createEmptyEquippedExtraTraits()), null);
});

test("HP 24% previews +2400", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp24]));
  assert.equal(preview?.stats.hp.increase, 2_400);
});

test("HP percent and points combine without changing the base", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp24, hp640]));
  assert.deepEqual(preview?.stats.hp, {
    base: 10_000,
    effectivePercent: 24,
    effectivePoints: 640,
    increase: 3_040,
  });
});

test("HP percent increase uses the existing 70% effective cap", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp24, hp24, hp24]));
  assert.equal(preview?.stats.hp.effectivePercent, 70);
  assert.equal(preview?.stats.hp.increase, 7_000);
});

test("HP points increase uses the existing 1200 Pts effective cap", () => {
  const hp640 = findTrait("hp-increase", 640, "points");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp640, hp640]));
  assert.equal(preview?.stats.hp.effectivePoints, 1_200);
  assert.equal(preview?.stats.hp.increase, 1_200);
});

test("ATK and DEF contributions remain separated", () => {
  const atk24 = findTrait("atk-increase", 24, "percent");
  const atk160 = findTrait("atk-increase", 160, "points");
  const def18 = findTrait("def-increase", 18, "percent");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([atk24, atk160, def18]));
  assert.equal(preview?.stats.hp.increase, 0);
  assert.equal(preview?.stats.atk.increase, 640);
  assert.equal(preview?.stats.def.increase, 270);
});

test("switching Character changes the base and percentage-derived increase only", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  const equipped = equipTraits([hp24, hp640]);
  const previewA = getCharacterStatsPreview(characterA, statsA, equipped);
  const previewB = getCharacterStatsPreview(characterB, statsB, equipped);
  assert.deepEqual(
    [previewA?.stats.hp.base, previewA?.stats.hp.increase],
    [10_000, 3_040],
  );
  assert.deepEqual(
    [previewB?.stats.hp.base, previewB?.stats.hp.increase],
    [8_000, 2_560],
  );
});

test("clearing a removed Medal slot immediately removes only that slot's Extra Traits", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  let equipped = createEmptyEquippedExtraTraits();
  equipped = setEquippedExtraTrait(equipped, 0, 0, hp24.id);
  equipped = setEquippedExtraTrait(equipped, 1, 0, hp640.id);
  assert.equal(getCharacterStatsPreview(characterA, statsA, equipped)?.stats.hp.increase, 3_040);
  equipped = clearEquippedExtraTraitsForSlot(equipped, 0);
  assert.equal(getCharacterStatsPreview(characterA, statsA, equipped)?.stats.hp.increase, 640);
});
