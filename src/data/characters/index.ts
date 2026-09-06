import { redCharacters } from "./red.ts";
import { blueCharacters } from "./blue.ts";
import { greenCharacters } from "./green.ts";
import { blackCharacters } from "./black.ts";
import { whiteCharacters } from "./white.ts";

export {
    characterLevel100StatsByCharacterId,
    characterLevel100StatsCatalog,
} from "./level-100-stats.ts";
export type { CharacterLevel100Stats } from "./level-100-stats.ts";

export const characters = {
    ...redCharacters,
    ...blueCharacters,
    ...greenCharacters,
    ...blackCharacters,
    ...whiteCharacters
}
