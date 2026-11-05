/* Generated with scripts/scout-importer/core.mjs from reviewed screenshot data. */

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "legendary-hero-monkey-d-garp",
        rate: 0.2,
    },
    {
        characterId: "navy-hq-captain-koby",
        rate: 0.5,
    },
    {
        characterId: "the-navy-s-human-weapon-pacifista",
        rate: 0.5,
    },
    {
        characterId: "ex-roger-pirates-first-mate-silvers-rayleigh",
        rate: 0.5,
    },
    {
        characterId: "navy-hq-vice-admiral-doll",
        rate: 1,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutLegendaryHeroMonkeyDGarp20261124: ScoutBanner = {
    id: "legendary-hero-monkey-d-garp-20261124",
    name: "5-Step [Egghead] Extreme Bounty Festival #2",
    bannerImg: "/scouts/legendary-hero-monkey-d-garp-20261124.webp",
    startAt: "2026-11-04T14:00:00+09:00",
    endAt: "2026-11-24T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "legendary-hero-monkey-d-garp",
    rates: {
        pickup: totalPickupRate,
        bf: 1.33,
        "star-4": 2.97,
        "star-3": 35,
        "star-2": 58,
    },
};
