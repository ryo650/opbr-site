import type { ScoutBanner } from "./type";

export const sampleExScout: ScoutBanner = {
    id: "sample-ex-scout",
    name: "Sample EX Scout",
    pullOptions: {
        single: { pullCount: 1, diamondCost: 5 },
        multi: { pullCount: 11, diamondCost: 50 },
    },
    pickupIds: ["flame-emperor-sabo"],
    rates: {
        pickup: 0.2,
        bf: 2.2,
        "star-4":4.6,
        "star-3": 28,
        "star-2": 25
    }
}
