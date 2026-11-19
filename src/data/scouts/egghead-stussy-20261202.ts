/* This file is generated with the Scout Importer V1 core from reviewed game rates. */

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "egghead-stussy",
        rate: 1,
    },
    {
        characterId: "unexpected-collaboration-kaku",
        rate: 0.2,
    },
    {
        characterId: "unexpected-collaboration-rob-lucci",
        rate: 0.2,
    },
    {
        characterId: "vegapunk-s-spy-stussy",
        rate: 0.2,
    },
    {
        characterId: "awakened-form-kaku",
        rate: 0.2,
    },
    {
        characterId: "cp9-blueno",
        rate: 0.2,
    },
    {
        characterId: "cp9-jabra",
        rate: 0.2,
    },
    {
        characterId: "animal-kingdom-pirates-tobi-roppo-who-s-who",
        rate: 0.2,
    },
    {
        characterId: "cp0-rob-lucci",
        rate: 0.2,
    },
    {
        characterId: "cp9-kaku",
        rate: 0.2,
    },
    {
        characterId: "cp-9-rob-lucci",
        rate: 0.2,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutEggheadStussy20261202: ScoutBanner = {
    id: "egghead-stussy-20261202",
    name: "4-Step Egghead Scout #3",
    bannerImg: "/scouts/egghead-stussy-20261202.webp",
    startAt: "2026-11-18T14:00:00+09:00",
    endAt: "2026-12-02T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "egghead-stussy",
    provisionalNotice: "Normal-rate simulation only: 11 pulls cost 50 diamonds. Step-Up discounts, free steps and guaranteed 4-star slots are not simulated.",
    rates: {
        pickup: totalPickupRate,
        bf: 0.08,
        "star-4": 1.92,
        "star-3": 35,
        "star-2": 60,
    },
};
