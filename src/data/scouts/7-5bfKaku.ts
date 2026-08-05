import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "unexpected-collaboration-kaku",
        rate: 1
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const eggheadBfKaku: ScoutBanner = {
    id: "unexpected-collaboration-kaku",
    name: "7.5Anniv. Kaku",
    bannerImg: "/scouts/bf/7-5-year-anniversary-unexpected-collaboration-kaku.webp",
    startAt: "2026-08-05T14:00:00+09:00",
    endAt: "2026-08-19T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "unexpected-collaboration-kaku",
    rates: {
        pickup: totalPickupRate,
        bf: 1.5,
        "star-4": 4.5,
        "star-3": 28,
        "star-2": 58
    }
}
