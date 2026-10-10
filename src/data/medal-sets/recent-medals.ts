import type { Medal } from "../medals/types.ts";

export const RECENT_MEDAL_LIMIT = 10;

// The Medal Importer appends each new medal to the existing production catalog,
// preserving previous entry order. This is the newest *site addition* order,
// not verified in-game release chronology. Keep release dates out of this UI
// until a reliable, reviewed release-date source exists.
export function getRecentlyAddedMedals(
  catalog: readonly Medal[],
  limit: number = RECENT_MEDAL_LIMIT,
): Medal[] {
  const count = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 0;
  if (count === 0) return [];
  return catalog.slice(-count).reverse();
}
