import type { Medal, MedalEffectId, NativeTraitType, StatusEffectType, UniqueTraitCategoryId, UniqueTraitCategoryMatchMode } from "../medals";
import { matchesUniqueTraitFilters } from "../medals/unique-trait-categories.ts";
import { uniqueTraitCategoryIdsByMedalId } from "../medals/unique-trait-categories.generated.ts";
import { matchesSelectedTagSetEffects, type TagSetEffectFilterIndex } from "../medals/active-tag-set-effects";

export type FinderCatalogFilters = {
  category: "all" | Medal["category"];
  setEffectIds: readonly MedalEffectId[];
  tagIds: readonly string[];
  uniqueTraitCategories: readonly UniqueTraitCategoryId[];
  uniqueTraitMatchMode: UniqueTraitCategoryMatchMode;
  uniqueTraitQuery: string;
  nativeTraits: readonly NativeTraitType[];
  nativeEffects: readonly string[];
  statusReductions: readonly StatusEffectType[];
};

export const emptyFinderCatalogFilters: FinderCatalogFilters = {
  category: "all",
  setEffectIds: [],
  tagIds: [],
  uniqueTraitCategories: [],
  uniqueTraitMatchMode: "any",
  uniqueTraitQuery: "",
  nativeTraits: [],
  nativeEffects: [],
  statusReductions: [],
};

export function countFinderCatalogFilters(filters: FinderCatalogFilters): number {
  return Number(filters.category !== "all") +
    filters.setEffectIds.length +
    filters.tagIds.length +
    filters.uniqueTraitCategories.length +
    Number(Boolean(filters.uniqueTraitQuery.trim())) +
    filters.nativeTraits.length +
    filters.nativeEffects.length +
    filters.statusReductions.length +
    Number(filters.uniqueTraitMatchMode !== "any");
}

// This filters a candidate MEDAL, never the three-medal set logic.
// Semantics intentionally match Medal Builder: selected explicit tags and other
// trait types are ANDed; selected Set Effect groups each accept any of their tags.
export function matchesFinderCatalogFilters(
  medal: Medal,
  filters: FinderCatalogFilters,
  effectTagIdsById: TagSetEffectFilterIndex,
  categoriesByMedalId: Readonly<Record<string, readonly UniqueTraitCategoryId[]>> = uniqueTraitCategoryIdsByMedalId,
): boolean {
  if (filters.category !== "all" && medal.category !== filters.category) return false;
  const tagIds = new Set(medal.tags.map((tag) => tag.id));
  if (!matchesSelectedTagSetEffects(tagIds, filters.setEffectIds, effectTagIdsById)) return false;
  if (!filters.tagIds.every((id) => tagIds.has(id))) return false;
  if (!matchesUniqueTraitFilters(
    medal.uniqueTrait.toLocaleLowerCase(),
    new Set(categoriesByMedalId[medal.id] ?? []),
    filters.uniqueTraitCategories,
    filters.uniqueTraitMatchMode,
    filters.uniqueTraitQuery.trim().toLocaleLowerCase(),
  )) return false;
  if (!filters.nativeTraits.every((id) => medal.nativeTraits.includes(id))) return false;
  if (!filters.nativeEffects.every((id) => medal.nativeEffects?.includes(id as NonNullable<Medal["nativeEffects"]>[number]))) return false;
  if (!filters.statusReductions.every((id) => medal.statusReductions?.includes(id))) return false;
  return true;
}
