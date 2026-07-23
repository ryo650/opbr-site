import type { 
    ScoutBanner,
    ScoutPickup,
 } from "./type";

const pickups = [
    {
        characterId: "man-who-dreams-of-becoming-the-king-of-the-pirates-monkey-d-luffy",
        rate: 0.2
    },
    {
        characterId: "big-mom-pirates-sweet-3-general-charllote-cracker",
        rate: 1.33
    },
    {
        characterId: "the-paramount-war-gecko-moria",
        rate: 1.33
    },
    {
        characterId: "big-mom-pirates-captain-charlotte-linlin",
        rate: 1.33
    },
    {
        characterId: "animal-kingdom-pirates-tobi-roppo-sasaki",
        rate: 1.33
    },
    {
        characterId: "germa-66-vinsmoke-reiju",
        rate: 1.33
    }
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0
);

export const OPDayExBountyFestival: ScoutBanner = {
    id: "opday-ex-bounty-festival",
    name: "OPDay Ex Bounty Festival",
    bannerImg: "/scouts/ex/opday-ex-bounty-festival.webp",
    startAt: "2026-07-21T14:00:00+09:00",
    endAt: "2026-08-03T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "man-who-dreams-of-becoming-the-king-of-the-pirates-monkey-d-luffy",
    rates: {
        pickup: totalPickupRate,
        "star-3": 28,
        "star-2": 58
    }
}
