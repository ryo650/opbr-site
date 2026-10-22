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

const odenBuffOctober8Review: ImportantTierUpdate = {
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
};

// Editorial opt-in only. Reordering tierList.ts never creates an event.
export const importantTierUpdates: ImportantTierUpdate[] = [
  {
    id: "2026-10-21-warcury-ju-peter-meta",
    status: "published",
    publishedAt: "2026-10-21T16:00:51+09:00",
    title: "Warcury & Ju Peter Meta: 14 ranking changes and 2 new entries",
    summary: "Warcury and St. Shepherd Ju Peter enter SS Tier. Their arrival shifts the meta: eight characters move up and six move down in relative ranking. Up/Down reflects our assessment of the current meta, not character buffs or nerfs.",
    changes: [
      {
        characterId: "the-five-elders-st-shepherd-ju-peter",
        kind: "new",
        fromTier: null,
        toTier: "SS",
        reason: "Enters SS Tier at the top of the October 21 ranking.",
      },
      {
        characterId: "the-five-elders-st-topman-warcury",
        kind: "new",
        fromTier: null,
        toTier: "SS",
        reason: "Enters SS Tier immediately after St. Shepherd Ju Peter.",
      },
      {
        characterId: "flame-emperor-sabo",
        kind: "rise",
        fromTier: "A",
        toTier: "S",
        reason: "Rises to the top of S Tier in the meta following Warcury and Ju Peter's arrival.",
      },
      {
        characterId: "winner-island-trafalgar-law",
        kind: "rise",
        fromTier: "A",
        toTier: "S",
        reason: "Rises to S Tier as his relative value increases in the new meta.",
      },
      {
        characterId: "unexpected-collaboration-rob-lucci",
        kind: "rise",
        fromTier: "B",
        toTier: "S",
        reason: "Rises to S Tier as his relative value increases in the new meta.",
      },
      {
        characterId: "king-of-the-pirates-gol-d-roger",
        kind: "rise",
        fromTier: "C",
        toTier: "B",
        reason: "Green Roger rises to the top of B Tier in the new meta.",
      },
      {
        characterId: "legendary-hero-monkey-d-garp",
        kind: "rise",
        fromTier: "C",
        toTier: "B",
        reason: "Rises to second in B Tier in the new meta.",
      },
      {
        characterId: "film-red-shanks",
        kind: "rise",
        fromTier: null,
        toTier: "C",
        reason: "Enters the ranked data in C Tier as his relative value increases in the new meta.",
      },
      {
        characterId: "ama-no-murakumo-sword-kizaru",
        kind: "rise",
        fromTier: "C",
        toTier: "B",
        reason: "Rises to B Tier, immediately after Kuma & Bonney, as his relative value increases in the current meta.",
      },
      {
        characterId: "navy-hq-fleet-admiral-akainu",
        kind: "rise",
        fromTier: "C",
        toTier: "A",
        reason: "Rises to A Tier, immediately after Blackbeard, as his relative value increases in the current meta.",
      },
      {
        characterId: "the-five-elders-st-ethanbaron-v-nusjuro",
        kind: "fall",
        fromTier: "SS",
        toTier: "A",
        reason: "Moves to the top of A Tier as his relative ranking falls in the new meta.",
      },
      {
        characterId: "the-four-emperors-monkey-d-luffy",
        kind: "fall",
        fromTier: "SS",
        toTier: "A",
        reason: "White Nika moves to A Tier as his relative ranking falls in the new meta.",
      },
      {
        characterId: "the-wings-zoro-sanji",
        kind: "fall",
        fromTier: "S",
        toTier: "A",
        reason: "Moves to A Tier as their relative ranking falls in the new meta.",
      },
      {
        characterId: "blackbeard-pirates-kuzan",
        kind: "fall",
        fromTier: "A",
        toTier: "B",
        reason: "Moves to B Tier as his relative ranking falls in the new meta.",
      },
      {
        characterId: "father-and-daughter-kuma-bonny",
        kind: "fall",
        fromTier: "A",
        toTier: "B",
        reason: "Moves to B Tier as their relative ranking falls in the new meta.",
      },
      {
        characterId: "daimyo-of-kuri-kozuki-oden",
        kind: "fall",
        fromTier: "A",
        toTier: "B",
        reason: "Moves to B Tier as his relative ranking falls in the new meta.",
      },
    ],
  },
  {
    id: "2026-10-10-oden-meta-follow-up",
    status: "published",
    publishedAt: "2026-10-10T13:50:00+09:00",
    title: "Oden Buff Meta Impact: 2 additional ranking changes",
    summary: "Following our October 8 review, Zoro & Sanji move to the bottom of S Tier and St. Marcus Mars moves to the top. These are relative ranking changes caused by Oden's buff and its impact on the meta, not balance adjustments to either character. The seven October 8 changes are retained below: seven rises and two drops across the combined review.",
    changes: [
      {
        characterId: "the-wings-zoro-sanji",
        kind: "fall",
        fromTier: "S",
        toTier: "S",
        reason: "Down to the bottom of S Tier: Oden's buff has shifted the meta, lowering Zoro & Sanji's relative evaluation. Zoro & Sanji themselves have not received a balance adjustment.",
      },
      {
        characterId: "the-five-elders-st-marcus-mars",
        kind: "rise",
        fromTier: "S",
        toTier: "S",
        reason: "Up to the top of S Tier: Oden's buff has shifted the meta, raising St. Marcus Mars's relative evaluation. St. Marcus Mars himself has not received a balance adjustment.",
      },
      // The latest event owns all markers; retain the October 8 review's seven changes.
      ...odenBuffOctober8Review.changes,
    ],
  },
  odenBuffOctober8Review,
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
