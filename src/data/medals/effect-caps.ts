import type { MedalEffectCapGroupId, MedalEffectValue } from "./medal-effect-catalog.ts";

export type MedalEffectCap = {
  readonly value: MedalEffectValue;
  readonly sourceNote?: string;
};

const verifiedInGame = "Verified directly in the in-game Limits screen.";

export const effectCaps: Readonly<Partial<Record<MedalEffectCapGroupId, MedalEffectCap>>> = {
  "skill1-cooldown-reduction-speed": { value: 30, sourceNote: verifiedInGame },
  "skill2-cooldown-reduction-speed": { value: 30, sourceNote: verifiedInGame },
  "hp-increase-percent": { value: 70, sourceNote: verifiedInGame },
  "hp-increase-points": { value: 1200, sourceNote: verifiedInGame },
  "atk-increase-percent": { value: 70, sourceNote: verifiedInGame },
  "atk-increase-points": { value: 300, sourceNote: verifiedInGame },
  "def-increase-percent": { value: 70, sourceNote: verifiedInGame },
  "def-increase-points": { value: 300, sourceNote: verifiedInGame },
  "crit-increase-percent": { value: 70, sourceNote: verifiedInGame },
  "crit-increase-value": { value: 2, sourceNote: verifiedInGame },
  "damage-dealt-increase": { value: 30, sourceNote: verifiedInGame },
  "damage-received-reduction": { value: 30, sourceNote: verifiedInGame },
  "normal-attack-damage-dealt-increase": { value: 30, sourceNote: verifiedInGame },
  "dodge-cooldown-reduction-speed": { value: 30, sourceNote: verifiedInGame },
  "capture-speed-increase": { value: 40, sourceNote: verifiedInGame },
  "spd-increase-percent": { value: 70, sourceNote: verifiedInGame },
  "stun-duration-reduction": { value: 70, sourceNote: verifiedInGame },
};
