export type TierName = "god" | "SS" | "S" | "A" | "B" | "C" | "D";
export type TierChangeKind = "rise" | "fall" | "new" | "adjustment";

export type ImportantTierChange = {
  characterId: string;
  kind: TierChangeKind;
  fromTier: TierName | null; // null only for a newly ranked character
  toTier: TierName;
  reason: string; // OPBR Guide's assessment, never an official ranking
};

export type ImportantTierUpdate = {
  id: string;
  status: "draft" | "published";
  publishedAt: string; // ISO timestamp with an explicit timezone
  title: string;
  summary: string;
  officialAdjustment?: {
    date: string; // YYYY-MM-DD, the official notice's date
    summary: string; // verified facts only; keep evaluation in change.reason
    sourceUrl: string;
  };
  changes: ImportantTierChange[];
};

// Editorial opt-in only. Reordering tierList.ts never creates an event.
// No event has yet been verified/selected for publication. See docs/tier-important-updates.md.
export const importantTierUpdates: ImportantTierUpdate[] = [];
