import type { ScoutBanner, ScoutPickup } from "./type";

// Source: IMG_5079.jpg, IMG_5080.PNG, IMG_5081.PNG, IMG_5086.PNG.
const pickups = [
    { characterId: "happy-halloween-uta", rate: 1 },
] satisfies readonly ScoutPickup[];

export const scoutHappyHalloweenUta20261027: ScoutBanner = {
    id: "happy-halloween-uta-20261027",
    name: "[2026 Uta's Birthday Celebration] Bounty Festival",
    bannerImg: "/scouts/happy-halloween-uta-20261027.webp",
    // Start is not shown; use the importer's latest 14:00 JST registration default.
    startAt: "2026-10-01T14:00:00+09:00",
    endAt: "2026-10-27T13:59:59+09:00",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickups,
    featuredCharacterId: "happy-halloween-uta",
    rates: {
        pickup: 1,
        // 147 non-pickup BF characters × 0.0139860%, rounded by importer rules.
        bf: 2.06,
        "star-4": 3.94,
        "star-3": 35,
        "star-2": 58,
    },
};
