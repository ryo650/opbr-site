import type { MedalEffectCapGroupId, MedalEffectValue } from "./medal-effect-catalog";

export type MedalEffectCap = {
  readonly value: MedalEffectValue;
  readonly sourceNote?: string;
};

// Keep empty until a cap has been verified directly in-game.
export const effectCaps: Readonly<Partial<Record<MedalEffectCapGroupId, MedalEffectCap>>> = {};
