import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "blackbeard-pirates-kuzan",
        rate: 0.2
    }
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const exBlackbeardPiratesKuzan: ScoutBanner = {
    id: "blackbeard-pirates-kuzan",
    name: "7.5Anniv. Ex Kuzan",
    bannerImg: "/scouts/ex/7-5-year-anniversary-blackbeard-pirates-kuzan.webp",
    startAt: "2026-08-12T14:00:00+09:00",
    endAt: "2026-08-27T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "blackbeard-pirates-kuzan",
    rates: {
        pickup: totalPickupRate,
        bf: 1.6,
        "star-4": 4.8,
        "star-3": 35,
        "star-2": 58
    }
}
