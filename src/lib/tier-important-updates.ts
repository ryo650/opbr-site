import type { ImportantTierUpdate, TierChangeKind } from "@/data/tier-important-updates";

export const tierChangeLabels: Record<TierChangeKind, { symbol: string; label: string }> = {
  rise: { symbol: "↑", label: "Tier rise" },
  fall: { symbol: "↓", label: "Tier drop" },
  new: { symbol: "+", label: "New entry" },
  adjustment: { symbol: "≈", label: "Key adjustment" },
};

export type TierUpdateBadge = {
  kind: TierChangeKind;
  expiresAt: number;
};

type RankingRow = { tier: string; characterIds: readonly string[] };
const badgeLifetime = 14 * 24 * 60 * 60 * 1000;

export function getImportantTierUpdateState(
  events: readonly ImportantTierUpdate[],
  rankings: readonly RankingRow[],
  now: number,
) {
  const published = events
    .filter((event) => event.status === "published" && event.changes.length > 0)
    .map((event) => ({ event, timestamp: Date.parse(event.publishedAt) }))
    .filter(({ timestamp }) => Number.isFinite(timestamp))
    .sort((a, b) => b.timestamp - a.timestamp || b.event.id.localeCompare(a.event.id));
  const latest = published.find(({ timestamp }) => timestamp <= now);
  const currentTiers = Object.fromEntries(rankings.flatMap((row) => row.characterIds.map((id) => [id, row.tier])));
  const badges: Record<string, TierUpdateBadge> = {};
  if (!latest) return { update: null, currentTiers, badges };

  const next = published.filter(({ timestamp }) => timestamp > now).at(-1);
  const expiresAt = Math.min(latest.timestamp + badgeLifetime, next?.timestamp ?? Infinity);
  if (now < expiresAt) {
    for (const change of latest.event.changes) {
      // An old announcement must never imply a different current placement.
      if (currentTiers[change.characterId] === change.toTier) {
        badges[change.characterId] = { kind: change.kind, expiresAt };
      }
    }
  }
  return { update: latest.event, currentTiers, badges };
}
