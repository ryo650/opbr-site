import type { StatusEffectType } from "./status-effects.generated";

export type { StatusEffectType } from "./status-effects.generated";

export type MedalCategory = "character" | "event";

export type MedalTag = {
  id: string;
  name: string;
};

export type NativeTraitType = "atk" | "def" | "hp" | "crit";

export type Medal = {
  id: string;
  name: string;
  category: MedalCategory;
  uniqueTrait: string;
  tags: readonly MedalTag[];
  nativeTraits: readonly NativeTraitType[];
  statusReductions?: readonly StatusEffectType[];
};
