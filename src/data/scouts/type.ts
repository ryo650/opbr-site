export type ScoutCategory = "pickup" | "ex" | "bf" | "star-4" | "star-3" | "star-2" | "sp" | "free" | "exchange" | "cola" ;

export type ScoutRates = Partial<Record<ScoutCategory, number>>;

export type ScoutPullOption = {
    pullCount: number;
    diamondCost: number;
};

export type ScoutPickup = {
    characterId: string,
    rate: number
}

{/* あとガチャのおすすめ度も追加するかも
    ゲーム内のガチャ抽選確率を参照してることも明記 */}

export type ScoutBanner = {
    id: string;
    name: string;
    bannerImg: string;
    startAt: string;
    endAt: string;
    pullOptions: {
        single: ScoutPullOption;
        multi: ScoutPullOption;
    };
    pickups: readonly ScoutPickup[];
    featuredCharacterId: string;
    rates: ScoutRates;
}
