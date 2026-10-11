// Normal-scout approximation of the four-step banner; Step-Up costs, guarantees,
// rewards and repeat rules are not simulated. Source: IMG_5257–IMG_5265,
// supplied 2026-10-11. The single (5 RD) / multi (50 RD) controls follow the
// site's usual simulator convention, not an independently verified single-pull offer.
// The game's displayed Step 1 rate table shows 4★ 5%, 3★ 35%, 2★ 60%.
// All 4★ probability is allocated to the 14 listed Featured Characters:
// 9 × 0.2222222% + 5 × 0.6000000% = 4.9999998% (display precision).
// The shared 3★/2★ catalog is an approximation of the full game-specific pools.
// The official start date is not shown; startAt is the first observed local date.
import type { ScoutBanner, ScoutPickup } from "./type";

const pickups = [
  { characterId: "blind-swordsman-fujitora", rate: 0.2222222 },
  { characterId: "egghead-roronoa-zoro", rate: 0.2222222 },
  { characterId: "heir-to-the-shogun-of-wano-kozuki-oden", rate: 0.2222222 },
  { characterId: "shogun-of-wano-kozuki-momonosuke", rate: 0.2222222 },
  { characterId: "roger-s-rival-edward-newgate", rate: 0.2222222 },
  { characterId: "the-billion-fold-world-trichiliocosm-roronoa-zoro", rate: 0.2222222 },
  { characterId: "the-greatest-swordsman-in-the-world-dracule-mihawk", rate: 0.2222222 },
  { characterId: "navy-hq-admiral-fujitora", rate: 0.2222222 },
  { characterId: "whitebeard-pirates-captain-whitebeard-edward-newgate", rate: 0.2222222 },
  { characterId: "land-of-wano-luffytaro", rate: 0.6 },
  { characterId: "land-of-wano-zorojuro", rate: 0.6 },
  { characterId: "2-years-later-combatant-roronoa-zoro", rate: 0.6 },
  { characterId: "108-pound-phoenix-roronoa-zoro", rate: 0.6 },
  { characterId: "the-seven-warlords-of-the-sea-dracule-mihawk", rate: 0.6 },
] satisfies readonly ScoutPickup[];

export const scoutSupremeGreatGradeSwordWielders20261013: ScoutBanner = {
  id: "supreme-great-grade-sword-wielders-20261013",
  name: "4-Step Supreme Grade Sword Wielder / Great Grade Sword Wielder Featured Scout",
  bannerImg: "/scouts/supreme-great-grade-sword-wielders-20261013.webp",
  startAt: "2026-10-11T00:00:00+09:00",
  endAt: "2026-10-13T13:59:59+09:00",
  pullOptions: {
    single: { pullCount: 1, diamondCost: 5 },
    multi: { pullCount: 11, diamondCost: 50 },
  },
  pickups,
  featuredCharacterId: "blind-swordsman-fujitora",
  rates: {
    pickup: 5,
    "star-3": 35,
    "star-2": 60,
  },
};
