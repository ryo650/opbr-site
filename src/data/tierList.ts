import type { TierName } from "./tier-important-updates";

type TierRow = {
  tier: TierName;
  colorClass: string;
  characterIds: string[];
  hidden?: boolean;
};

// Source: user screenshot, November 12, 2026 at 10:30:39 JST, left to right.
// November 12 follow-up places Egghead Sanji immediately after Kuma & Bonney.
// November 14 adds Genius Scientist Vegapunk at the top of C and moves FILM RED Shanks to the end of S.
// Earlier placements are in tier-list-archive.ts.
export const tierList: TierRow[] = [
  { tier: "god", colorClass: "god", hidden: true, characterIds: [] },
  {
    tier: "SS",
    colorClass: "SS",
    characterIds: [
      "the-five-elders-st-shepherd-ju-peter",
      "future-where-i-m-the-most-free-jewelry-bonney",
      "awakened-form-rob-lucci",
    ],
  },
  {
    tier: "S",
    colorClass: "S",
    characterIds: [
      "the-five-elders-st-topman-warcury",
      "flame-emperor-sabo",
      "film-red-shanks",
    ],
  },
  {
    tier: "A",
    colorClass: "A",
    characterIds: [
      "the-four-emperors-monkey-d-luffy",
      "winner-island-trafalgar-law",
      "animal-kingdom-pirates-lead-performer-king",
      "the-five-elders-st-marcus-mars",
      "unexpected-collaboration-rob-lucci",
    ],
  },
  {
    tier: "B",
    colorClass: "B",
    characterIds: [
      "the-five-elders-st-ethanbaron-v-nusjuro",
      "battle-of-monsters-on-onigashima-kaido",
      "the-wings-zoro-sanji",
      "ama-no-murakumo-sword-kizaru",
      "great-pirate-edward-newgate",
      "king-of-the-pirates-gol-d-roger",
      "kaido-s-son-yamato",
      "father-and-daughter-kuma-bonny",
      "egghead-sanji",
      "egghead-tony-tony-chopper",
      "the-four-emperors-marshall-d-teach",
      "happy-halloween-uta",
    ],
  },
  {
    tier: "C",
    colorClass: "C",
    characterIds: [
      "genius-scientist-vegapunk",
      "great-pirate-gol-d-roger",
      "legendary-hero-monkey-d-garp",
      "asl-ace-sabo-luffy",
      "blackbeard-pirates-kuzan",
      "red-rock-monkey-d-luffy",
      "navy-hq-fleet-admiral-akainu",
      "man-who-dreams-of-becoming-the-king-of-the-pirates-monkey-d-luffy",
      "divine-departure-shanks",
    ],
  },
  { tier: "D", colorClass: "D", hidden: true, characterIds: [] },
];

// Visibility only affects the public ranking table. Hidden placements still resolve in updates.
export const visibleTierList = tierList.filter((row) => !row.hidden && row.characterIds.length > 0);
