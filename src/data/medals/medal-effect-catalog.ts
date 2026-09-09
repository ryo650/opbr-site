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
  "dodge",
] as const;

export type MedalEffectFilterCategory = (typeof medalEffectFilterCategories)[number];
export type MedalEffectValueUnit = "percent" | "points" | "seconds" | "flat" | "count";

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
  {
    id: "dodge-cooldown-reduction-speed",
    label: "Cooldown Reduction Speed (Dodging)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "capture-speed-increase",
    label: "Capture Speed Increase",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "damage-received-reduction",
    label: "Damage Received Reduction",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "damage-dealt-increase",
    label: "Damage Dealt Increase",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "hp-increase-percent",
    label: "HP Increase (%)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "hp-increase-points",
    label: "HP Increase (Pts)",
    valueSchema: { kind: "scalar", unit: "points" },
  },
  {
    id: "atk-increase-percent",
    label: "ATK Increase (%)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "atk-increase-points",
    label: "ATK Increase (Pts)",
    valueSchema: { kind: "scalar", unit: "points" },
  },
  {
    id: "def-increase-percent",
    label: "DEF Increase (%)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "def-increase-points",
    label: "DEF Increase (Pts)",
    valueSchema: { kind: "scalar", unit: "points" },
  },
  {
    id: "crit-increase-percent",
    label: "CRIT Increase (%)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "crit-increase-value",
    label: "CRIT Increase (Value)",
    valueSchema: { kind: "scalar", unit: "flat" },
  },
  {
    id: "normal-attack-damage-dealt-increase",
    label: "Normal Attack Damage Dealt Increase",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "spd-increase-percent",
    label: "SPD Increase (%)",
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "stun-duration-reduction",
    label: "Stun Duration Reduction",
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
    id: "damage-dealt-increase",
    label: "Damage Dealt Increase",
    filterCategories: ["damage-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "damage-dealt-increase",
  },
  {
    id: "normal-attack-damage-dealt-increase",
    label: "Normal Attack Damage Dealt Increase",
    filterCategories: ["damage-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "normal-attack-damage-dealt-increase",
  },
  {
    id: "damage-received-reduction",
    label: "Damage Received Reduction",
    filterCategories: ["damage-reduction"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "damage-received-reduction",
  },
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
  {
    id: "dodge-cooldown-reduction-speed",
    label: "Cooldown Reduction (Dodging)",
    filterCategories: ["cooldown", "dodge"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "dodge-cooldown-reduction-speed",
  },
  {
    id: "capture-speed-increase",
    label: "Capture Speed Increase",
    filterCategories: ["capture-speed"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "capture-speed-increase",
  },
  {
    id: "hp-increase",
    label: "HP Increase",
    filterCategories: ["hp-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "hp-increase-percent",
  },
  {
    id: "atk-increase",
    label: "ATK Increase",
    filterCategories: ["atk-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "atk-increase-percent",
  },
  {
    id: "def-increase",
    label: "DEF Increase",
    filterCategories: ["def-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "def-increase-percent",
  },
  {
    id: "crit-increase",
    label: "CRIT Increase",
    filterCategories: ["crit-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "crit-increase-percent",
  },
  {
    id: "spd-increase",
    label: "SPD Increase",
    filterCategories: ["spd-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "spd-increase-percent",
  },
  {
    id: "crit-increase-timed-cannot-stack",
    label: "CRIT Increase (Timed, Cannot Stack)",
    filterCategories: ["crit-increase", "power-up-down"],
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "spd-increase-timed-cannot-stack",
    label: "SPD Increase (Timed, Cannot Stack)",
    filterCategories: ["spd-increase", "power-up-down"],
    valueSchema: { kind: "scalar", unit: "percent" },
  },
  {
    id: "spd-increase-when-spawning",
    label: "SPD Increase (When spawning)",
    filterCategories: ["spd-increase"],
    valueSchema: { kind: "timed", unit: "percent" },
    condition: {
      kind: "text",
      description: "When spawning. Cannot stack.",
    },
  },
  {
    id: "damage-received-reduction-when-team-has-less-treasure-secured",
    label: "Received Damage Reduction (When your team has less Treasure secured)",
    filterCategories: ["damage-reduction"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "damage-received-reduction",
    condition: {
      kind: "text",
      description: "When your team has less Treasure secured.",
    },
  },
  {
    id: "damage-dealt-increase-when-team-has-less-treasure-secured",
    label: "Inflicted Damage Increase (When your team has less Treasure secured)",
    filterCategories: ["damage-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "damage-dealt-increase",
    condition: {
      kind: "text",
      description: "When your team has less Treasure secured.",
    },
  },
  {
    id: "damage-dealt-increase-when-allies-near-treasure-area",
    label: "Inflicted Damage Increase (When your allies are near the Treasure area)",
    filterCategories: ["damage-increase"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "damage-dealt-increase",
    condition: {
      kind: "text",
      description: "When your allies are near the Treasure area where you are at.",
    },
  },
  {
    id: "damage-received-reduction-when-allies-not-near-treasure-area",
    label: "Received Damage Reduction (When your allies are not near the Treasure area)",
    filterCategories: ["damage-reduction"],
    valueSchema: { kind: "scalar", unit: "percent" },
    capGroup: "damage-received-reduction",
    condition: {
      kind: "text",
      description: "When your allies are not near the Treasure area where you are at.",
    },
  },
] as const satisfies readonly MedalEffectDefinition[];

export type MedalEffectId = (typeof medalEffectCatalog)[number]["id"];
