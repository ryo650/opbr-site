import type { Medal } from "@/data/medals";
import type { RecommendedMedalSet } from "./types";

export type ResolvedMedalSetSlot = {
  readonly medalId: string;
  readonly medal: Medal | undefined;
};

export function createMedalById(medals: readonly Medal[]) {
  return new Map(medals.map((medal) => [medal.id, medal]));
}

export function resolveMedalSetSlots(
  set: RecommendedMedalSet,
  medalById: ReadonlyMap<string, Medal>,
): readonly ResolvedMedalSetSlot[] {
  return set.medalIds.map((medalId) => ({ medalId, medal: medalById.get(medalId) }));
}

export function getResolvedMedals(slots: readonly ResolvedMedalSetSlot[]) {
  return slots.flatMap(({ medal }) => (medal ? [medal] : []));
}
