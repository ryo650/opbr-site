import type { ExtraTraitDefinition, ExtraTraitSourceMetadata } from "./extra-traits.ts";

// Values verified directly in-game by the user. Acquisition metadata is kept
// separate so a canonical definition can have more than one source later.
export const supplementalExtraTraits = [
  {
    id: "hp-increase-640-points-unconditional",
    label: "HP Increase",
    effectId: "hp-increase",
    value: 640,
    unit: "points",
    capGroup: "hp-increase-points",
  },
  {
    id: "atk-increase-160-points-unconditional",
    label: "ATK Increase",
    effectId: "atk-increase",
    value: 160,
    unit: "points",
    capGroup: "atk-increase-points",
  },
  {
    id: "def-increase-160-points-unconditional",
    label: "DEF Increase",
    effectId: "def-increase",
    value: 160,
    unit: "points",
    capGroup: "def-increase-points",
  },
  {
    id: "hp-increase-24-percent-unconditional",
    label: "HP Increase",
    effectId: "hp-increase",
    value: 24,
    unit: "percent",
    capGroup: "hp-increase-percent",
  },
  {
    id: "atk-increase-24-percent-unconditional",
    label: "ATK Increase",
    effectId: "atk-increase",
    value: 24,
    unit: "percent",
    capGroup: "atk-increase-percent",
  },
  {
    id: "def-increase-24-percent-unconditional",
    label: "DEF Increase",
    effectId: "def-increase",
    value: 24,
    unit: "percent",
    capGroup: "def-increase-percent",
  },
  {
    id: "damage-dealt-increase-3-percent-unconditional",
    label: "Damage Dealt Increase",
    effectId: "damage-dealt-increase",
    value: 3,
    unit: "percent",
    capGroup: "damage-dealt-increase",
  },
  {
    id: "damage-dealt-increase-6-percent-unconditional",
    label: "Damage Dealt Increase",
    effectId: "damage-dealt-increase",
    value: 6,
    unit: "percent",
    capGroup: "damage-dealt-increase",
  },
  {
    id: "damage-dealt-increase-8-percent-unconditional",
    label: "Damage Dealt Increase",
    effectId: "damage-dealt-increase",
    value: 8,
    unit: "percent",
    capGroup: "damage-dealt-increase",
  },
  {
    id: "skill2-cooldown-reduction-speed-3-percent-unconditional",
    label: "Cooldown Reduction (Skill 2)",
    effectId: "skill2-cooldown-reduction-speed",
    value: 3,
    unit: "percent",
    capGroup: "skill2-cooldown-reduction-speed",
  },
] as const satisfies readonly ExtraTraitDefinition[];

export const supplementalExtraTraitSourceMetadata = {
  "hp-increase-640-points-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:hp-increase-640-points"],
  }],
  "atk-increase-160-points-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:atk-increase-160-points"],
  }],
  "def-increase-160-points-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:def-increase-160-points"],
  }],
  "hp-increase-24-percent-unconditional": [{
    source: "special-transfer-item",
    evidenceRefs: ["user-verified:builder-policy:hp-increase-24-percent"],
  }],
  "atk-increase-24-percent-unconditional": [{
    source: "special-transfer-item",
    evidenceRefs: ["user-verified:builder-policy:atk-increase-24-percent"],
  }],
  "def-increase-24-percent-unconditional": [{
    source: "special-transfer-item",
    evidenceRefs: ["user-verified:builder-policy:def-increase-24-percent"],
  }],
  "damage-dealt-increase-3-percent-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:damage-dealt-increase-3-percent"],
  }],
  "damage-dealt-increase-6-percent-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:damage-dealt-increase-6-percent"],
  }],
  "damage-dealt-increase-8-percent-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:damage-dealt-increase-8-percent"],
  }],
  "skill2-cooldown-reduction-speed-3-percent-unconditional": [{
    source: "transfer-item",
    evidenceRefs: ["user-verified:in-game:skill2-cooldown-reduction-speed-3-percent"],
  }],
} as const satisfies Readonly<Record<string, readonly ExtraTraitSourceMetadata[]>>;
