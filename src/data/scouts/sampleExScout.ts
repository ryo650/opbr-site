import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "great-pirate-edward-newgate",
        rate: 0.2
    },
    {
        characterId: "warp-warp-fruit-van-ogre",
        rate: 0.5
    },
    {
        characterId: "happosui-army-13th-chief-sai",
        rate: 0.5
    },
    {
        characterId: "navy-hq-captain-koby",
        rate: 0.5
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const sampleExScout: ScoutBanner = {
    id: "sample-ex-scout",
    name: "Sample EX Scout",
    bannerImg: "/scouts/ex/7-5-year-anniversary-great-pirate-edward-newgate.webp",
    startAt: "2026-07-13T14:00:00+09:00",
    endAt: "2026-07-27T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "great-pirate-edward-newgate",
    rates: {
        pickup: totalPickupRate,
        bf: 1.49,
        "star-4": 3.81,
        "star-3": 28,
        "star-2": 65
    }
}
