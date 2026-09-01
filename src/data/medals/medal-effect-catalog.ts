export const medalEffectFilterCategories = [
  "cooldown",
  "damage-increase",
  "damage-reduction",
  "hp-recovery",
  "capture-speed",
  "treasure-gauge",
  "hp-increase",
  "atk-increase",
  "def-increase",
  "crit-increase",
  "status-effect-reduction",
  "status-effect-nullification",
  "status-effect-infliction",
  "power-up-down",
  "spd-increase",
  "skill-1",
  "skill-2",
] as const;

export type MedalEffectFilterCategory = (typeof medalEffectFilterCategories)[number];
export type MedalEffectValueUnit = "percent" | "seconds" | "flat" | "count";

export type MedalEffectValue =
  | number
  | { readonly kind: "timed"; readonly value: number; readonly durationSeconds: number }
  | { readonly kind: "toggle"; readonly enabled: boolean }
  | { readonly kind: "text"; readonly text: string };

export type MedalEffectValueSchema =
  | { readonly kind: "scalar"; readonly unit: MedalEffectValueUnit }
  | { readonly kind: "timed"; readonly unit: MedalEffectValueUnit }
  | { readonly kind: "toggle" }
  | { readonly kind: "text" };

export type MedalEffectCondition =
  | { readonly kind: "text"; readonly description: string }
  | {
      readonly kind: "all" | "any";
      readonly conditions: readonly MedalEffectCondition[];
    };

export type MedalEffectCapGroupDefinition = {
  readonly id: string;
  readonly label: string;
  readonly valueSchema: MedalEffectValueSchema;
};

// Add a group only after confirming that effects share its in-game cap bucket.
export const medalEffectCapGroups = [
  {
    id: "skill1-cooldown-reduction-speed",
    label: "Cooldown Reduction Speed (Skill 1)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "skill2-cooldown-reduction-speed",
    label: "Cooldown Reduction Speed (Skill 2)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
] as const satisfies readonly MedalEffectCapGroupDefinition[];

export type MedalEffectCapGroupId = (typeof medalEffectCapGroups)[number]["id"];

export type MedalEffectDefinition = {
  readonly id: string;
  readonly label: string;
  readonly filterCategories: readonly MedalEffectFilterCategory[];
  readonly valueSchema: MedalEffectValueSchema;
  readonly capGroup?: MedalEffectCapGroupId;
  readonly condition?: MedalEffectCondition;
};

export const medalEffectCatalog = [
  {
    id: "skill1-cooldown-reduction-speed",
    label: "Cooldown Reduction (Skill 1)",
    filterCategories: ["cooldown", "skill-1"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "skill1-cooldown-reduction-speed",
  },
  {
    id: "skill2-cooldown-reduction-speed",
    label: "Cooldown Reduction (Skill 2)",
    filterCategories: ["cooldown", "skill-2"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "skill2-cooldown-reduction-speed",
  },
] as const satisfies readonly MedalEffectDefinition[];

export type MedalEffectId = (typeof medalEffectCatalog)[number]["id"];
