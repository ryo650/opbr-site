import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "the-five-elders-st-marcus-mars",
        rate: 0.2
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const eggheadStMarz: ScoutBanner = {
    id: "the-five-elders-st-marcus-mars",
    name: "7.5Anniv. St.MarcusMars",
    bannerImg: "/characters/blue/the-five-elders-st-marcus-mars.webp",
    startAt: "2026-07-29T14:00:00+09:00",
    endAt: "2026-08-25T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "the-five-elders-st-marcus-mars",
    rates: {
        pickup: totalPickupRate,
        bf: 1.75,
        "star-4": 5.05,
        "star-3": 28,
        "star-2": 58
    }
}
