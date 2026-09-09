export type CharacterLevel100BaseStats = {
  readonly characterId: string;
  readonly baseHp: number | null;
  readonly baseAtk: number | null;
  readonly baseDef: number | null;
};

export type CompleteCharacterLevel100BaseStats = CharacterLevel100BaseStats & {
  readonly baseHp: number;
  readonly baseAtk: number;
  readonly baseDef: number;
};

/** A Character can enter the Builder only after all three Base Stats are verified. */
export function hasCompleteCharacterLevel100BaseStats(
  stats: CharacterLevel100BaseStats,
): stats is CompleteCharacterLevel100BaseStats {
  return typeof stats.baseHp === "number"
    && typeof stats.baseAtk === "number"
    && typeof stats.baseDef === "number";
}

/** Filters pending and partial records out of the Character Preview selector. */
export function getSelectableCharacterLevel100BaseStats(
  entries: readonly CharacterLevel100BaseStats[],
): readonly CompleteCharacterLevel100BaseStats[] {
  return entries.filter(hasCompleteCharacterLevel100BaseStats);
}

// Enter Base HP / ATK / DEF directly after confirming them in game. Pending
// targets deliberately use null rather than guessed or displayed values.
export const characterLevel100BaseStatsCatalog: readonly CharacterLevel100BaseStats[] = [
  // Verified from the unowned Max Level Preview screenshot fixture (IMG_4816).
  { characterId: "red-rock-monkey-d-luffy", baseHp: 6_806, baseAtk: 1_535, baseDef: 1_688 },

  // Converted once from the newly entered Lv.100 Boost Max display values.
  { characterId: "flame-emperor-sabo", baseHp: 7_212, baseAtk: 1_532, baseDef: 1_662 },
  { characterId: "blackbeard-pirates-kuzan", baseHp: 6_884, baseAtk: 1_460, baseDef: 1_816 },
  { characterId: "future-where-i-m-the-most-free-jewelry-bonney", baseHp: 6_803, baseAtk: 1_785, baseDef: 1_512 },
  { characterId: "battle-of-monsters-on-onigashima-kaido", baseHp: 7_008, baseAtk: 1_518, baseDef: 1_746 },
  { characterId: "film-z-zephyr", baseHp: 7_084, baseAtk: 1_332, baseDef: 1_876 },
  { characterId: "gear-five-monkey-d-luffy", baseHp: 6_944, baseAtk: 1_370, baseDef: 1_910 },
  { characterId: "legendary-hero-monkey-d-garp", baseHp: 6_886, baseAtk: 1_871, baseDef: 1_423 },
  { characterId: "the-four-emperors-marshall-d-teach", baseHp: 7_239, baseAtk: 1_832, baseDef: 1_356 },
  { characterId: "great-pirate-gol-d-roger", baseHp: 7_273, baseAtk: 1_428, baseDef: 1_770 },
  { characterId: "the-five-elders-st-jaygarcia-saturn", baseHp: 7_224, baseAtk: 1_342, baseDef: 1_850 },
  { characterId: "the-four-emperors-monkey-d-luffy", baseHp: 6_703, baseAtk: 1_783, baseDef: 1_557 },
  { characterId: "divine-departure-shanks", baseHp: 7_024, baseAtk: 1_630, baseDef: 1_612 },
  { characterId: "great-pirate-edward-newgate", baseHp: 6_851, baseAtk: 1_410, baseDef: 1_875 },
  { characterId: "man-who-dreams-of-becoming-the-king-of-the-pirates-monkey-d-luffy", baseHp: 6_539, baseAtk: 1_833, baseDef: 1_512 },
  { characterId: "the-wings-zoro-sanji", baseHp: 7_170, baseAtk: 1_890, baseDef: 1_296 },
  { characterId: "the-four-emperors-shanks", baseHp: 6_699, baseAtk: 1_792, baseDef: 1_531 },
  { characterId: "awakened-form-rob-lucci", baseHp: 7_135, baseAtk: 1_535, baseDef: 1_661 },
  { characterId: "battle-of-monsters-on-onigashima-kid-law", baseHp: 6_736, baseAtk: 1_480, baseDef: 1_815 },
  { characterId: "hunger-pangs-charlotte-linlin", baseHp: 7_580, baseAtk: 1_495, baseDef: 1_589 },
  { characterId: "the-strongest-creature-alive-kaido", baseHp: 6_891, baseAtk: 1_505, baseDef: 1_788 },
  { characterId: "okuchi-no-makami-yamato", baseHp: 6_947, baseAtk: 1_532, baseDef: 1_729 },
  { characterId: "seraphim-s-snake", baseHp: 7_082, baseAtk: 1_402, baseDef: 1_807 },
  { characterId: "raid-on-onigashima-roronoa-zoro", baseHp: 6_612, baseAtk: 1_708, baseDef: 1_618 },
  { characterId: "winner-island-trafalgar-law", baseHp: 7_061, baseAtk: 1_428, baseDef: 1_786 },
  { characterId: "ama-no-murakumo-sword-kizaru", baseHp: 6_864, baseAtk: 1_868, baseDef: 1_414 },
  { characterId: "fire-fist-ogre-princess-ace-yamato", baseHp: 6_675, baseAtk: 1_832, baseDef: 1_478 },
  { characterId: "the-seven-warlords-of-the-sea-marshall-d-teach", baseHp: 7_536, baseAtk: 1_519, baseDef: 1_576 },
  { characterId: "navy-hq-fleet-admiral-akainu", baseHp: 7_020, baseAtk: 1_749, baseDef: 1_494 },
  { characterId: "battle-of-monsters-on-onigashima-olin-the-oiran", baseHp: 6_942, baseAtk: 1_399, baseDef: 1_863 },
  { characterId: "kaido-s-son-yamato", baseHp: 6_736, baseAtk: 1_611, baseDef: 1_684 },
  { characterId: "the-five-elders-st-ethanbaron-v-nusjuro", baseHp: 7_340, baseAtk: 1_233, baseDef: 1_929 },
  { characterId: "the-five-elders-st-marcus-mars", baseHp: 7_515, baseAtk: 1_341, baseDef: 1_778 },
];

export const characterLevel100BaseStatsByCharacterId: ReadonlyMap<string, CharacterLevel100BaseStats> = new Map(
  characterLevel100BaseStatsCatalog.map((stats) => [stats.characterId, stats]),
);
