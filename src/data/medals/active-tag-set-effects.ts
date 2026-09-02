import {
  medalEffectCatalog,
  type MedalEffectCapGroupId,
  type MedalEffectCondition,
  type MedalEffectDefinition,
  type MedalEffectId,
  type MedalEffectValue,
  type MedalEffectValueSchema,
  type MedalEffectValueUnit,
} from "./medal-effect-catalog.ts";
import {
  tagSetEffectCountingPolicy,
  tagSetEffectGroups,
} from "./tag-set-effects.ts";
import type { Medal } from "./types.ts";

export type ActiveTagSetEffect = {
  readonly groupId: string;
  readonly tagId: string;
  readonly tagName: string;
  readonly setSize: 2 | 3;
  readonly effectId: MedalEffectId;
  readonly effectLabel: string;
  readonly value: MedalEffectValue;
  readonly valueSchema: MedalEffectValueSchema;
  readonly capGroup?: MedalEffectCapGroupId;
  readonly condition?: MedalEffectCondition;
  readonly sourceMedalIds: readonly string[];
};

const effectDefinitionById = new Map<string, MedalEffectDefinition>(
  medalEffectCatalog.map((definition) => [definition.id, definition]),
);

export function getActiveTagSetEffects(
  selectedMedals: readonly Medal[],
): ActiveTagSetEffect[] {
  if (
    tagSetEffectCountingPolicy.setScope !== "per-tag-id" ||
    tagSetEffectCountingPolicy.medalIdentity !== "distinct-medal-id"
  ) {
    throw new Error("Unsupported Tag Set Effect counting policy");
  }

  const tagNames = new Map<string, string>();
  const medalIdsByTag = new Map<string, Set<string>>();

  for (const medal of selectedMedals) {
    for (const tag of medal.tags) {
      if (!tagNames.has(tag.id)) tagNames.set(tag.id, tag.name);
      const medalIds = medalIdsByTag.get(tag.id) ?? new Set<string>();
      medalIds.add(medal.id);
      medalIdsByTag.set(tag.id, medalIds);
    }
  }

  const activeEffects: ActiveTagSetEffect[] = [];
  for (const group of tagSetEffectGroups) {
    const definition = effectDefinitionById.get(group.effectId);
    if (!definition) {
      throw new Error(`Missing Medal Effect definition: ${group.effectId}`);
    }

    for (const tagId of group.tagIds) {
      const sourceMedalIds = [...(medalIdsByTag.get(tagId) ?? [])];
      if (sourceMedalIds.length < 2) continue;

      const tagName = tagNames.get(tagId);
      if (!tagName) throw new Error(`Missing Tag display name: ${tagId}`);
      const setSize = sourceMedalIds.length >= 3 ? 3 : 2;

      activeEffects.push({
        groupId: group.id,
        tagId,
        tagName,
        setSize,
        effectId: definition.id as MedalEffectId,
        effectLabel: definition.label,
        value: setSize === 3 ? group.threeSet : group.twoSet,
        valueSchema: definition.valueSchema,
        capGroup: definition.capGroup,
        condition: definition.condition,
        sourceMedalIds,
      });
    }
  }

  return activeEffects;
}

function formatScalar(value: number, unit: MedalEffectValueUnit): string {
  if (unit === "percent") return `${value}%`;
  if (unit === "seconds") return `${value}s`;
  return String(value);
}

export function formatMedalEffectValue(
  value: MedalEffectValue,
  schema: MedalEffectValueSchema,
): string {
  if (typeof value === "number") {
    if (schema.kind !== "scalar") return String(value);
    return formatScalar(value, schema.unit);
  }
  if (value.kind === "timed") {
    const unit = schema.kind === "timed" ? schema.unit : "flat";
    return `${formatScalar(value.value, unit)} for ${value.durationSeconds}s`;
  }
  if (value.kind === "toggle") return value.enabled ? "Enabled" : "Disabled";
  return value.text;
}

export function formatMedalEffectCondition(
  condition: MedalEffectCondition,
): string {
  if (condition.kind === "text") return condition.description;
  const separator = condition.kind === "all" ? " and " : " or ";
  const prefix = condition.kind === "all" ? "All of: " : "Any of: ";
  return `${prefix}${condition.conditions
    .map((child) => {
      const formatted = formatMedalEffectCondition(child);
      return child.kind === "text" ? formatted : `(${formatted})`;
    })
    .join(separator)}`;
}
