export type TierName = "god" | "SS" | "S" | "A" | "B" | "C" | "D";
export type TierChangeKind = "rise" | "fall" | "new" | "adjustment";

export type ImportantTierChange = {
  characterId: string;
  kind: TierChangeKind;
  fromTier: TierName | null; // null for a new entry or a rise from unranked
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
export const importantTierUpdates: ImportantTierUpdate[] = [
  {
    id: "2026-10-03-halloween-uta-rise",
    status: "published",
    publishedAt: "2026-10-03T19:00:00+09:00",
    title: "Happy Halloween Uta rises into B Tier",
    summary: "Recent buffs move Happy Halloween Uta from unranked into B Tier.",
    changes: [
      {
        characterId: "happy-halloween-uta",
        kind: "rise",
        fromTier: null,
        toTier: "B",
        reason:
          "The recent buffs greatly improved Uta’s Treasure control and durability. Above 50% HP, she can ignore enemies while capturing Treasure and while charging her team’s Treasure Gauge up to 150%, making her significantly more reliable in contested Treasure Areas.",
      },
    ],
  },
];
