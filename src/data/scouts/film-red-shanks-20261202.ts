/* Step 1 rates and banner imported with scripts/scout-importer/import.mjs from IMG_5949–IMG_5954. */

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "film-red-shanks",
        rate: 0.2,
    },
    {
        characterId: "film-red-usopp",
        rate: 0.48,
    },
    {
        characterId: "film-red-yasopp",
        rate: 0.48,
    },
    {
        characterId: "film-red-ben-beckman",
        rate: 0.48,
    },
    {
        characterId: "film-red-tony-tony-chopper",
        rate: 0.48,
    },
    {
        characterId: "film-red-nami",
        rate: 0.48,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutFilmRedShanks20261202: ScoutBanner = {
    id: "film-red-shanks-20261202",
    name: "5-Step [280 Million Downloads Celebration] Extreme Bounty Festival",
    bannerImg: "/scouts/film-red-shanks-20261202.webp",
    startAt: "2026-11-12T14:00:00+09:00", // Importer default. The screenshots show the end date.
    endAt: "2026-12-02T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 10 },
    },
    provisionalNotice: "The simulator uses Step 1 rates and repeats the 11-pull for 10 Rainbow Diamonds. The single pull is a simulator option. Later steps, guarantees, and rewards are shown on the in-game banner.",
    pickups,
    featuredCharacterId: "film-red-shanks",
    rates: {
        pickup: totalPickupRate,
        bf: 1.43,
        "star-4": 2.97,
        "star-3": 35,
        "star-2": 58,
    },
};
