import type { Character } from "@/data/characters/type";
import type { ScoutBanner, ScoutCategory } from "@/data/scouts/type";

type CharacterRecord = Record<string, Character>;

// rollScoutが呼び出される -> rollCategoryでカテゴリを抽選 -> getPoolByCategoryそのカテゴリのキャラ一覧を作成 -> pickRandomその中からランダムに一体選ぶ -> Character選ばれたのをこCharacterに返す

// 引数からランダムにキャラを引き出す関数
function pickRandom<T>(items : T[]): T | null {
    if (items.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * items.length);
    return items[index];
}

// 排出カテゴリを決める関数
function rollCategory(rates: ScoutBanner["rates"]): ScoutCategory | null {
    const entries = Object.entries(rates) as [ScoutCategory, number][];

    if (entries.length === 0) {
        return null;
    }

    const totalRate = entries.reduce((sum, [, rate]) => sum + rate, 0);
    const random = Math.random() * totalRate;

    let current = 0;
    
    for (const [category, rate] of entries) {
        current += rate;

        if (random < current) {
            return category;
        }
    }

    return entries[entries.length - 1][0]
}

// 排出対象一覧を作る関数
function getPoolByCategory(
    category: ScoutCategory,
    scout: ScoutBanner,
    characters: CharacterRecord
): Character[] {
    const characterList = Object.values(characters);

    if (category === "pickup") {
        return scout.pickupIds
            .map((id) => characters[id])
            .filter((character) : character is Character => Boolean(character));
    }

    if (category === "bf") {
        return characterList.filter((character) => character.grade === "bf");
    }

    if (category === "sp") {
        return characterList.filter((character) => character.grade === "sp");
    }

    if (category === "star-4") {
        return characterList.filter((character) => character.grade === "star-4");
    }

    if (category === "star-3") {
        return characterList.filter((character) => character.grade === "star-3");
    }

    if (category === "star-2") {
        return characterList.filter((character) => character.grade === "star-2");
    }

    return [];
}

// それぞれの関数を使いガチャ一回分の結果を返す
export function rollScout(
    scout: ScoutBanner,
    characters: CharacterRecord
): Character | null {
    const category = rollCategory(scout.rates);

    if (!category) {
        return null;
    }

    const pool = getPoolByCategory(category, scout, characters);
    return pickRandom(pool);
}

// 複数回の連続ガチャ（11連などの）
export function rollScoutMany(
    scout: ScoutBanner,
    characters: CharacterRecord,
    count: number
): Character[] {
    const results: Character[] = [];

    for (let i = 0; i < count; i++) {
        const character = rollScout(scout, characters);

        if (character) {
            results.push(character);
        }
    }

    return results;
}
