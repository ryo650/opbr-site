export type MedalSetCategory =
  | "general"
  | "attack"
  | "durability"
  | "capture-speed"
  | "skill-1"
  | "skill-2"
  | "skill-1-and-2";

export type RecommendedMedalSet = {
  readonly id: string;
  readonly name: string;
  readonly category: MedalSetCategory;
  readonly medalIds: readonly [string, string, string];
  readonly description?: string;
};
