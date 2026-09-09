import { extraTraitCatalog } from "./extra-traits.generated.ts";
import {
  supplementalExtraTraits,
  supplementalExtraTraitSourceMetadata,
} from "./extra-traits-supplemental.ts";
import type {
  ExcludedRawExtraTrait,
  ExtraTraitDefinition,
  ExtraTraitSourceMetadata,
  RawExtraTraitDefinition,
  SelectableExtraTraitMissingEvidence,
} from "./extra-traits.ts";

const PRACTICAL_STAT_PERCENT_VALUES = new Set([12, 14, 18]);
const LOW_RARITY_STAT_PERCENT_VALUES = new Set([6.5, 7.5, 16]);

function selectableDefinitionId(definition: ExtraTraitDefinition): string {
  return `${definition.effectId}-${String(definition.value).replace(".", "-")}-${definition.unit}-unconditional`;
}

export function toSelectableExtraTraitDefinition(
  definition: ExtraTraitDefinition,
): ExtraTraitDefinition {
  return {
    id: selectableDefinitionId(definition),
    label: definition.label,
    effectId: definition.effectId,
    value: definition.value,
    unit: definition.unit,
    capGroup: definition.capGroup,
  };
}

function rawSelectionDecision(definition: RawExtraTraitDefinition): ExcludedRawExtraTrait["reason"] | null {
  switch (definition.effectId) {
    case "hp-increase":
    case "atk-increase":
    case "def-increase":
    case "crit-increase":
      if (definition.unit !== "percent") return "unsupported / not yet verified";
      if (PRACTICAL_STAT_PERCENT_VALUES.has(definition.value)) return null;
      return LOW_RARITY_STAT_PERCENT_VALUES.has(definition.value)
        ? "low-rarity / not practical"
        : "unsupported / not yet verified";
    case "damage-dealt-increase":
      return definition.unit === "percent" && definition.value === 3
        ? null
        : "not in Builder practical-value policy";
    case "damage-received-reduction":
      return definition.unit === "percent" && definition.value === 3
        ? null
        : "unsupported / not yet verified";
    case "skill1-cooldown-reduction-speed":
      return definition.unit === "percent" && definition.value === 3
        ? null
        : "low-rarity / not practical";
    case "skill2-cooldown-reduction-speed":
      return "low-rarity / not practical";
    case "stun-duration-reduction":
      return definition.unit === "percent" && definition.value === 36
        ? null
        : "unsupported / not yet verified";
    default:
      return "unsupported / not yet verified";
  }
}

function canonicalSignature(candidate: ExtraTraitDefinition): string {
  return JSON.stringify({
    id: candidate.id,
    label: candidate.label,
    effectId: candidate.effectId,
    value: candidate.value,
    unit: candidate.unit,
    capGroup: candidate.capGroup ?? null,
    condition: candidate.condition ?? null,
  });
}

export function mergeCanonicalExtraTraits(
  entries: readonly {
    readonly definition: ExtraTraitDefinition;
    readonly metadata: readonly ExtraTraitSourceMetadata[];
  }[],
) {
  const definitionsById = new Map<string, ExtraTraitDefinition>();
  const metadataById = new Map<string, ExtraTraitSourceMetadata[]>();

  entries.forEach(({ definition: sourceDefinition, metadata }) => {
    const definition = toSelectableExtraTraitDefinition(sourceDefinition);
    const existing = definitionsById.get(definition.id);
    if (existing && canonicalSignature(existing) !== canonicalSignature(definition)) {
      throw new Error(`Conflicting Extra Trait definition for stable ID: ${definition.id}`);
    }
    definitionsById.set(definition.id, existing ?? definition);
    const currentMetadata = metadataById.get(definition.id) ?? [];
    const mergedMetadata = [...currentMetadata];
    metadata.forEach((source) => {
      const matchingSource = mergedMetadata.find((candidate) => candidate.source === source.source);
      if (matchingSource) {
        const index = mergedMetadata.indexOf(matchingSource);
        mergedMetadata[index] = {
          source: source.source,
          evidenceRefs: [...new Set([...matchingSource.evidenceRefs, ...source.evidenceRefs])].sort(),
        };
      } else {
        mergedMetadata.push(source);
      }
    });
    metadataById.set(definition.id, mergedMetadata);
  });

  return {
    definitions: [...definitionsById.values()],
    sourceMetadataById: Object.fromEntries(metadataById),
  };
}

const rawCatalog = extraTraitCatalog as readonly RawExtraTraitDefinition[];
const selectableRawDefinitions = rawCatalog.filter((definition) => rawSelectionDecision(definition) === null);

export const excludedRawExtraTraits: readonly ExcludedRawExtraTrait[] = rawCatalog.flatMap((definition) => {
  const reason = rawSelectionDecision(definition);
  return reason ? [{ definition, reason }] : [];
});

const merged = mergeCanonicalExtraTraits([
  ...selectableRawDefinitions.map((definition) => ({
    definition,
    metadata: [{ source: "medal-rate" as const, evidenceRefs: definition.sourceRefs }],
  })),
  ...supplementalExtraTraits.map((definition) => ({
    definition,
    metadata: supplementalExtraTraitSourceMetadata[definition.id],
  })),
]);

export const selectableExtraTraits: readonly ExtraTraitDefinition[] = merged.definitions;
export const extraTraitSourceMetadataById: Readonly<Record<string, readonly ExtraTraitSourceMetadata[]>> = merged.sourceMetadataById;

export const selectableExtraTraitMissingEvidence = [] as const satisfies readonly SelectableExtraTraitMissingEvidence[];
