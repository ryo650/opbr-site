import type { ScoutBanner, ScoutPickup } from "./type";

// Source: IMG_5082.jpg, IMG_5083.PNG, IMG_5084.PNG, IMG_5085.PNG.
const pickups = [
    { characterId: "singer-of-the-new-genesis-uta", rate: 1 },
    { characterId: "film-red-uta", rate: 1 },
] satisfies readonly ScoutPickup[];

export const scoutSingerOfTheNewGenesisUta20261030: ScoutBanner = {
    id: "singer-of-the-new-genesis-uta-20261030",
    name: "[2026 Almost Uta's Birthday] Bounty Festival",
    bannerImg: "/scouts/singer-of-the-new-genesis-uta-20261030.webp",
    // Start is not shown; use the importer's latest 14:00 JST registration default.
    startAt: "2026-10-01T14:00:00+09:00",
    endAt: "2026-10-30T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "singer-of-the-new-genesis-uta",
    rates: {
        pickup: 2,
        // 148 BF characters × 0.0069930%, rounded by importer rules.
        bf: 1.03,
        "star-4": 3.97,
        "star-3": 35,
        "star-2": 58,
    },
};
