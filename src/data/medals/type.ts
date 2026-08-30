export type MedalCategory = "character" | "event";

export type Medal = {
  id: string;
  name: string;
  image: string;
  category: MedalCategory;
  tags: string[];
  uniqueTrait: string;
  nativeTraits: string[];
  nativeEffects: string[];
  statusReductions: string[];
};
