import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "giant-warrior-hajrudin",
        rate: 1
    },
    {
        characterId: "legendary-gladiator-kyros",
        rate: 1
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const bfDoressrosa: ScoutBanner = {
    id: "bf-doressrosa",
    name: "BF Doressrosa",
    bannerImg: "/scouts/bf/bf-doressrosa.webp",
    startAt: "2026-06-24T14:00:00+09:00",
    endAt: "2026-07-24T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "legendary-gladiator-kyros",
    rates: {
        pickup: totalPickupRate,
        bf: 1.25,
        "star-4": 3.75,
        "star-3": 28,
        "star-2": 58
    }
}
