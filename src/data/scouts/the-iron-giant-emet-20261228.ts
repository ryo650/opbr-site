// Generated with Scout Importer V1 from reviewed screenshots and the official rate table.
// The 145 non-featured entries at 0.0068965% contribute 1% after rounding.
// https://pifpt.bandainamcoent.co.jp/462ww/3bc29469-d569-4690-8d8b-adab576adbbc.html

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "the-iron-giant-emet",
        rate: 1,
    },
    {
        characterId: "naval-science-team-battle-weapon-pacifista-mk-iii",
        rate: 1,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutTheIronGiantEmet20261228: ScoutBanner = {
    id: "the-iron-giant-emet-20261228",
    name: "[Egghead] Bounty Festival #4",
    bannerImg: "/scouts/the-iron-giant-emet-20261228.webp",
    startAt: "2026-11-26T14:00:00+09:00",
    endAt: "2026-12-28T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "the-iron-giant-emet",
    rates: {
        pickup: totalPickupRate,
        bf: 1,
        "star-4": 4,
        "star-3": 35,
        "star-2": 58,
    },
};
