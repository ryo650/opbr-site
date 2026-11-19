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
// The November 14 follow-up places Awakened Form Rob Lucci first in S.
// November 15 moves Bonney and Lucci ahead of Peter in SS and puts Sabo first in S.
// November 19 adds Stussy and reorders A/B/C; November 15 placements are archived in tier-list-archive.ts.
export const tierList: TierRow[] = [
  { tier: "god", colorClass: "god", hidden: true, characterIds: [] },
  {
    tier: "SS",
    colorClass: "SS",
    characterIds: [
      "future-where-i-m-the-most-free-jewelry-bonney",
      "awakened-form-rob-lucci",
      "the-five-elders-st-shepherd-ju-peter",
    ],
  },
  {
    tier: "S",
    colorClass: "S",
    characterIds: [
      "flame-emperor-sabo",
      "the-five-elders-st-topman-warcury",
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
      "great-pirate-edward-newgate",
      "the-five-elders-st-ethanbaron-v-nusjuro",
      "ama-no-murakumo-sword-kizaru",
      "vegapunk-s-spy-stussy",
    ],
  },
  {
    tier: "B",
    colorClass: "B",
    characterIds: [
      "battle-of-monsters-on-onigashima-kaido",
      "the-five-elders-st-marcus-mars",
      "seraphim-s-snake",
      "father-and-daughter-kuma-bonny",
      "unexpected-collaboration-rob-lucci",
      "the-wings-zoro-sanji",
      "king-of-the-pirates-gol-d-roger",
      "kaido-s-son-yamato",
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
      "seraphim-s-shark",
      "genius-scientist-vegapunk",
      "great-pirate-gol-d-roger",
      "punk-02-lilith",
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
