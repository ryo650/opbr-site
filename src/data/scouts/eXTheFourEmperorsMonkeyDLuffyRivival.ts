import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "the-four-emperors-monkey-d-luffy",
        rate: 0.2
    },
    {
        characterId: "egghead-franky",
        rate: 0.3
    },
    {
        characterId: "egghead-jinbe",
        rate: 0.3
    },
    {
        characterId: "egghead-tony-tony-chopper",
        rate: 0.3
    },
    {
        characterId: "egghead-brook",
        rate: 0.3
    },
    {
        characterId: "egghead-nicorobin",
        rate: 0.2
    },
    {
        characterId: "egghead-nami",
        rate: 0.3
    },
    {
        characterId: "egghead-usopp",
        rate: 0.3
    }
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const exTheFourEmperorsMonkeyDLuffy: ScoutBanner = {
    id: "the-four-emperors-monkey-d-luffy",
    name: "G5V2 Rivival",
    bannerImg: "/scouts/ex/7-5-year-anniversary-the-four-emperors-mokey-d-luffy.webp",
    startAt: "2026-07-10T14:00:00+09:00",
    endAt: "2026-07-29T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "the-four-emperors-monkey-d-luffy",
    rates: {
        pickup: totalPickupRate,
        bf: 1,
        "star-4": 3.7,
        "star-3": 28,
        "star-2": 58
    }
}
