export type ScoutCategory = "pickup" | "ex" | "bf" | "star-4" | "star-3" | "star-2" | "sp" | "free" | "exchange" | "cola" ;

export type ScoutRates = Partial<Record<ScoutCategory, number>>;

export type ScoutBanner = {
    id: string;
    name: string;
    cost: number;
    pulls: number;
    pickupIds: string[];
    rates: ScoutRates;
}
