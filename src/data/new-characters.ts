export type NewCharacterRelease = {
  characterId: string;
  /** YYYY-MM-DD. Use the character's first scout release date. */
  releaseDate: string;
};

/**
 * Add one entry here when a new Character Guide is published.
 * Names and images are resolved from src/data/characters, so they are not duplicated.
 */
export const newCharacterReleases = [
  {
    characterId: "the-five-elders-st-marcus-mars",
    releaseDate: "2026-07-29",
  },
  {
    characterId: "future-where-i-m-the-most-free-jewelry-bonney",
    releaseDate: "2026-08-19",
  },
] as const satisfies readonly NewCharacterRelease[];

function parseReleaseDate(releaseDate: string) {
  return new Date(`${releaseDate}T00:00:00.000Z`);
}

export function getNewCharacterExpiry(releaseDate: string) {
  const releasedAt = parseReleaseDate(releaseDate);
  const year = releasedAt.getUTCFullYear();
  const targetMonth = releasedAt.getUTCMonth() + 2;
  const day = releasedAt.getUTCDate();
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();

  return new Date(Date.UTC(year, targetMonth, Math.min(day, lastDay)));
}

export function getActiveNewCharacterReleases(now = new Date()) {
  return [...newCharacterReleases]
    .filter(({ releaseDate }) => {
      const releasedAt = parseReleaseDate(releaseDate);
      const expiresAt = getNewCharacterExpiry(releaseDate);
      return releasedAt <= now && now < expiresAt;
    })
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
}
