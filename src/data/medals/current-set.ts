import type { EquippedExtraTraitsBySlot, EquippedExtraTraitSlots } from "./extra-traits.ts";
import type { Medal } from "./types.ts";

export type EquippedMedalSlots = readonly [Medal | null, Medal | null, Medal | null];

export type CurrentSetSlotEntry = {
  readonly slotIndex: number;
  readonly medal: Medal | null;
  readonly extraTraitIds: EquippedExtraTraitSlots;
};

export function getCurrentSetSlotEntries(
  slots: EquippedMedalSlots,
  extraTraitsBySlot: EquippedExtraTraitsBySlot,
): readonly CurrentSetSlotEntry[] {
  return slots.map((medal, slotIndex) => ({
    slotIndex,
    medal,
    extraTraitIds: extraTraitsBySlot[slotIndex],
  }));
}
