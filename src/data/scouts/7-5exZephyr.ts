import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "film-z-zephyr",
        rate: 0.2
    },
    {
        characterId: "film-gold-gild-tesoro",
        rate: 0.4
    },
    {
        characterId: "film-strong-world-shiki",
        rate: 0.4
    },
    {
        characterId: "stampede-boa-hancock",
        rate: 0.4
    },
    {
        characterId: "stampede-douglas-bullet",
        rate: 0.4
    },
    {
        characterId: "stampede-sabo",
        rate: 0.4
    },
    {
        characterId: "stampede-smoker",
        rate: 0.4
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const exZephyr: ScoutBanner = {
    id: "film-z-zephyr",
    name: "7.5Anniv. Film Z Zephyr",
    bannerImg: "/scouts/ex/7-5-year-anniversary-zephyr.webp",
    startAt: "2026-08-03T14:00:00+09:00",
    endAt: "2026-08-26T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "film-z-zephyr",
    rates: {
        pickup: totalPickupRate,
        bf: 1.1,
        "star-4": 3.3,
        "star-3": 28,
        "star-2": 58
    }
}
