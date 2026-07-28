import { sSnakeGuide } from "./seraphim-s-snake";
import type { CharacterGuide } from "./type";

export const characterGuides: Record<string, CharacterGuide> = {
  [sSnakeGuide.characterId]: sSnakeGuide,
};

export function getCharacterGuide(characterId: string) {
  return characterGuides[characterId];
}
