export type CharacterLevel100Stats = {
  readonly characterId: string;
  readonly hp: number;
  readonly atk: number;
  readonly def: number;
};

// Keep this catalog evidence-only. Character data can be added here without
// changing the Medal Builder selector or preview calculation.
export const characterLevel100StatsCatalog: readonly CharacterLevel100Stats[] = [
  {
    characterId: "flame-emperor-sabo",
    hp: 9792,
    atk: 2172,
    def: 2302
  },
  {
    characterId: "blackbeard-pirates-kuzan",
    hp: 9464,
    atk: 2100,
    def: 2456,
  },
  {
    characterId: "future-where-i-m-the-most-free-jewelry-bonney",
    hp: 9383,
    atk: 2425,
    def: 2152,
  },
  {
    characterId: "battle-of-monsters-on-onigashima-kaido",
    hp: 9588,
    atk: 2158,
    def: 2386,
  },
  {
    characterId: "film-z-zephyr",
    hp: 9664,
    atk: 1972,
    def: 2516,
  },
  {
    characterId: "gear-five-monkey-d-luffy",
    hp: 9524,
    atk: 2010,
    def: 2550,
  },
  {
    characterId: "legendary-hero-monkey-d-garp",
    hp: 9466,
    atk: 2511,
    def: 2063,
  },
  {
    characterId: "the-four-emperors-marshall-d-teach",
    hp: 9819,
    atk: 2471,
    def: 1996,
  },
  {
    characterId: "great-pirate-gol-d-roger",
    hp: 9853,
    atk: 2068,
    def: 2410,
  },
  {
    characterId: "the-five-elders-st-jaygarcia-saturn",
    hp: 9804,
    atk: 1982,
    def: 2490,
  },
  {
    characterId: "the-four-emperors-monkey-d-luffy",
    hp: 9284,
    atk: 2423,
    def: 2197,
  },
  {
    characterId: "divine-departure-shanks",
    hp: 9604,
    atk: 2270,
    def: 2252,
  },
  {
    characterId: "great-pirate-edward-newgate",
    hp: 9431,
    atk: 2050,
    def: 2515,
  },
  {
    characterId: "man-who-dreams-of-becoming-the-king-of-the-pirates-monkey-d-luffy",
    hp: 9119,
    atk: 2473,
    def: 2152,
  },
  {
    characterId: "the-wings-zoro-sanji",
    hp: 9750,
    atk: 2530,
    def: 1936,
  },
  {
    characterId: "the-four-emperors-shanks",
    hp: 9279,
    atk: 2432,
    def: 2171,
  },
  {
    characterId: "awakened-form-rob-lucci",
    hp: 9715,
    atk: 2175,
    def: 2301,
  },
  {
    characterId: "battle-of-monsters-on-onigashima-kid-law",
    hp: 9316,
    atk: 2120,
    def: 2455,
  },
  {
    characterId: "hunger-pangs-charlotte-linlin",
    hp: 10160,
    atk: 2135,
    def: 2229,
  },
  {
    characterId: "the-strongest-creature-alive-kaido",
    hp: 9471,
    atk: 2145,
    def: 2428,
  },
  {
    characterId: "okuchi-no-makami-yamato",
    hp: 9527,
    atk: 2172,
    def: 2369,
  },
  {
    characterId: "seraphim-s-snake",
    hp: 9662,
    atk: 2042,
    def: 2447,
  },
  {
    characterId: "raid-on-onigashima-roronoa-zoro",
    hp: 9192,
    atk: 2348,
    def: 2258,
  },
  {
    characterId: "winner-island-trafalgar-law",
    hp: 9641,
    atk: 2068,
    def: 2426,
  },
  {
    characterId: "ama-no-murakumo-sword-kizaru",
    hp: 9444,
    atk: 2508,
    def: 2054,
  },
  {
    characterId: "fire-fist-ogre-princess-ace-yamato",
    hp: 9255,
    atk: 2472,
    def: 2118,
  },
  {
    characterId: "the-seven-warlords-of-the-sea-marshall-d-teach",
    hp: 10116,
    atk: 2159,
    def: 2216,
  },
  {
    characterId: "navy-hq-fleet-admiral-akainu",
    hp: 9600,
    atk: 2389,
    def: 2134,
  },
  {
    characterId: "battle-of-monsters-on-onigashima-olin-the-oiran",
    hp: 9522,
    atk: 2039,
    def: 2503,
  },
  {
    characterId: "kaido-s-son-yamato",
    hp: 9316,
    atk: 2251,
    def: 2324,
  },
  {
    characterId: "the-five-elders-st-ethanbaron-v-nusjuro",
    hp: 9920,
    atk: 1873,
    def: 2569,
  },
  {
    characterId: "the-five-elders-st-marcus-mars",
    hp: 10095,
    atk: 1981,
    def: 2481,
  },
];

export const characterLevel100StatsByCharacterId: ReadonlyMap<string, CharacterLevel100Stats> = new Map(
  characterLevel100StatsCatalog.map((stats) => [stats.characterId, stats]),
);
