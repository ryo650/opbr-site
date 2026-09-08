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

// Prepare the category pools once for a sequence of pulls.
// Rates remain relative weights, including existing incomplete input totals.
export function createScoutRoller(scout: ScoutBanner, characters: CharacterRecord): () => Character | null {
  const pickupIds = new Set(scout.pickups.map((pickup) => pickup.characterId));
  const pools = new Map<ScoutCategory, Character[]>();
  for (const character of Object.values(characters)) {
    if (pickupIds.has(character.id) || character.grade === "unknown") continue;
    const pool = pools.get(character.grade) ?? [];
    pool.push(character);
    pools.set(character.grade, pool);
  }
  return () => {
    const category = rollCategory(scout.rates);
    if (!category) return null;
    if (category === "pickup") return rollPickup(scout, characters);
    return pickRandom(pools.get(category) ?? []);
  };
}

// ガチャ1回分の結果を返す
export function rollScout(
  scout: ScoutBanner,
  characters: CharacterRecord,
): Character | null {
  return createScoutRoller(scout, characters)();
}

// 複数回の連続ガチャ
export function rollScoutMany(
  scout: ScoutBanner,
  characters: CharacterRecord,
  count: number,
): Character[] {
  const results: Character[] = [];
  const roll = createScoutRoller(scout, characters);

  for (let index = 0; index < count; index += 1) {
    const character = roll();

    if (character) {
      results.push(character);
    }
  }

  return results;
}
