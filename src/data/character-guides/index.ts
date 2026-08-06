import { sSnakeGuide } from "./seraphim-s-snake";
import { stMarcusMarsGuide } from "./the-five-elders-st-marcus-mars";
import type { CharacterGuide } from "./type";

export const characterGuides: Record<string, CharacterGuide> = {
  [sSnakeGuide.characterId]: sSnakeGuide,
  [stMarcusMarsGuide.characterId]: stMarcusMarsGuide,
};

export function getCharacterGuide(characterId: string) {
  return characterGuides[characterId];
}
