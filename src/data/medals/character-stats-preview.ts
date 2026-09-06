import type { CharacterLevel100Stats } from "../characters/level-100-stats.ts";
import type { Character } from "../characters/type.ts";
import { getBuildEffectCapUsage } from "./effect-cap-usage.ts";
import type { EquippedExtraTraitsBySlot } from "./extra-traits.ts";
import type { MedalEffectCapGroupId } from "./medal-effect-catalog.ts";

export type CharacterPreviewStatId = "hp" | "atk" | "def";

export type CharacterStatPreviewValue = {
  readonly base: number;
  readonly effectivePercent: number;
  readonly effectivePoints: number;
  readonly increase: number;
};

export type CharacterStatsPreview = {
  readonly character: Character;
  readonly level100Stats: CharacterLevel100Stats;
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

export function getCharacterStatsPreview(
  character: Character | null | undefined,
  level100Stats: CharacterLevel100Stats | null | undefined,
  extraTraitsBySlot: EquippedExtraTraitsBySlot,
): CharacterStatsPreview | null {
  if (!character || !level100Stats) return null;
  if (character.id !== level100Stats.characterId) {
    throw new Error(`Character Stats entry does not match Character: ${level100Stats.characterId}`);
  }

  // Passing no Set Effects or Medals intentionally limits this preview to
  // equipped Extra Traits while retaining the canonical cap calculation.
  const usageByCapGroup = new Map(
    getBuildEffectCapUsage(extraTraitsBySlot, [], []).map((usage) => [usage.capGroup, usage]),
  );

  const getStat = (stat: CharacterPreviewStatId): CharacterStatPreviewValue => {
    const base = level100Stats[stat];
    const capGroups = capGroupsByStat[stat];
    const effectivePercent = usageByCapGroup.get(capGroups.percent)?.effective ?? 0;
    const effectivePoints = usageByCapGroup.get(capGroups.points)?.effective ?? 0;
    return {
      base,
      effectivePercent,
      effectivePoints,
      increase: base * effectivePercent / 100 + effectivePoints,
    };
  };

  return {
    character,
    level100Stats,
    stats: {
      hp: getStat("hp"),
      atk: getStat("atk"),
      def: getStat("def"),
    },
  };
}
