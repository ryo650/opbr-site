export type TierName = "god" | "SS" | "S" | "A" | "B" | "C" | "D";
export type TierChangeKind = "rise" | "fall" | "new" | "adjustment";

export type ImportantTierChange = {
  characterId: string;
  kind: TierChangeKind;
  fromTier: TierName | null; // null for a new entry or a rise from unranked
  toTier: TierName;
  reason?: string; // Optional editorial detail; never an official ranking
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
    id: "2026-10-08-post-buff-tier-review",
    status: "published",
    publishedAt: "2026-10-08T17:40:00+09:00",
    title: "Oden Buff Meta Impact: 7 ranking changes",
    summary: "Only Oden received a character buff. His buffs have shifted the meta, changing the relative value of other characters: six rises and one drop in our rankings.",
    changes: [
      {
        characterId: "daimyo-of-kuri-kozuki-oden",
        kind: "rise",
        fromTier: null,
        toTier: "A",
        reason: "Recent buffs improve Oden's Treasure-capturing value, placing him at the top of A Tier.",
      },
      {
        characterId: "blackbeard-pirates-kuzan",
        kind: "rise",
        fromTier: "A",
        toTier: "A",
      },
      {
        characterId: "ama-no-murakumo-sword-kizaru",
        kind: "fall",
        fromTier: "B",
        toTier: "C",
      },
      {
        characterId: "seraphim-s-snake",
        kind: "rise",
        fromTier: "C",
        toTier: "B",
      },
      {
        characterId: "divine-departure-shanks",
        kind: "rise",
        fromTier: "D",
        toTier: "C",
      },
      {
        characterId: "father-and-daughter-kuma-bonny",
        kind: "rise",
        fromTier: "B",
        toTier: "A",
      },
      {
        characterId: "unexpected-collaboration-rob-lucci",
        kind: "rise",
        fromTier: "B",
        toTier: "B",
      },
    ],
  },
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
