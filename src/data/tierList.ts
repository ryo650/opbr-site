import type { TierName } from "./tier-important-updates";

type TierRow = {
  tier: TierName;
  colorClass: string;
  characterIds: string[];
  hidden?: boolean;
};

// Source: user screenshot, October 21, 2026 at 16:00:51 JST, left to right.
// October 22 and 23 user-requested placements override the screenshot.
// Directional assessments are registered separately in tier-important-updates.ts
// and are intentionally unchanged by these placement-only edits.
// Earlier placements, including characters omitted from the screenshot, are in tier-list-archive.ts.
export const tierList: TierRow[] = [
  { tier: "god", colorClass: "god", hidden: true, characterIds: [] },
  {
    tier: "SS",
    colorClass: "SS",
    characterIds: [
      "the-five-elders-st-topman-warcury",
      "the-five-elders-st-shepherd-ju-peter",
    ],
  },
  {
    tier: "S",
    colorClass: "S",
    characterIds: [
      "flame-emperor-sabo",
      "future-where-i-m-the-most-free-jewelry-bonney",
      "winner-island-trafalgar-law",
    ],
  },
  {
    tier: "A",
    colorClass: "A",
    characterIds: [
      "the-five-elders-st-marcus-mars",
      "the-five-elders-st-ethanbaron-v-nusjuro",
      "kaido-s-son-yamato",
      "animal-kingdom-pirates-lead-performer-king",
      "navy-hq-fleet-admiral-akainu",
      "ama-no-murakumo-sword-kizaru",
      "happy-halloween-uta",
      "unexpected-collaboration-rob-lucci",
    ],
  },
  {
    tier: "B",
    colorClass: "B",
    characterIds: [
      "the-four-emperors-monkey-d-luffy",
      "great-pirate-edward-newgate",
      "the-wings-zoro-sanji",
      "king-of-the-pirates-gol-d-roger",
      "father-and-daughter-kuma-bonny",
      "egghead-tony-tony-chopper",
      "awakened-form-rob-lucci",
      "the-four-emperors-marshall-d-teach",
    ],
  },
  {
    tier: "C",
    colorClass: "C",
    characterIds: [
      "blackbeard-pirates-kuzan",
      "legendary-hero-monkey-d-garp",
      "daimyo-of-kuri-kozuki-oden",
      "great-pirate-gol-d-roger",
      "germa-66-vinsmoke-niji",
      "battle-of-monsters-on-onigashima-kaido",
      "film-red-shanks",
      "seraphim-s-snake",
      "the-blue-dorry",
      "the-red-broggy",
    ],
  },
  { tier: "D", colorClass: "D", hidden: true, characterIds: [] },
];

// Visibility only affects the public ranking table. Hidden placements still resolve in updates.
export const visibleTierList = tierList.filter((row) => !row.hidden && row.characterIds.length > 0);
