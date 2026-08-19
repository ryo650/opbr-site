import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "bonny",
        rate: 0.2
    }
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const exBonny: ScoutBanner = {
    id: "bonny",
    name: "7.5Anniv. Ex Bonny",
    bannerImg: "/scouts/ex/7-5-year-anniversary-bonny.webp",
    startAt: "2026-08-19T14:00:00+09:00",
    endAt: "2026-09-15T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "bonny",
    rates: {
        pickup: totalPickupRate,
        bf: 1.6,
        "star-4": 4.8,
        "star-3": 35,
        "star-2": 58
    }
}
