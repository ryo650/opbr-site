import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { characters } from "../../src/data/characters/index.ts";
import { characterLevel100StatsCatalog } from "../../src/data/characters/level-100-stats.ts";

export function validateCharacterLevel100Stats(entries, canonicalCharacters) {
  const errors = [];
  const seenCharacterIds = new Set();
  const seenEntries = new Set();

  entries.forEach((entry, index) => {
    const location = `entry ${index + 1}`;
    const signature = JSON.stringify([
      entry.characterId,
      entry.hp,
      entry.atk,
      entry.def,
    ]);

    if (seenEntries.has(signature)) {
      errors.push(`${location}: duplicate entry for ${entry.characterId}`);
    }
    seenEntries.add(signature);

    if (seenCharacterIds.has(entry.characterId)) {
      errors.push(`${location}: duplicate characterId ${entry.characterId}`);
    }
    seenCharacterIds.add(entry.characterId);

    const character = canonicalCharacters[entry.characterId];
    if (!character) {
      errors.push(`${location}: characterId does not exist in canonical catalog: ${entry.characterId}`);
    } else if (character.id !== entry.characterId) {
      errors.push(`${location}: canonical key/id mismatch for ${entry.characterId}`);
    }

    for (const stat of ["hp", "atk", "def"]) {
      if (!Number.isInteger(entry[stat]) || entry[stat] <= 0) {
        errors.push(`${location}: ${stat} must be an integer greater than 0`);
      }
    }
  });

  return {
    entryCount: entries.length,
    errors,
  };
}

function runAudit() {
  const result = validateCharacterLevel100Stats(characterLevel100StatsCatalog, characters);
  console.log(`Lv.100 Character Stats entries: ${result.entryCount}`);
  if (result.errors.length) {
    console.error(`Validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log("Validation: passed");
}

const isMain = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (isMain) runAudit();
