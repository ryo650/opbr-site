import type { Character } from "./type";

// Shared labels used by Scout Simulator result cards and guide filters.
// These are the catalog's existing grades, not inferred star counts or names.
export const characterGradeLabels: Record<Character["grade"], string> = {
  ex: "EX",
  bf: "BF",
  sp: "SP",
  "star-4": "4★",
  "star-3": "3★",
  "star-2": "2★",
  free: "FREE",
  exchange: "EXCH",
  cola: "COLA",
  unknown: "?",
};

export function normalizeCharacterGrade(value: unknown): Character["grade"] {
  return typeof value === "string" && Object.hasOwn(characterGradeLabels, value)
    ? value as Character["grade"]
    : "unknown";
}
