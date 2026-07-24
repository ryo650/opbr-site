import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "unexpected-collaboration-rob-lucci",
        rate: 1
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const eggheadBfRobLucci: ScoutBanner = {
    id: "unexpected-collaboration-rob-lucci",
    name: "7.5Anniv. Rob Lucci",
    bannerImg: "/scouts/bf/7-5-year-anniversary-unexpected-collaboration-rob-lucci.webp",
    startAt: "2026-07-13T14:00:00+09:00",
    endAt: "2026-07-27T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "unexpected-collaboration-rob-lucci",
    rates: {
        pickup: totalPickupRate,
        bf: 1.5,
        "star-4": 4.5,
        "star-3": 28,
        "star-2": 58
    }
}
