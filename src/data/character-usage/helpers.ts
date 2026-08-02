import { characters } from "../characters";
import type {
  CharacterUsageChartRow,
  CharacterUsageRankingItem,
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

export function validateCharacterUsageSnapshots(snapshots: readonly CharacterUsageSnapshot[]): void {
  for (const snapshot of snapshots) {
    for (const [characterId, count] of Object.entries(snapshot.usage)) {
      if (!characters[characterId]) {
        throw new Error(`Unknown character ID "${characterId}" in character usage snapshot ${snapshot.date}. Add it to src/data/characters or correct the snapshot ID.`);
      }
      if (!Number.isFinite(count) || count < 0) {
        throw new Error(`Invalid usage count for "${characterId}" in character usage snapshot ${snapshot.date}: ${count}. Counts must be finite and non-negative.`);
      }
    }
  }
}

export function createCharacterUsageRanking(
  snapshot: CharacterUsageSnapshot,
  previousSnapshot: CharacterUsageSnapshot | null = null,
): CharacterUsageRankingItem[] {
  validateCharacterUsageSnapshots([snapshot, ...(previousSnapshot ? [previousSnapshot] : [])]);
  const effectivePlayers = getEffectivePlayerCount(getRecordedSlots(snapshot));
  const previousPlayers = previousSnapshot
    ? getEffectivePlayerCount(getRecordedSlots(previousSnapshot))
    : 0;

  return Object.entries(snapshot.usage)
    .map(([characterId, count]) => {
      const usageRate = getEstimatedUsageRate(count, effectivePlayers);
      const previousUsageRate = previousSnapshot
        ? getEstimatedUsageRate(previousSnapshot.usage[characterId] ?? 0, previousPlayers)
        : null;
      return {
        characterId,
        character: characters[characterId],
        count,
        usageRate,
        previousUsageRate,
        changePoints: previousUsageRate === null ? null : usageRate - previousUsageRate,
      };
    })
    .sort((a, b) => b.count - a.count || a.character.name.localeCompare(b.character.name))
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function processCharacterUsageSnapshots(
  snapshots: readonly CharacterUsageSnapshot[],
): ProcessedCharacterUsageSnapshot[] {
  validateCharacterUsageSnapshots(snapshots);
  const ordered = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  return ordered.map((snapshot, index) => {
    const recordedSlots = getRecordedSlots(snapshot);
    return {
      ...snapshot,
      usage: { ...snapshot.usage },
      recordedSlots,
      effectivePlayerCount: getEffectivePlayerCount(recordedSlots),
      coverage: getCoverage(recordedSlots, snapshot.targetPlayers),
      ranking: createCharacterUsageRanking(snapshot, ordered[index - 1] ?? null),
    };
  });
}

const rangeMonths: Record<Exclude<UsageRange, "All">, number> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };

export function filterSnapshotsByRange<T extends { date: string }>(snapshots: readonly T[], range: UsageRange): T[] {
  if (range === "All" || snapshots.length === 0) return [...snapshots];
  const latest = new Date(`${snapshots.at(-1)!.date}T00:00:00Z`);
  latest.setUTCMonth(latest.getUTCMonth() - rangeMonths[range]);
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
