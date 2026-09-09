export const uniqueTraitCategoryCatalog = [
  { id: "cooldown", label: "Cooldown" },
  { id: "damage-increase", label: "Damage Increase" },
  { id: "damage-reduction", label: "Damage Reduction" },
  { id: "hp-recovery", label: "HP Recovery" },
  { id: "capture-speed", label: "Capture Speed" },
  { id: "treasure-gauge", label: "Treasure Gauge" },
  { id: "hp-increase", label: "HP Increase" },
  { id: "atk-increase", label: "ATK Increase" },
  { id: "def-increase", label: "DEF Increase" },
  { id: "crit-increase", label: "CRIT Increase" },
  { id: "status-effect-reduction", label: "Status Effect Reduction" },
  { id: "status-effect-nullification", label: "Status Effect Nullification" },
  { id: "status-effect-infliction", label: "Status Effect Infliction" },
  { id: "power-up-down", label: "Power Up/Down" },
  { id: "spd-increase", label: "SPD Increase" },
  { id: "skill-1", label: "Skill 1" },
  { id: "skill-2", label: "Skill 2" },
] as const;

export type UniqueTraitCategoryId =
  (typeof uniqueTraitCategoryCatalog)[number]["id"];

export type UniqueTraitCategoryMatchMode = "any" | "all";

export function matchesUniqueTraitCategories(
  medalCategoryIds: ReadonlySet<UniqueTraitCategoryId>,
  selectedCategoryIds: readonly UniqueTraitCategoryId[],
  matchMode: UniqueTraitCategoryMatchMode,
): boolean {
  if (!selectedCategoryIds.length) return true;
  return matchMode === "all"
    ? selectedCategoryIds.every((id) => medalCategoryIds.has(id))
    : selectedCategoryIds.some((id) => medalCategoryIds.has(id));
}

export function matchesUniqueTraitFilters(
  normalizedUniqueTrait: string,
  medalCategoryIds: ReadonlySet<UniqueTraitCategoryId>,
  selectedCategoryIds: readonly UniqueTraitCategoryId[],
  matchMode: UniqueTraitCategoryMatchMode,
  normalizedTextQuery: string,
): boolean {
  return (
    (!normalizedTextQuery || normalizedUniqueTrait.includes(normalizedTextQuery))
    && matchesUniqueTraitCategories(
      medalCategoryIds,
      selectedCategoryIds,
      matchMode,
    )
  );
}
