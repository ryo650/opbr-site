import type { MedalEffectId, MedalEffectValue } from "./medal-effect-catalog";

export type TagSetEffectGroup = {
  readonly id: string;
  readonly effectId: MedalEffectId;
  readonly twoSet: MedalEffectValue;
  readonly threeSet: MedalEffectValue;
  readonly tagIds: readonly string[];
};

export const tagSetEffectCountingPolicy = {
  setScope: "per-tag-id",
  medalIdentity: "distinct-medal-id",
} as const;

// tagIds share this rule, but each tagId's Set count must be calculated independently.
// A selected Medal.id contributes at most once to a tag's count. Duplicate selections stay
// valid in the Builder, but cannot advance that tag from no Set to Pair or from Pair to Trio.
// Add only values verified directly in-game. Tag names remain sourced from Medal.tags.
export const tagSetEffectGroups = [
  {
    id: "skill-1",
    effectId: "skill1-cooldown-reduction-speed",
    twoSet: 14,
    threeSet: 20,
    tagIds: [
      "east-blue",
      "the-grand-line",
      "alabasta",
      "sky-island-lrll",
      "water-7-enies-lobby",
      "thriller-bark",
      "sabaody-archipelago-island-of-women",
      "impel-down",
      "the-paramount-war-at-marineford",
      "2-years-later",
      "fish-man-island",
      "punk-hazard",
      "dressrosa",
      "reverie",
      "zou-whole-cake-island",
      "land-of-wano",
      "egghead",
      "film-strong-world",
      "film-gold",
      "film-z",
      "stampede",
      "film-red",
      "odyssey",
      "bikini",
      "holy-night",
    ],
  },
  {
    id: "skill-2",
    effectId: "skill2-cooldown-reduction-speed",
    twoSet: 14,
    threeSet: 20,
    tagIds: [
      "navy",
      "the-seven-warlords-of-the-sea-former-warlords-of-the-sea",
      "straw-hat-pirates",
      "the-alvida-pirates",
      "buggy-pirates",
      "black-cat-pirates",
      "krieg-s-pirate-armada",
      "arlong-pirates",
      "baroque-works-former-baroque-works",
      "god-s-army",
      "whitebeard-pirates",
      "red-haired-pirates",
      "kid-pirates",
      "firetank-pirates",
      "cipher-pol-former-cipher-pol",
      "revolutionary-army",
      "animal-kingdom-pirates",
      "big-mom-pirates",
      "bonney-pirates",
      "buggy-s-delivery",
      "mokomo-dukedom-musketeer",
      "beautiful-pirates",
      "barto-club",
      "flying-pirates",
      "fake-straw-hat-pirates",
      "giant-pirate-crew",
      "world-noble",
      "foxy-pirates",
    ],
  },
] as const satisfies readonly TagSetEffectGroup[];
