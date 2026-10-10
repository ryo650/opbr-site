import type { Medal } from "./types.ts";

const RECENT_CATALOG_ANCHOR_ID = "halloween-perona";
const RECENT_CATALOG_SECOND_ID = "ill-trick-you";
export const RECENT_MEDALS_LIMIT = 8;

/**
 * Return the most recently ADDED medals to OPBR Guide, not latest in-game
 * releases. The existing incremental importer appends genuinely new medals
 * without reordering production entries.
 *
 * The first two recorded additions were committed together on 2026-10-01:
 * Halloween Perona and I'll Trick You. The older baseline of 698 medals
 * cannot be chronologically ordered safely, so we do not guess at dates
 * or show random older medals just to fill eight slots.
 *
 * After this anchored batch, future append-only imports appear here
 * automatically. If the known anchor is missing or reordered, show nothing
 * rather than display incorrectly labeled "new" medals.
 */
export function getRecentlyAddedMedals(
  catalog: readonly Medal[],
  limit = RECENT_MEDALS_LIMIT,
): Medal[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  const anchor = catalog.findIndex((medal) => medal.id === RECENT_CATALOG_ANCHOR_ID);
  if (anchor < 0 || catalog[anchor + 1]?.id !== RECENT_CATALOG_SECOND_ID) return [];
  const count = Math.floor(limit);
  if (count <= 0) return [];
  return catalog.slice(anchor).slice(-count).reverse();
}
