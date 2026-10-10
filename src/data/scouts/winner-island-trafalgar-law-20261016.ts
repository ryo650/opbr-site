// Manually transcribed from supplied screenshots; validated with scout-importer rate helpers.
// Source: IMG_5222.jpg, IMG_5223.PNG, IMG_5224.PNG, IMG_5225.PNG.
// Start is not shown; use the importer's latest 14:00 JST registration default.
// Step-up reference (not simulated): 20 cycles; 11 pulls per step. Costs: free / 40 / 50 / 50 diamonds. Steps 3 and 4: one guaranteed 4-star each.
// Guaranteed-slot rates are not shown in the supplied screenshots.
// Normal BF pool: 148 characters × 0.0195804%, rounded by importer rules.

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "winner-island-trafalgar-law",
        rate: 0.2,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutWinnerIslandTrafalgarLaw20261016: ScoutBanner = {
    id: "winner-island-trafalgar-law-20261016",
    name: "[2026 Law's Birthday Celebration] Extreme Bounty Festival",
    bannerImg: "/scouts/winner-island-trafalgar-law-20261016.webp",
    startAt: "2026-10-08T14:00:00+09:00",
    endAt: "2026-10-16T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "winner-island-trafalgar-law",
    rates: {
        pickup: totalPickupRate,
        bf: 2.9,
        "star-4": 3.9,
        "star-3": 35,
        "star-2": 58,
    },
};
