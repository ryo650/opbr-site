import { characters } from "../characters";
import type { CharacterUsageSnapshot, CharacterUsageRankingItem, ProcessedCharacterUsageSnapshot } from "./type";
import { getEffectivePlayerCount, getRecordedSlots, getEstimatedUsageRate, getCoverage } from "./helpers";

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

