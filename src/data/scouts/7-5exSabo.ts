import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "flame-emperor-sabo",
        rate: 0.2
    },
    {
        characterId: "the-paramount-war-crocodile",
        rate: 1
    },
    {
        characterId: "the-greatest-swordsman-in-the-world-dracule-mihawk",
        rate: 1
    },
    {
        characterId: "bikini-boa-hancock",
        rate: 1
    },
    {
        characterId: "the-seven-warlords-of-the-sea-gecko-moria",
        rate: 1
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const exFlameEmperorSabo: ScoutBanner = {
    id: "flame-emperor-sabo",
    name: "7.5Anniv. Ex Sabo",
    bannerImg: "/scouts/ex/7-5-year-anniversary-flame-emperor-sabo.webp",
    startAt: "2026-08-09T14:00:00+09:00",
    endAt: "2026-08-26T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "flame-emperor-sabo",
    rates: {
        pickup: totalPickupRate,
        bf: 0.7,
        "star-4": 2.8,
        "star-3": 35,
        "star-2": 58
    }
}
