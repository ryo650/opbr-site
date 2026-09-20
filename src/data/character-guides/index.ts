import { jewelryBonneyGuide } from "./future-where-i-m-the-most-free-jewelry-bonney";
import { sSnakeGuide } from "./seraphim-s-snake";
import { stMarcusMarsGuide } from "./the-five-elders-st-marcus-mars";
import type { CharacterGuide } from "./type";

export const characterGuides: Record<string, CharacterGuide> = {
  [jewelryBonneyGuide.characterId]: jewelryBonneyGuide,
  [sSnakeGuide.characterId]: sSnakeGuide,
  [stMarcusMarsGuide.characterId]: stMarcusMarsGuide,
};

export function hasCharacterGuide(characterId: string): boolean {
  return Object.hasOwn(characterGuides, characterId);
}

export function getCharacterGuide(characterId: string) {
  return characterGuides[characterId];
}
