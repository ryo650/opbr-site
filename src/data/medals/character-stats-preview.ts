import {
  getCharacterBoostProfile,
  isCharacterBoostRole,
  type CharacterBoostProfile,
  type CharacterBoostStageId,
} from "../characters/boost-profiles.ts";
import {
  hasCompleteCharacterLevel100BaseStats,
  type CompleteCharacterLevel100BaseStats,
  type CharacterLevel100BaseStats,
} from "../characters/level-100-base-stats.ts";
import type { Character } from "../characters/type.ts";
import { getBuildEffectCapUsage } from "./effect-cap-usage.ts";
import type { EquippedExtraTraitsBySlot } from "./extra-traits.ts";
import type { MedalEffectCapGroupId } from "./medal-effect-catalog.ts";

export type CharacterPreviewStatId = "hp" | "atk" | "def";

export type CharacterStatPreviewValue = {
  readonly base: number;
  readonly boost: number;
  readonly displayed: number;
  readonly effectivePercent: number;
  readonly effectivePoints: number;
  readonly increase: number;
};

export type CharacterStatsPreview = {
  readonly character: Character;
  readonly level100BaseStats: CompleteCharacterLevel100BaseStats;
  readonly boostProfile: CharacterBoostProfile;
  readonly stats: Readonly<Record<CharacterPreviewStatId, CharacterStatPreviewValue>>;
};

const capGroupsByStat: Readonly<Record<CharacterPreviewStatId, {
  readonly percent: MedalEffectCapGroupId;
  readonly points: MedalEffectCapGroupId;
}>> = {
  hp: { percent: "hp-increase-percent", points: "hp-increase-points" },
  atk: { percent: "atk-increase-percent", points: "atk-increase-points" },
  def: { percent: "def-increase-percent", points: "def-increase-points" },
};

const baseStatKeys: Readonly<Record<CharacterPreviewStatId, "baseHp" | "baseAtk" | "baseDef">> = {
  hp: "baseHp",
  atk: "baseAtk",
  def: "baseDef",
};

export function calculateCharacterStatPreviewValue(
  base: number,
  boost: number,
  effectivePercent: number,
  effectivePoints: number,
): CharacterStatPreviewValue {
  // The game rounds each percentage contribution up before adding flat points.
  const percentageIncrease = Math.ceil(base * effectivePercent / 100);
  return {
    base,
    boost,
    displayed: base + boost,
    effectivePercent,
    effectivePoints,
    // Medal percentages always use the unboosted Base Stat. Flat points are
    // added after rounding and are never multiplied or rounded with the total.
    increase: percentageIncrease + effectivePoints,
  };
}

export function getCharacterStatsPreview(
  character: Character | null | undefined,
  level100BaseStats: CharacterLevel100BaseStats | null | undefined,
  extraTraitsBySlot: EquippedExtraTraitsBySlot,
  boostStageId: CharacterBoostStageId = "boost-max",
): CharacterStatsPreview | null {
  if (!character || !level100BaseStats || !hasCompleteCharacterLevel100BaseStats(level100BaseStats)) return null;
  if (character.id !== level100BaseStats.characterId) {
    throw new Error(`Character Base Stats entry does not match Character: ${level100BaseStats.characterId}`);
  }
  if (!isCharacterBoostRole(character.role)) {
    throw new Error(`Character role cannot resolve a Boost profile: ${character.role}`);
  }
  const boostProfile = getCharacterBoostProfile(character.role, boostStageId);
  const boostValues = boostProfile.values;

  // Passing no Set Effects or Medals intentionally limits this preview to
  // equipped Extra Traits while retaining the canonical cap calculation.
  const usageByCapGroup = new Map(
    getBuildEffectCapUsage(extraTraitsBySlot, [], []).map((usage) => [usage.capGroup, usage]),
  );

  const getStat = (stat: CharacterPreviewStatId): CharacterStatPreviewValue => {
    const base = level100BaseStats[baseStatKeys[stat]];
    const boost = boostValues[stat];
    const capGroups = capGroupsByStat[stat];
    const effectivePercent = usageByCapGroup.get(capGroups.percent)?.effective ?? 0;
    const effectivePoints = usageByCapGroup.get(capGroups.points)?.effective ?? 0;
    return calculateCharacterStatPreviewValue(base, boost, effectivePercent, effectivePoints);
  };

  return {
    character,
    level100BaseStats,
    boostProfile,
    stats: {
      hp: getStat("hp"),
      atk: getStat("atk"),
      def: getStat("def"),
    },
  };
}
