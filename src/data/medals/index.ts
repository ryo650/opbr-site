export { medals } from "./medals";
export { effectCaps } from "./effect-caps";
export {
  medalEffectCapGroups,
  medalEffectCatalog,
  medalEffectFilterCategories,
} from "./medal-effect-catalog";
export { tagSetEffectCountingPolicy, tagSetEffectGroups } from "./tag-set-effects";
export {
  uniqueTraitCategoryCatalog,
  matchesUniqueTraitCategories,
  matchesUniqueTraitFilters,
} from "./unique-trait-categories";
export {
  uniqueTraitCategoryIdsByMedalId,
  uniqueTraitCategoryNeedsReview,
} from "./unique-trait-categories.generated";
export type {
  Medal,
  MedalCategory,
  MedalTag,
  NativeTraitType,
  StatusEffectType,
} from "./types";
export type { MedalEffectCap } from "./effect-caps";
export type {
  MedalEffectCapGroupDefinition,
  MedalEffectCapGroupId,
  MedalEffectCondition,
  MedalEffectDefinition,
  MedalEffectFilterCategory,
  MedalEffectId,
  MedalEffectValue,
  MedalEffectValueSchema,
  MedalEffectValueUnit,
} from "./medal-effect-catalog";
export type { TagSetEffectGroup } from "./tag-set-effects";
export type {
  UniqueTraitCategoryId,
  UniqueTraitCategoryMatchMode,
} from "./unique-trait-categories";
