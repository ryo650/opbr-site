// Manually transcribed from supplied screenshots; validated with scout-importer rate helpers.
// Source: IMG_5217.jpg, IMG_5218.PNG, IMG_5219.PNG, IMG_5220.PNG, IMG_5221.PNG.
// Start is not shown; use the importer's latest 14:00 JST registration default.
// Step-up reference (not simulated): 15 cycles; 11 pulls per step. Costs: 40 / free / 30 / 40 diamonds. Step 3: one guaranteed 4-star. Step 4: one guaranteed legendary 4-star.
// Guaranteed-slot rates are not shown in the supplied screenshots.
// Normal BF pool: 146 characters × 0.0127659%, rounded by importer rules.

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "daimyo-of-kuri-kozuki-oden",
        rate: 0.2,
    },
    {
        characterId: "red-rock-monkey-d-luffy",
        rate: 0.5,
    },
    {
        characterId: "animal-kingdom-pirates-lead-performer-king",
        rate: 0.5,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutDaimyoOfKuriKozukiOden20261027: ScoutBanner = {
    id: "daimyo-of-kuri-kozuki-oden-20261027",
    name: "[270 Million Downloads Celebration] Extreme Bounty Festival",
    bannerImg: "/scouts/daimyo-of-kuri-kozuki-oden-20261027.webp",
    startAt: "2026-10-08T14:00:00+09:00",
    endAt: "2026-10-27T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "daimyo-of-kuri-kozuki-oden",
    rates: {
        pickup: totalPickupRate,
        bf: 1.86,
        "star-4": 3.94,
        "star-3": 35,
        "star-2": 58,
    },
};
