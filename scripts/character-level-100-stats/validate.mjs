import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  characterBoostProfiles,
  characterBoostStages,
  characterLevel100BaseStatsCatalog,
  characters,
  isCharacterBoostRole,
} from "../../src/data/characters/index.ts";

const baseStatFields = ["baseHp", "baseAtk", "baseDef"];
const boostRoles = ["attacker", "runner", "defender"];

export function validateCharacterLevel100BaseStats(entries, canonicalCharacters, boostProfiles = characterBoostProfiles) {
  const errors = [];
  const seenCharacterIds = new Set();
  const seenEntries = new Set();
  let verifiedCount = 0;
  let pendingCount = 0;
  let partialCount = 0;

  for (const role of boostRoles) {
    const roleProfile = boostProfiles[role];
    if (!roleProfile) {
      errors.push(`missing Character Boost profile for role: ${role}`);
      continue;
    }
    for (const { id: stageId } of characterBoostStages) {
      const values = roleProfile[stageId];
      if (!values) {
        errors.push(`${role}: missing Character Boost stage ${stageId}`);
        continue;
      }
      for (const stat of ["hp", "atk", "def"]) {
        if (!Number.isInteger(values[stat]) || values[stat] < 0) {
          errors.push(`${role}/${stageId}: ${stat} Boost must be an integer greater than or equal to 0`);
        }
      }
    }
  }

  entries.forEach((entry, index) => {
    const location = `entry ${index + 1}`;
    const signature = JSON.stringify([
      entry.characterId,
      entry.baseHp,
      entry.baseAtk,
      entry.baseDef,
    ]);

    if (seenEntries.has(signature)) errors.push(`${location}: duplicate entry for ${entry.characterId}`);
    seenEntries.add(signature);

    if (seenCharacterIds.has(entry.characterId)) errors.push(`${location}: duplicate characterId ${entry.characterId}`);
    seenCharacterIds.add(entry.characterId);

    const character = canonicalCharacters[entry.characterId];
    if (!character) {
      errors.push(`${location}: characterId does not exist in canonical catalog: ${entry.characterId}`);
    } else if (character.id !== entry.characterId) {
      errors.push(`${location}: canonical key/id mismatch for ${entry.characterId}`);
    } else if (!isCharacterBoostRole(character.role)) {
      errors.push(`${location}: canonical role cannot resolve a Boost profile: ${character.role}`);
    }

    const baseValues = baseStatFields.map((baseField) => entry[baseField]);
    const nullCount = baseValues.filter((value) => value === null).length;
    if (nullCount > 0) {
      pendingCount += 1;
      if (nullCount < baseValues.length) partialCount += 1;
    } else {
      verifiedCount += 1;
    }

    for (const baseField of baseStatFields) {
      const baseValue = entry[baseField];
      if (baseValue === null) continue;
      if (!Number.isInteger(baseValue) || baseValue <= 0) {
        errors.push(`${location}: ${baseField} must be an integer greater than 0`);
      }
    }
  });

  return {
    entryCount: entries.length,
    verifiedCount,
    pendingCount,
    partialCount,
    errors,
  };
}

function runAudit() {
  const result = validateCharacterLevel100BaseStats(characterLevel100BaseStatsCatalog, characters);
  console.log(`Lv.100 Character Base Stats — Total: ${result.entryCount}`);
  console.log(`Verified: ${result.verifiedCount}`);
  console.log(`Pending: ${result.pendingCount}`);
  if (result.partialCount) console.log(`Pending partial entries: ${result.partialCount}`);
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
