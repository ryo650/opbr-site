/* Step 1 rates and banner imported with scripts/scout-importer/import.mjs from IMG_5970–IMG_5973. */

import type {
    ScoutBanner,
    ScoutPickup,
} from "./type";

const pickups = [
    {
        characterId: "awakened-form-rob-lucci",
        rate: 0.2,
    },
] satisfies readonly ScoutPickup[];

const totalPickupRate = pickups.reduce(
    (total, pickup) => total + pickup.rate,
    0,
);

export const scoutAwakenedFormRobLucci20261126: ScoutBanner = {
    id: "awakened-form-rob-lucci-20261126",
    name: "4-Step [280 Million Downloads Celebration] Extreme Bounty Festival #2",
    bannerImg: "/scouts/awakened-form-rob-lucci-20261126.webp",
    startAt: "2026-11-14T14:00:00+09:00", // Importer default. The screenshots show the end date.
    endAt: "2026-11-26T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 30 },
    },
    provisionalNotice: "The simulator uses Step 1 rates and repeats the 11-pull for 30 Rainbow Diamonds. The single pull is a simulator option. See the in-game banner for the free Step 2, guaranteed pulls, and rewards.",
    pickups,
    featuredCharacterId: "awakened-form-rob-lucci",
    rates: {
        pickup: totalPickupRate,
        bf: 2.86,
        "star-4": 3.94,
        "star-3": 35,
        "star-2": 58,
    },
};
