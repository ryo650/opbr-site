import { redCharacters } from "./red.ts";
import { blueCharacters } from "./blue.ts";
import { greenCharacters } from "./green.ts";
import { blackCharacters } from "./black.ts";
import { whiteCharacters } from "./white.ts";

export {
    characterLevel100BaseStatsByCharacterId,
    characterLevel100BaseStatsCatalog,
    getSelectableCharacterLevel100BaseStats,
    hasCompleteCharacterLevel100BaseStats,
} from "./level-100-base-stats.ts";
export type {
    CharacterLevel100BaseStats,
    CompleteCharacterLevel100BaseStats,
} from "./level-100-base-stats.ts";
export {
    characterBoostProfiles,
    characterBoostStages,
    deriveBaseStatsFromDisplayedStats,
    getCharacterBoostProfile,
    getCharacterBoostValues,
    isCharacterBoostRole,
} from "./boost-profiles.ts";
export type {
    CharacterBoostProfile,
    CharacterBoostRole,
    CharacterBoostStage,
    CharacterBoostStageId,
    CharacterBoostValues,
} from "./boost-profiles.ts";

export const characters = {
    ...redCharacters,
    ...blueCharacters,
    ...greenCharacters,
    ...blackCharacters,
    ...whiteCharacters
}
