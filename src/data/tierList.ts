import type { TierName } from "./tier-important-updates";

type TierRow = {
  tier: TierName;
  colorClass: string;
  characterIds: string[];
  hidden?: boolean;
};

// Source: user screenshot, October 21, 2026 at 16:00:51 JST, left to right.
// Later requests place black Roger first and blue Lucci second in C, overriding the screenshot.
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
      "the-five-elders-st-marcus-mars",
      "unexpected-collaboration-rob-lucci",
    ],
  },
  {
    tier: "A",
    colorClass: "A",
    characterIds: [
      "the-five-elders-st-ethanbaron-v-nusjuro",
      "the-four-emperors-monkey-d-luffy",
      "the-wings-zoro-sanji",
      "happy-halloween-uta",
      "the-four-emperors-marshall-d-teach",
      "navy-hq-fleet-admiral-akainu",
      "kaido-s-son-yamato",
      "animal-kingdom-pirates-lead-performer-king",
    ],
  },
  {
    tier: "B",
    colorClass: "B",
    characterIds: [
      "king-of-the-pirates-gol-d-roger",
      "legendary-hero-monkey-d-garp",
      "father-and-daughter-kuma-bonny",
      "ama-no-murakumo-sword-kizaru",
      "blackbeard-pirates-kuzan",
      "daimyo-of-kuri-kozuki-oden",
      "red-rock-monkey-d-luffy",
    ],
  },
  {
    tier: "C",
    colorClass: "C",
    characterIds: [
      "great-pirate-gol-d-roger",
      "awakened-form-rob-lucci",
      "great-pirate-edward-newgate",
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
