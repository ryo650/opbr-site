import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "hunger-pangs-charlotte-linlin",
        rate: 0.2
    },
    {
        characterId: "princess-and-loyal-partner-vivi-karoo",
        rate: 0.75
    },
    {
        characterId: "superhuman-charlotte-katakuri",
        rate: 0.75
    },
    {
        characterId: "revolutionary-army-emporio-ivankov",
        rate: 0.75
    },
    {
        characterId: "the-seven-warlords-of-the-sea-batholomew-kuma",
        rate: 0.75
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const exHungerPangsCharlotteLinlin: ScoutBanner = {
    id: "hunger-pangs-charlotte-linlin",
    name: "7.5Anniv. Ex Hunger Pangs",
    bannerImg: "/scouts/ex/7-5-year-anniversary-hunger-pangs-charlotte-linlin.webp",
    startAt: "2026-08-14T14:00:00+09:00",
    endAt: "2026-08-26T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "hunger-pangs-charlotte-linlin",
    rates: {
        pickup: totalPickupRate,
        bf: 0.95,
        "star-4": 2.85,
        "star-3": 35,
        "star-2": 58
    }
}
