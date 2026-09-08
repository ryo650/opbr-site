import assert from "node:assert/strict";
import test from "node:test";
import {
  characterBoostProfiles,
  deriveBaseStatsFromDisplayedStats,
} from "../../src/data/characters/boost-profiles.ts";
import {
  calculateCharacterStatPreviewValue,
  getCharacterStatsPreview,
} from "../../src/data/medals/character-stats-preview.ts";
import {
  clearEquippedExtraTraitsForSlot,
  createEmptyEquippedExtraTraits,
  setEquippedExtraTrait,
} from "../../src/data/medals/extra-traits.ts";
import { selectableExtraTraits } from "../../src/data/medals/selectable-extra-traits.ts";

const characterA = { id: "fixture-a", name: "Fixture A", image: "/fixture-a.webp", grade: "ex", element: "red", role: "attacker" };
const characterB = { id: "fixture-b", name: "Fixture B", image: "/fixture-b.webp", grade: "bf", element: "blue", role: "defender" };
const characterC = { id: "fixture-c", name: "Fixture C", image: "/fixture-c.webp", grade: "ex", element: "green", role: "runner" };
const statsA = { characterId: characterA.id, baseHp: 10_000, baseAtk: 1_630, baseDef: 1_500 };
const statsB = { characterId: characterB.id, baseHp: 8_000, baseAtk: 2_500, baseDef: 1_800 };
const statsC = { characterId: characterC.id, baseHp: 9_000, baseAtk: 1_700, baseDef: 1_600 };

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

test("Attacker Boost stages use the verified role values", () => {
  assert.deepEqual(characterBoostProfiles.attacker, {
    base: { hp: 0, atk: 0, def: 0 },
    "boost-1": { hp: 1_120, atk: 390, def: 280 },
    "boost-2": { hp: 1_920, atk: 540, def: 480 },
    "boost-3": { hp: 2_300, atk: 600, def: 575 },
    "boost-max": { hp: 2_580, atk: 640, def: 640 },
  });
});

test("Runner Boost stages use the verified role values", () => {
  assert.deepEqual(characterBoostProfiles.runner, {
    base: { hp: 0, atk: 0, def: 0 },
    "boost-1": { hp: 1_560, atk: 280, def: 280 },
    "boost-2": { hp: 2_160, atk: 480, def: 480 },
    "boost-3": { hp: 2_410, atk: 575, def: 575 },
    "boost-max": { hp: 2_580, atk: 640, def: 640 },
  });
});

test("Defender Boost stages use the verified role values", () => {
  assert.deepEqual(characterBoostProfiles.defender, {
    base: { hp: 0, atk: 0, def: 0 },
    "boost-1": { hp: 1_120, atk: 280, def: 390 },
    "boost-2": { hp: 1_920, atk: 480, def: 540 },
    "boost-3": { hp: 2_300, atk: 575, def: 600 },
    "boost-max": { hp: 2_580, atk: 640, def: 640 },
  });
});

test("Base and Boost Max are shared across every Role", () => {
  for (const profile of Object.values(characterBoostProfiles)) {
    assert.deepEqual(profile.base, { hp: 0, atk: 0, def: 0 });
    assert.deepEqual(profile["boost-max"], { hp: 2_580, atk: 640, def: 640 });
  }
  const preview = getCharacterStatsPreview(characterA, statsA, createEmptyEquippedExtraTraits());
  assert.equal(preview?.stats.atk.displayed, 2_270);
});

test("changing canonical Role selects the corresponding Boost profile", () => {
  const attacker = getCharacterStatsPreview(characterA, statsA, createEmptyEquippedExtraTraits(), "boost-1");
  const runner = getCharacterStatsPreview(characterC, statsC, createEmptyEquippedExtraTraits(), "boost-1");
  const defender = getCharacterStatsPreview(characterB, statsB, createEmptyEquippedExtraTraits(), "boost-1");
  assert.deepEqual(attacker?.boostProfile.values, { hp: 1_120, atk: 390, def: 280 });
  assert.deepEqual(runner?.boostProfile.values, { hp: 1_560, atk: 280, def: 280 });
  assert.deepEqual(defender?.boostProfile.values, { hp: 1_120, atk: 280, def: 390 });
});

test("Boost Max display values derive Base once using the Character Role profile", () => {
  assert.deepEqual(
    deriveBaseStatsFromDisplayedStats({ hp: 9_386, atk: 2_175, def: 2_328 }, "runner", "boost-max"),
    { baseHp: 6_806, baseAtk: 1_535, baseDef: 1_688 },
  );
});

test("changing Boost changes displayed ATK but not its Base Stat", () => {
  const maxPreview = getCharacterStatsPreview(characterA, statsA, createEmptyEquippedExtraTraits(), "boost-max");
  const basePreview = getCharacterStatsPreview(characterA, statsA, createEmptyEquippedExtraTraits(), "base");
  assert.deepEqual(
    [maxPreview?.stats.atk.base, maxPreview?.stats.atk.displayed],
    [1_630, 2_270],
  );
  assert.deepEqual(
    [basePreview?.stats.atk.base, basePreview?.stats.atk.displayed],
    [1_630, 1_630],
  );
});

test("Medal ATK percent always uses Base ATK instead of displayed ATK", () => {
  const atk24 = findTrait("atk-increase", 24, "percent");
  const atk18 = findTrait("atk-increase", 18, "percent");
  const atk14 = findTrait("atk-increase", 14, "percent");
  const equipped = equipTraits([atk24, atk18, atk14, atk14]);
  const maxPreview = getCharacterStatsPreview(characterA, statsA, equipped, "boost-max");
  const basePreview = getCharacterStatsPreview(characterA, statsA, equipped, "base");
  assert.equal(maxPreview?.stats.atk.effectivePercent, 70);
  assert.equal(maxPreview?.stats.atk.increase, 1_141);
  assert.equal(basePreview?.stats.atk.increase, 1_141);
  assert.notEqual(maxPreview?.stats.atk.increase, 2_270 * 0.7);
});

test("flat ATK points are added after percentage and are not multiplied", () => {
  assert.deepEqual(calculateCharacterStatPreviewValue(1_630, 640, 70, 300), {
    base: 1_630,
    boost: 640,
    displayed: 2_270,
    effectivePercent: 70,
    effectivePoints: 300,
    increase: 1_441,
  });
});

test("Sabo ATK rounds the 70% contribution up before adding flat points", () => {
  assert.equal(calculateCharacterStatPreviewValue(1_532, 0, 70, 300).increase, 1_373);
});

test("Awakened Form Rob Lucci ATK rounds a fractional 70% contribution up", () => {
  assert.equal(calculateCharacterStatPreviewValue(1_535, 0, 70, 0).increase, 1_075);
});

test("Awakened Form Rob Lucci HP rounds a fractional 64% contribution up", () => {
  assert.equal(calculateCharacterStatPreviewValue(7_135, 0, 64, 0).increase, 4_567);
});

test("Divine Departure Shanks keeps an exact 70% contribution before flat points", () => {
  assert.equal(calculateCharacterStatPreviewValue(1_630, 0, 70, 300).increase, 1_441);
});

test("HP percent and points combine from Base HP under their separate caps", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp24, hp640]));
  assert.deepEqual(preview?.stats.hp, {
    base: 10_000,
    boost: 2_580,
    displayed: 12_580,
    effectivePercent: 24,
    effectivePoints: 640,
    increase: 3_040,
  });
});

test("Boost changes never change the Medal bonus", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  const equipped = equipTraits([hp24, hp640]);
  const basePreview = getCharacterStatsPreview(characterA, statsA, equipped, "base");
  const maxPreview = getCharacterStatsPreview(characterA, statsA, equipped, "boost-max");
  assert.equal(basePreview?.stats.hp.increase, 3_040);
  assert.equal(maxPreview?.stats.hp.increase, 3_040);
  assert.notEqual(basePreview?.stats.hp.displayed, maxPreview?.stats.hp.displayed);
});

test("HP percentage and point caps remain enforced", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  const percentPreview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp24, hp24, hp24]));
  const pointsPreview = getCharacterStatsPreview(characterA, statsA, equipTraits([hp640, hp640]));
  assert.equal(percentPreview?.stats.hp.effectivePercent, 70);
  assert.equal(percentPreview?.stats.hp.increase, 7_000);
  assert.equal(pointsPreview?.stats.hp.effectivePoints, 1_200);
  assert.equal(pointsPreview?.stats.hp.increase, 1_200);
});

test("ATK and DEF contributions remain separated", () => {
  const atk24 = findTrait("atk-increase", 24, "percent");
  const atk160 = findTrait("atk-increase", 160, "points");
  const def18 = findTrait("def-increase", 18, "percent");
  const preview = getCharacterStatsPreview(characterA, statsA, equipTraits([atk24, atk160, def18]));
  assert.equal(preview?.stats.hp.increase, 0);
  assert.equal(preview?.stats.atk.increase, Math.ceil(1_630 * 0.24) + 160);
  assert.equal(preview?.stats.def.increase, 270);
});

test("switching Character changes Base, displayed, and percentage-derived values", () => {
  const hp24 = findTrait("hp-increase", 24, "percent");
  const hp640 = findTrait("hp-increase", 640, "points");
  const equipped = equipTraits([hp24, hp640]);
  const previewA = getCharacterStatsPreview(characterA, statsA, equipped);
  const previewB = getCharacterStatsPreview(characterB, statsB, equipped);
  assert.deepEqual(
    [previewA?.stats.hp.base, previewA?.stats.hp.displayed, previewA?.stats.hp.increase],
    [10_000, 12_580, 3_040],
  );
  assert.deepEqual(
    [previewB?.stats.hp.base, previewB?.stats.hp.displayed, previewB?.stats.hp.increase],
    [8_000, 10_580, 2_560],
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
