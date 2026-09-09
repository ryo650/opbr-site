import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentSetSlotEntries } from "../../src/data/medals/current-set.ts";
import {
  clearEquippedExtraTraitsForSlot,
  createEmptyEquippedExtraTraits,
  setEquippedExtraTrait,
} from "../../src/data/medals/extra-traits.ts";

const medalA = { id: "medal-a", name: "Medal A" };
const medalB = { id: "medal-b", name: "Medal B" };
const medalC = { id: "medal-c", name: "Medal C" };

function entries(slots, extraTraits = createEmptyEquippedExtraTraits()) {
  return getCurrentSetSlotEntries(slots, extraTraits);
}

test("Details Current Set shows all three canonical equipped slots", () => {
  assert.deepEqual(entries([medalA, medalB, medalC]).map(({ medal }) => medal?.id), ["medal-a", "medal-b", "medal-c"]);
});

test("switching Details medals cannot change Current Set", () => {
  const slots = [medalA, medalB, medalC];
  assert.deepEqual(entries(slots), entries(slots));
});

test("opening an unequipped Medal cannot replace the Current Set source", () => {
  const unequippedDetailMedal = { id: "not-equipped", name: "Not Equipped" };
  assert.ok(unequippedDetailMedal);
  assert.deepEqual(entries([medalA, medalB, medalC]).map(({ medal }) => medal?.id), ["medal-a", "medal-b", "medal-c"]);
});

test("the same Medal in all three slots preserves slot identity", () => {
  const currentSet = entries([medalA, medalA, medalA]);
  assert.deepEqual(currentSet.map(({ slotIndex }) => slotIndex), [0, 1, 2]);
  assert.deepEqual(currentSet.map(({ medal }) => medal?.id), ["medal-a", "medal-a", "medal-a"]);
});

test("opening and closing Details preserves Extra Traits by slot", () => {
  let extraTraits = createEmptyEquippedExtraTraits();
  extraTraits = setEquippedExtraTrait(extraTraits, 0, 0, "hp-increase-18-percent-unconditional");
  extraTraits = setEquippedExtraTrait(extraTraits, 2, 1, "damage-dealt-increase-8-percent-unconditional");
  const currentSet = entries([medalA, medalB, medalC], extraTraits);
  assert.deepEqual(currentSet[0].extraTraitIds, ["hp-increase-18-percent-unconditional", null, null]);
  assert.deepEqual(currentSet[2].extraTraitIds, [null, "damage-dealt-increase-8-percent-unconditional", null]);
});

test("an actual slot removal synchronizes Details Current Set and its traits", () => {
  let extraTraits = createEmptyEquippedExtraTraits();
  extraTraits = setEquippedExtraTrait(extraTraits, 1, 0, "atk-increase-14-percent-unconditional");
  extraTraits = clearEquippedExtraTraitsForSlot(extraTraits, 1);
  const currentSet = entries([medalA, null, medalC], extraTraits);
  assert.equal(currentSet.filter(({ medal }) => medal).length, 2);
  assert.equal(currentSet[1].medal, null);
  assert.deepEqual(currentSet[1].extraTraitIds, [null, null, null]);
});
