import type {
  MedalEffectCapGroupId,
  MedalEffectCondition,
  MedalEffectValueUnit,
} from "./medal-effect-catalog.ts";
import {
  extraTraitCatalog,
  extraTraitCatalogNeedsReview,
} from "./extra-traits.generated.ts";
import {
  extraTraitSourceMetadataById,
  excludedRawExtraTraits,
  selectableExtraTraitMissingEvidence,
  selectableExtraTraits,
  toSelectableExtraTraitDefinition,
} from "./selectable-extra-traits.ts";
import { supplementalExtraTraits } from "./extra-traits-supplemental.ts";

export type ExtraTraitEffectId =
  | "hp-increase"
  | "atk-increase"
  | "def-increase"
  | "crit-increase"
  | "skill1-cooldown-reduction-speed"
  | "skill2-cooldown-reduction-speed"
  | "damage-dealt-increase"
  | "damage-received-reduction"
  | `${string}-duration-reduction`;

export type ExtraTraitDefinition = {
  readonly id: string;
  readonly label: string;
  readonly effectId: ExtraTraitEffectId;
  readonly value: number;
  readonly unit: MedalEffectValueUnit;
  readonly capGroup?: MedalEffectCapGroupId;
  readonly condition?: MedalEffectCondition;
};

export type RawExtraTraitDefinition = ExtraTraitDefinition & {
  readonly sourceRefs: readonly string[];
};

export type ExtraTraitSource =
  | "medal-rate"
  | "transfer-item"
  | "special-transfer-item";

export type ExtraTraitSourceMetadata = {
  readonly source: ExtraTraitSource;
  readonly evidenceRefs: readonly string[];
};

export type ExcludedRawExtraTrait = {
  readonly definition: RawExtraTraitDefinition;
  readonly reason:
    | "low-rarity / not practical"
    | "duplicate canonical definition"
    | "needsReview"
    | "not in Builder practical-value policy"
    | "unsupported / not yet verified";
};

export type SelectableExtraTraitMissingEvidence = {
  readonly label: string;
  readonly effectId: ExtraTraitEffectId;
  readonly value: number | null;
  readonly unit: MedalEffectValueUnit;
  readonly expectedSource: ExtraTraitSource;
  readonly missing: readonly string[];
  readonly reason: string;
};

export type ExtraTraitCatalogIssue = {
  readonly sourceRef: string;
  readonly text: string;
  readonly reason: string;
};

export type EquippedExtraTraitSlots = [string | null, string | null, string | null];
export type EquippedExtraTraitsBySlot = [
  EquippedExtraTraitSlots,
  EquippedExtraTraitSlots,
  EquippedExtraTraitSlots,
];

const EMPTY_TRAIT_SLOTS = (): EquippedExtraTraitSlots => [null, null, null];

export function createEmptyEquippedExtraTraits(): EquippedExtraTraitsBySlot {
  return [EMPTY_TRAIT_SLOTS(), EMPTY_TRAIT_SLOTS(), EMPTY_TRAIT_SLOTS()];
}

export function setEquippedExtraTrait(
  current: EquippedExtraTraitsBySlot,
  medalSlotIndex: number,
  traitSlotIndex: number,
  traitId: string | null,
): EquippedExtraTraitsBySlot {
  const next = current.map((traits) => [...traits]) as EquippedExtraTraitsBySlot;
  next[medalSlotIndex][traitSlotIndex] = traitId;
  return next;
}

export function clearEquippedExtraTraitsForSlot(
  current: EquippedExtraTraitsBySlot,
  medalSlotIndex: number,
): EquippedExtraTraitsBySlot {
  const next = current.map((traits) => [...traits]) as EquippedExtraTraitsBySlot;
  next[medalSlotIndex] = EMPTY_TRAIT_SLOTS();
  return next;
}

export function prepareExtraTraitsForMedalPlacement(
  current: EquippedExtraTraitsBySlot,
  medalSlotIndex: number,
  previousMedalId: string | null,
  nextMedalId: string,
): EquippedExtraTraitsBySlot {
  return previousMedalId === nextMedalId
    ? current
    : clearEquippedExtraTraitsForSlot(current, medalSlotIndex);
}

export const extraTraitDefinitionById: ReadonlyMap<string, ExtraTraitDefinition> = new Map(
  selectableExtraTraits.map((definition) => [definition.id, definition]),
);

const rawExtraTraitSearchEntries = (extraTraitCatalog as readonly RawExtraTraitDefinition[]).map((definition) => ({
  definition,
  text: [
    definition.label,
    definition.effectId,
    definition.value,
    definition.unit,
    definition.condition?.kind === "text" ? definition.condition.description : "",
  ].join(" ").toLocaleLowerCase(),
}));

const selectableExtraTraitSearchEntries = selectableExtraTraits.map((definition) => ({
  definition,
  text: [
    definition.label,
    definition.effectId,
    definition.value,
    definition.unit,
    definition.condition?.kind === "text" ? definition.condition.description : "",
  ].join(" ").toLocaleLowerCase(),
}));

export function searchRawExtraTraitCatalog(query: string): readonly RawExtraTraitDefinition[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return extraTraitCatalog as readonly RawExtraTraitDefinition[];
  return rawExtraTraitSearchEntries
    .filter((entry) => entry.text.includes(needle))
    .map((entry) => entry.definition);
}

export function searchSelectableExtraTraits(query: string): readonly ExtraTraitDefinition[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return selectableExtraTraits;
  return selectableExtraTraitSearchEntries
    .filter((entry) => entry.text.includes(needle))
    .map((entry) => entry.definition);
}

export function formatExtraTraitValue(definition: ExtraTraitDefinition): string {
  if (definition.unit === "percent") return `${definition.value}%`;
  if (definition.unit === "points") return `+${definition.value} Pts`;
  if (definition.unit === "seconds") return `${definition.value}s`;
  if (definition.unit === "count") return `×${definition.value}`;
  return String(definition.value);
}

export {
  excludedRawExtraTraits,
  extraTraitCatalog,
  extraTraitCatalogNeedsReview,
  extraTraitSourceMetadataById,
  selectableExtraTraitMissingEvidence,
  selectableExtraTraits,
  supplementalExtraTraits,
  toSelectableExtraTraitDefinition,
};
