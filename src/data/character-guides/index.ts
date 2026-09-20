import { sSnakeGuide } from "./seraphim-s-snake";
import { stMarcusMarsGuide } from "./the-five-elders-st-marcus-mars";
import type { CharacterGuide } from "./type";

export const characterGuides: Record<string, CharacterGuide> = {
  [sSnakeGuide.characterId]: sSnakeGuide,
  [stMarcusMarsGuide.characterId]: stMarcusMarsGuide,
};

export function hasCharacterGuide(characterId: string): boolean {
  return Object.hasOwn(characterGuides, characterId);
}

export function getCharacterGuide(characterId: string) {
  return characterGuides[characterId];
}
