export type MedalCategory = "character" | "event";

export type MedalTag = {
  id: string;
  name: string;
};

export type NativeTraitType = "atk" | "def" | "hp" | "crit";

export type StatusEffectType =
  | "clawed"
  | "capture-block"
  | "aflame"
  | "tremor"
  | "stun"
  | "poison"
  | "confuse"
  | "shock"
  | "freeze"
  | "entrance";

export type Medal = {
  id: string;
  name: string;
  category: MedalCategory;
  uniqueTrait: string;
  tags: readonly MedalTag[];
  nativeTraits: readonly NativeTraitType[];
  statusReductions?: readonly StatusEffectType[];
};
