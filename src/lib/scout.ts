import type { Character } from "@/data/characters/type";
import type {
  ScoutBanner,
  ScoutCategory,
} from "@/data/scouts/type";

type CharacterRecord = Record<string, Character>;

// 配列から均等な確率で1件選ぶ
function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

// 排出カテゴリを抽選する
function rollCategory(
  rates: ScoutBanner["rates"],
): ScoutCategory | null {
  const entries = Object.entries(rates) as [
    ScoutCategory,
    number,
  ][];

  if (entries.length === 0) {
    return null;
  }

  const totalRate = entries.reduce(
    (sum, [, rate]) => sum + rate,
    0,
  );

  if (totalRate <= 0) {
    return null;
  }

  const random = Math.random() * totalRate;
  let current = 0;

  for (const [category, rate] of entries) {
    current += rate;

    if (random < current) {
      return category;
    }
  }

  return entries[entries.length - 1][0];
}

// ピックアップキャラを個別確率に従って抽選する
function rollPickup(
  scout: ScoutBanner,
  characters: CharacterRecord,
): Character | null {
  const totalRate = scout.pickups.reduce(
    (total, pickup) => {
      const character = characters[pickup.characterId];

      if (!character || pickup.rate <= 0) {
        return total;
      }

      return total + pickup.rate;
    },
    0,
  );

  if (totalRate <= 0) {
    return null;
  }

  const random = Math.random() * totalRate;
  let current = 0;
  let fallbackCharacter: Character | null = null;

  for (const pickup of scout.pickups) {
    const character = characters[pickup.characterId];

    if (!character || pickup.rate <= 0) {
      continue;
    }

    fallbackCharacter = character;
    current += pickup.rate;

    if (random < current) {
      return character;
    }
  }

  return fallbackCharacter;
}

// 指定カテゴリの通常排出キャラ一覧を作る
function getPoolByCategory(
  category: ScoutCategory,
  scout: ScoutBanner,
  characters: CharacterRecord,
): Character[] {
  const characterList = Object.values(characters);

  // ピックアップキャラが通常BF・Star 4枠から
  // 重複して排出されないようにする
  const pickupIds = new Set(
    scout.pickups.map((pickup) => pickup.characterId),
  );

  if (category === "bf") {
    return characterList.filter(
      (character) =>
        character.grade === "bf" &&
        !pickupIds.has(character.id),
    );
  }

  if (category === "sp") {
    return characterList.filter(
      (character) =>
        character.grade === "sp" &&
        !pickupIds.has(character.id),
    );
  }

  if (category === "star-4") {
    return characterList.filter(
      (character) =>
        character.grade === "star-4" &&
        !pickupIds.has(character.id),
    );
  }

  if (category === "star-3") {
    return characterList.filter(
      (character) =>
        character.grade === "star-3" &&
        !pickupIds.has(character.id),
    );
  }

  if (category === "star-2") {
    return characterList.filter(
      (character) =>
        character.grade === "star-2" &&
        !pickupIds.has(character.id),
    );
  }

  return [];
}

// ガチャ1回分の結果を返す
export function rollScout(
  scout: ScoutBanner,
  characters: CharacterRecord,
): Character | null {
  const category = rollCategory(scout.rates);

  if (!category) {
    return null;
  }

  // ピックアップだけ個別確率による抽選
  if (category === "pickup") {
    return rollPickup(scout, characters);
  }

  // それ以外は同カテゴリ内から均等抽選
  const pool = getPoolByCategory(
    category,
    scout,
    characters,
  );

  return pickRandom(pool);
}

// 複数回の連続ガチャ
export function rollScoutMany(
  scout: ScoutBanner,
  characters: CharacterRecord,
  count: number,
): Character[] {
  const results: Character[] = [];

  for (let index = 0; index < count; index += 1) {
    const character = rollScout(scout, characters);

    if (character) {
      results.push(character);
    }
  }

  return results;
}
