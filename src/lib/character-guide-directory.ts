import { normalizeCharacterGrade } from "@/data/characters/grades";
import type { CharacterGuide } from "@/data/character-guides/type";
import type { Character } from "@/data/characters/type";

export type CharacterGuideEntry = Pick<Character, "id" | "name" | "image" | "element" | "role" | "grade"> & {
  summary: string;
  notice?: string;
};

// Publication is determined by the guide registry, independently of release dates.
// Project only card data so guide bodies and the full catalog stay on the server.
export function createCharacterGuideEntries(
  guides: Record<string, CharacterGuide>,
  characters: Record<string, Character>,
): CharacterGuideEntry[] {
  return Object.entries(guides).map(([id, guide]) => {
    if (guide.characterId !== id || !Object.hasOwn(characters, id)) {
      throw new Error(`Character Guide cannot resolve its character: ${id}`);
    }
    const { name, image, element, role, grade } = characters[id];
    return {
      id, name, image, element, role, grade: normalizeCharacterGrade(grade),
      summary: guide.guideOverview?.description?.trim() || guide.quickStrengths[0] || "",
      ...(guide.notice && { notice: guide.notice.title }),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en"));
}

function normalizeSearch(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/['’]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function filterCharacterGuideEntries(
  entries: CharacterGuideEntry[], query: string, element: string, role: string, grade = "",
): CharacterGuideEntry[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    const name = normalizeSearch(entry.name);
    return (!element || entry.element === element) && (!role || entry.role === role)
      && (!grade || entry.grade === grade)
      && words.every((word) => name.includes(word));
  });
}
