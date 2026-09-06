import type { ActiveTagSetEffect } from "./active-tag-set-effects.ts";
import { effectCaps } from "./effect-caps.ts";
import {
  extraTraitDefinitionById,
  type EquippedExtraTraitsBySlot,
} from "./extra-traits.ts";
import {
  medalEffectCapGroups,
  medalEffectCatalog,
  type MedalEffectCapGroupId,
  type MedalEffectCondition,
  type MedalEffectDefinition,
  type MedalEffectValueUnit,
} from "./medal-effect-catalog.ts";
import type { Medal } from "./types.ts";
import { uniqueTraitEffectsByMedalId } from "./unique-trait-effects.generated.ts";

export type EffectContributionSource = "extra-trait" | "tag-set-effect" | "unique-trait";

export type EffectContribution = {
  readonly source: EffectContributionSource;
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly capGroup: MedalEffectCapGroupId;
  readonly value: number;
  readonly unit: MedalEffectValueUnit;
  readonly condition?: MedalEffectCondition;
  readonly isPotential: boolean;
  readonly originalText?: string;
};

export type EffectCapUsage = {
  readonly capGroup: MedalEffectCapGroupId;
  readonly label: string;
  readonly unit: MedalEffectValueUnit;
  readonly contributions: readonly EffectContribution[];
  readonly total: number;
  readonly cap?: number;
  readonly effective: number;
  readonly overflow: number;
  readonly hasPotentialContributions: boolean;
};

const usageOrder: readonly MedalEffectCapGroupId[] = [
  "hp-increase-percent",
  "hp-increase-points",
  "atk-increase-percent",
  "atk-increase-points",
  "def-increase-percent",
  "def-increase-points",
  "crit-increase-percent",
  "crit-increase-value",
  "damage-dealt-increase",
  "normal-attack-damage-dealt-increase",
  "damage-received-reduction",
  "skill1-cooldown-reduction-speed",
  "skill2-cooldown-reduction-speed",
  "dodge-cooldown-reduction-speed",
  "capture-speed-increase",
  "stun-duration-reduction",
  "spd-increase-percent",
];

const usageOrderById = new Map(usageOrder.map((capGroup, index) => [capGroup, index]));
const capGroupDefinitionById = new Map(medalEffectCapGroups.map((definition) => [definition.id, definition]));
const effectDefinitionById = new Map<string, MedalEffectDefinition>(
  medalEffectCatalog.map((definition) => [definition.id, definition]),
);

function getScalarUnit(capGroup: MedalEffectCapGroupId): MedalEffectValueUnit {
  const definition = capGroupDefinitionById.get(capGroup);
  if (!definition) throw new Error(`Missing Effect Cap Group definition: ${capGroup}`);
  if (definition.valueSchema.kind !== "scalar") {
    throw new Error(`Effect Cap Usage requires a scalar cap group: ${capGroup}`);
  }
  return definition.valueSchema.unit;
}

export function getEffectContributions(
  extraTraitsBySlot: EquippedExtraTraitsBySlot,
  activeTagSetEffects: readonly ActiveTagSetEffect[],
  equippedMedals: readonly (Medal | null)[] = [],
): EffectContribution[] {
  const contributions: EffectContribution[] = [];

  extraTraitsBySlot.forEach((traitIds, medalSlotIndex) => {
    traitIds.forEach((traitId, traitSlotIndex) => {
      if (!traitId) return;
      const definition = extraTraitDefinitionById.get(traitId);
      if (!definition?.capGroup) return;
      const unit = getScalarUnit(definition.capGroup);
      if (definition.unit !== unit) {
        throw new Error(`Extra Trait unit does not match cap group: ${definition.id}`);
      }
      contributions.push({
        source: "extra-trait",
        sourceId: definition.id,
        sourceLabel: `Slot ${medalSlotIndex + 1} · Trait ${traitSlotIndex + 1}`,
        capGroup: definition.capGroup,
        value: definition.value,
        unit,
        condition: definition.condition,
        isPotential: Boolean(definition.condition),
      });
    });
  });

  activeTagSetEffects.forEach((effect) => {
    if (!effect.capGroup) return;
    if (typeof effect.value !== "number" || effect.valueSchema.kind !== "scalar") {
      throw new Error(`Tag Set Effect with a cap group must have a scalar value: ${effect.effectId}`);
    }
    const unit = getScalarUnit(effect.capGroup);
    if (effect.valueSchema.unit !== unit) {
      throw new Error(`Tag Set Effect unit does not match cap group: ${effect.effectId}`);
    }
    contributions.push({
      source: "tag-set-effect",
      sourceId: `${effect.groupId}:${effect.tagId}`,
      sourceLabel: `${effect.tagName} · ${effect.setSize} Set`,
      capGroup: effect.capGroup,
      value: effect.value,
      unit,
      condition: effect.condition,
      isPotential: Boolean(effect.condition),
    });
  });

  equippedMedals.forEach((medal, medalSlotIndex) => {
    if (!medal) return;
    const extractions = uniqueTraitEffectsByMedalId[medal.id] ?? [];
    extractions.forEach((extraction, extractionIndex) => {
      const definition = effectDefinitionById.get(extraction.effectId);
      if (!definition) {
        throw new Error(`Missing Unique Trait Effect definition: ${extraction.effectId}`);
      }
      if (!definition.capGroup) return;
      if (definition.valueSchema.kind !== "scalar") {
        throw new Error(`Unique Trait Effect with a cap group must be scalar: ${extraction.effectId}`);
      }
      const unit = getScalarUnit(definition.capGroup);
      if (extraction.unit !== unit || definition.valueSchema.unit !== unit) {
        throw new Error(`Unique Trait Effect unit does not match cap group: ${extraction.effectId}`);
      }
      contributions.push({
        source: "unique-trait",
        sourceId: `${medal.id}:${medalSlotIndex}:${extractionIndex}`,
        sourceLabel: `${medal.name} · Unique Trait`,
        capGroup: definition.capGroup,
        value: extraction.value,
        unit,
        isPotential: true,
        originalText: extraction.originalText,
      });
    });
  });

  return contributions;
}

export function summarizeEffectCapUsage(
  contributions: readonly EffectContribution[],
): EffectCapUsage[] {
  const contributionsByCapGroup = new Map<MedalEffectCapGroupId, EffectContribution[]>();
  contributions.forEach((contribution) => {
    const expectedUnit = getScalarUnit(contribution.capGroup);
    if (contribution.unit !== expectedUnit) {
      throw new Error(`Contribution unit does not match cap group: ${contribution.sourceId}`);
    }
    const group = contributionsByCapGroup.get(contribution.capGroup) ?? [];
    group.push(contribution);
    contributionsByCapGroup.set(contribution.capGroup, group);
  });

  return [...contributionsByCapGroup.entries()].map(([capGroup, groupedContributions]) => {
    const definition = capGroupDefinitionById.get(capGroup);
    if (!definition) throw new Error(`Missing Effect Cap Group definition: ${capGroup}`);
    const total = groupedContributions.reduce((sum, contribution) => sum + contribution.value, 0);
    const configuredCap = effectCaps[capGroup]?.value;
    const cap = typeof configuredCap === "number" ? configuredCap : undefined;
    return {
      capGroup,
      label: definition.label,
      unit: getScalarUnit(capGroup),
      contributions: groupedContributions,
      total,
      cap,
      effective: cap === undefined ? total : Math.min(total, cap),
      overflow: cap === undefined ? 0 : Math.max(total - cap, 0),
      hasPotentialContributions: groupedContributions.some(({ isPotential }) => isPotential),
    };
  }).sort((left, right) =>
    (usageOrderById.get(left.capGroup) ?? Number.MAX_SAFE_INTEGER)
      - (usageOrderById.get(right.capGroup) ?? Number.MAX_SAFE_INTEGER)
      || left.label.localeCompare(right.label)
  );
}

export function getBuildEffectCapUsage(
  extraTraitsBySlot: EquippedExtraTraitsBySlot,
  activeTagSetEffects: readonly ActiveTagSetEffect[],
  equippedMedals: readonly (Medal | null)[] = [],
): EffectCapUsage[] {
  return summarizeEffectCapUsage(getEffectContributions(extraTraitsBySlot, activeTagSetEffects, equippedMedals));
}

export function getEffectCapFillPercent(
  usage: Pick<EffectCapUsage, "effective" | "cap">,
): number {
  if (usage.cap === undefined || usage.cap <= 0) return 0;
  return Math.min(100, Math.max(0, usage.effective / usage.cap * 100));
}

export function formatEffectCapScalar(value: number, unit: MedalEffectValueUnit): string {
  if (unit === "percent") return `${value}%`;
  if (unit === "points") return `${value} Pts`;
  if (unit === "seconds") return `${value}s`;
  if (unit === "count") return `×${value}`;
  return String(value);
}
