import type { ScoutBanner } from "./type";

export type ScoutSummary = Pick<ScoutBanner, "id" | "name" | "bannerImg" | "startAt" | "endAt" | "featuredCharacterId"> & {
  displayPickupIds: readonly string[];
};

// Evidence references point to a small reviewed manifest, not an OCR import system.
export type ScoutSource = {
  kind: "fixture" | "gameScreenshots";
  evidencePath: string;
  context: string;
};
export type PoolEntry = { characterId: string; weight: number; rarity: 2 | 3 | 4; featured: boolean };
export type CharacterPool = {
  kind: "characterWeights";
  unit: "relative" | "percent";
  entries: readonly PoolEntry[];
  source: ScoutSource;
};
export type GuaranteeCriterion =
  | { kind: "rarityAtLeast"; rarity: 2 | 3 | 4 }
  | { kind: "characterIds"; characterIds: readonly string[] };
export type SlotGroup =
  | { role: "normal"; poolId: string; count: number }
  | { role: "guarantee"; poolId: string; count: number; criterion: GuaranteeCriterion };
export type DrawPlan =
  | { kind: "independentSlots"; groups: readonly SlotGroup[] }
  // Distinct distributions. Reserved kinds are explicitly rejected by this slice.
  | { kind: "minimumMatchRepair" }
  | { kind: "conditionalBatch" };
export type DisplayReward = {
  kind: "displayItem"; rewardId: string; label: string; quantity: number; grant: "onStepCompletion";
};
export type ScoutStep = {
  id: string;
  displayLabel: string;
  cost: { kind: "rainbowDiamonds"; amount: number };
  eligibility: { kind: "unrestricted" } | { kind: "paidDiamondsOnly" };
  pullCount: number;
  drawPlan: DrawPlan;
  rewards: readonly DisplayReward[];
};
export type StepUpDefinition = {
  kind: "stepUp";
  schemaVersion: 1;
  meta: ScoutSummary;
  source: ScoutSource;
  pools: Readonly<Record<string, CharacterPool>>;
  steps: readonly ScoutStep[];
  repeat: { kind: "finite"; maxRounds: number } | { kind: "unlimited" };
};
export type NormalDefinition = { kind: "normal"; legacy: ScoutBanner };
export type ScoutDefinition = NormalDefinition | StepUpDefinition;

export function getScoutSummary(definition: ScoutDefinition): ScoutSummary {
  switch (definition.kind) {
    case "normal": return { ...definition.legacy, displayPickupIds: definition.legacy.pickups.map(p => p.characterId) };
    case "stepUp": return definition.meta;
    default: throw new Error("Unsupported scout kind");
  }
}
