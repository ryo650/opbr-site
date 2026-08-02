import type { Character } from "../characters/type";

export type CharacterUsageSnapshot = {
  date: string;
  targetPlayers: number;
  usage: Record<string, number>;
};

export type UsageRange = "1M" | "3M" | "6M" | "1Y" | "All";

export type UsageComparison = {
  previousUsageRate: number | null;
  changePoints: number | null;
};

export type CharacterUsageRankingItem = UsageComparison & {
  characterId: string;
  character: Character;
  count: number;
  usageRate: number;
  rank: number;
};

export type ProcessedCharacterUsageSnapshot = {
  date: string;
  targetPlayers: number;
  recordedSlots: number;
  effectivePlayerCount: number;
  coverage: number;
  usage: Readonly<Record<string, number>>;
  ranking: CharacterUsageRankingItem[];
};

export type CharacterUsageChartRow = {
  date: string;
  values: Record<string, { count: number; usageRate: number }>;
};

export type CharacterUsageAnalytics = {
  snapshots: ProcessedCharacterUsageSnapshot[];
  availableCharacters: Character[];
  guideCharacterIds: string[];
};
