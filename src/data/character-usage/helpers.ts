import type {
  CharacterUsageChartRow,
  CharacterUsageSnapshot,
  ProcessedCharacterUsageSnapshot,
  UsageRange,
} from "./type";

export function getRecordedSlots(snapshot: CharacterUsageSnapshot): number {
  return Object.values(snapshot.usage).reduce((total, count) => total + count, 0);
}

export function getEffectivePlayerCount(recordedSlots: number): number {
  return recordedSlots / 2;
}

export function getCoverage(recordedSlots: number, targetPlayers: number): number {
  return targetPlayers > 0 ? (recordedSlots / (targetPlayers * 2)) * 100 : 0;
}

export function getEstimatedUsageRate(count: number, effectivePlayerCount: number): number {
  return effectivePlayerCount > 0 ? (count / effectivePlayerCount) * 100 : 0;
}

export function getAvailableCharacterIds(snapshots: readonly CharacterUsageSnapshot[]): string[] {
  return [...new Set(snapshots.flatMap((snapshot) => Object.keys(snapshot.usage)))];
}

const rangeMonths: Record<Exclude<UsageRange, "All">, number> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };

export function filterSnapshotsByRange<T extends { date: string }>(snapshots: readonly T[], range: UsageRange): T[] {
  if (range === "All" || snapshots.length === 0) return [...snapshots];
  const latest = new Date(`${snapshots.at(-1)!.date}T00:00:00Z`);
  const day = latest.getUTCDate();
  latest.setUTCDate(1);
  latest.setUTCMonth(latest.getUTCMonth() - rangeMonths[range]);
  const lastDay = new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth() + 1, 0)).getUTCDate();
  latest.setUTCDate(Math.min(day, lastDay));
  return snapshots.filter((snapshot) => new Date(`${snapshot.date}T00:00:00Z`) >= latest);
}

export function buildChartData(
  snapshots: readonly ProcessedCharacterUsageSnapshot[],
  characterIds: readonly string[],
): CharacterUsageChartRow[] {
  return snapshots.map((snapshot) => ({
    date: snapshot.date,
    values: Object.fromEntries(characterIds.map((characterId) => {
      const count = snapshot.usage[characterId] ?? 0;
      return [characterId, { count, usageRate: getEstimatedUsageRate(count, snapshot.effectivePlayerCount) }];
    })),
  }));
}
