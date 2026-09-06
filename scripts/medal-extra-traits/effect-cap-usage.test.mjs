import assert from "node:assert/strict";
import test from "node:test";
import {
  getBuildEffectCapUsage,
  getEffectCapFillPercent,
  getEffectContributions,
} from "../../src/data/medals/effect-cap-usage.ts";
import {
  clearEquippedExtraTraitsForSlot,
  createEmptyEquippedExtraTraits,
  setEquippedExtraTrait,
} from "../../src/data/medals/extra-traits.ts";
import { selectableExtraTraits } from "../../src/data/medals/selectable-extra-traits.ts";
import { getActiveTagSetEffects } from "../../src/data/medals/active-tag-set-effects.ts";

function findTrait(effectId, value, options = {}) {
  const definition = selectableExtraTraits.find((candidate) =>
    candidate.effectId === effectId
      && candidate.value === value
      && (!options.unit || candidate.unit === options.unit)
      && (options.conditional === undefined || Boolean(candidate.condition) === options.conditional),
  );
  assert.ok(definition, `Missing test Extra Trait: ${effectId} ${value}`);
  return definition;
}

function equipTraits(definitions) {
  let equipped = createEmptyEquippedExtraTraits();
  definitions.forEach((definition, index) => {
    equipped = setEquippedExtraTrait(equipped, Math.floor(index / 3), index % 3, definition.id);
  });
  return equipped;
}

function trioEffectsForTag(id, name) {
  return getActiveTagSetEffects(["one", "two", "three"].map((medalId) => ({
    id: medalId,
    tags: [{ id, name }],
  })));
}

function usageFor(capGroup, equipped, effects = []) {
  const usage = getBuildEffectCapUsage(equipped, effects).find((candidate) => candidate.capGroup === capGroup);
  assert.ok(usage, `Missing cap usage: ${capGroup}`);
  return usage;
}

test("HP percent traits total independently under the 70% cap", () => {
  const hp18 = findTrait("hp-increase", 18, { unit: "percent", conditional: false });
  const hp14 = findTrait("hp-increase", 14, { unit: "percent", conditional: false });
  const usage = usageFor("hp-increase-percent", equipTraits([hp18, hp18, hp14]));
  assert.deepEqual(
    { total: usage.total, cap: usage.cap, effective: usage.effective, overflow: usage.overflow },
    { total: 50, cap: 70, effective: 50, overflow: 0 },
  );
});

test("HP points overflow without mixing with HP percent", () => {
  const hp640 = findTrait("hp-increase", 640, { unit: "points", conditional: false });
  const hp14 = findTrait("hp-increase", 14, { unit: "percent", conditional: false });
  const usages = getBuildEffectCapUsage(equipTraits([hp640, hp640, hp14]), []);
  const points = usages.find(({ capGroup }) => capGroup === "hp-increase-points");
  const percent = usages.find(({ capGroup }) => capGroup === "hp-increase-percent");
  assert.deepEqual(
    { total: points?.total, cap: points?.cap, effective: points?.effective, overflow: points?.overflow },
    { total: 1280, cap: 1200, effective: 1200, overflow: 80 },
  );
  assert.equal(percent?.total, 14);
});

test("gauge fill uses effective divided by cap and clamps overflow at 100%", () => {
  assert.equal(getEffectCapFillPercent({ effective: 50, cap: 70 }), 50 / 70 * 100);
  assert.equal(getEffectCapFillPercent({ effective: 70, cap: 70 }), 100);
  assert.equal(getEffectCapFillPercent({ effective: 80, cap: 70 }), 100);
  assert.equal(getEffectCapFillPercent({ effective: 12, cap: undefined }), 0);
});

test("Damage Dealt combines Extra Traits and active Tag Set Effects", () => {
  const damage8 = findTrait("damage-dealt-increase", 8, { conditional: false });
  const activeEffects = trioEffectsForTag("worst-generation", "Worst Generation");
  const usage = usageFor("damage-dealt-increase", equipTraits([damage8, damage8, damage8]), activeEffects);
  assert.deepEqual(
    { total: usage.total, cap: usage.cap, effective: usage.effective, overflow: usage.overflow },
    { total: 34, cap: 30, effective: 30, overflow: 4 },
  );
  assert.deepEqual(usage.contributions.map(({ source }) => source), [
    "extra-trait",
    "extra-trait",
    "extra-trait",
    "tag-set-effect",
  ]);
});

test("Skill 1 combines a 3% Extra Trait with a 20% Trio Set Effect", () => {
  const skill1 = findTrait("skill1-cooldown-reduction-speed", 3, { conditional: false });
  const activeEffects = trioEffectsForTag("east-blue", "East Blue");
  const usage = usageFor("skill1-cooldown-reduction-speed", equipTraits([skill1]), activeEffects);
  assert.deepEqual(
    { total: usage.total, cap: usage.cap, effective: usage.effective, overflow: usage.overflow },
    { total: 23, cap: 30, effective: 23, overflow: 0 },
  );
});

test("Stun 36% uses only the Stun-specific 70% bucket", () => {
  const stun = findTrait("stun-duration-reduction", 36, { conditional: false });
  const usage = usageFor("stun-duration-reduction", equipTraits([stun]));
  assert.deepEqual(
    { total: usage.total, cap: usage.cap, effective: usage.effective, overflow: usage.overflow },
    { total: 36, cap: 70, effective: 36, overflow: 0 },
  );
  assert.equal(getBuildEffectCapUsage(equipTraits([stun]), []).length, 1);
});

test("capGroup-less effects are excluded from Cap Usage", () => {
  const activeEffects = trioEffectsForTag("fish-man", "Fish-Man");
  assert.equal(activeEffects[0]?.effectId, "spd-increase-when-spawning");
  assert.equal(activeEffects[0]?.capGroup, undefined);
  assert.deepEqual(getEffectContributions(createEmptyEquippedExtraTraits(), activeEffects), []);
});

test("conditional Set Effects mark usage as Potential", () => {
  const damage8 = findTrait("damage-dealt-increase", 8, { conditional: false });
  const activeEffects = trioEffectsForTag("worst-generation", "Worst Generation");
  const usage = usageFor("damage-dealt-increase", equipTraits([damage8]), activeEffects);
  assert.equal(usage.hasPotentialContributions, true);
  assert.equal(usage.contributions.find(({ source }) => source === "extra-trait")?.condition, undefined);
  assert.ok(usage.contributions.find(({ source }) => source === "tag-set-effect")?.condition);
});

test("clearing a removed Medal slot removes its Extra Trait contributions", () => {
  const damage8 = findTrait("damage-dealt-increase", 8, { conditional: false });
  let equipped = createEmptyEquippedExtraTraits();
  equipped = setEquippedExtraTrait(equipped, 1, 0, damage8.id);
  assert.equal(getBuildEffectCapUsage(equipped, [])[0]?.total, 8);
  equipped = clearEquippedExtraTraitsForSlot(equipped, 1);
  assert.deepEqual(getBuildEffectCapUsage(equipped, []), []);
});
