export function normalizeCharacterName(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return new Set(normalizeCharacterName(value).split(" ").filter(Boolean));
}

function tokenSimilarity(left, right) {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return 2 * intersection / (leftTokens.size + rightTokens.size);
}

export function createCharacterNameMatcher(canonicalCharacters, reviewedAliases = {}) {
  const canonicalByNormalizedName = new Map();
  for (const [catalogKey, character] of Object.entries(canonicalCharacters)) {
    const normalized = normalizeCharacterName(character.name);
    const entries = canonicalByNormalizedName.get(normalized) ?? [];
    entries.push({ catalogKey, character });
    canonicalByNormalizedName.set(normalized, entries);
  }

  const aliases = new Map(
    Object.entries(reviewedAliases).map(([name, characterId]) => [
      normalizeCharacterName(name),
      characterId,
    ]),
  );

  return function matchCharacterName({ characterName, identityLines = [] }) {
    const identityText = identityLines.join(" ").trim();
    const exactInputs = [...new Set([characterName, identityText].filter(Boolean))];

    for (const input of exactInputs) {
      const matches = canonicalByNormalizedName.get(normalizeCharacterName(input)) ?? [];
      if (matches.length === 1) {
        return {
          status: "matched",
          characterId: matches[0].catalogKey,
          method: "canonical-name",
          identityText,
          candidates: [],
        };
      }
      if (matches.length > 1) {
        return {
          status: "ambiguous",
          characterId: null,
          method: null,
          identityText,
          candidates: matches.map(({ catalogKey, character }) => ({
            characterId: catalogKey,
            name: character.name,
            score: 1,
          })),
        };
      }
    }

    for (const input of exactInputs) {
      const characterId = aliases.get(normalizeCharacterName(input));
      if (!characterId) continue;
      const character = canonicalCharacters[characterId];
      if (!character || character.id !== characterId) {
        return {
          status: "invalid-alias",
          characterId: null,
          method: null,
          identityText,
          candidates: [],
        };
      }
      return {
        status: "matched",
        characterId,
        method: "reviewed-alias",
        identityText,
        candidates: [],
      };
    }

    const suggestionInput = identityText || characterName;
    const candidates = Object.entries(canonicalCharacters)
      .map(([characterId, character]) => ({
        characterId,
        name: character.name,
        score: tokenSimilarity(suggestionInput, character.name),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.characterId.localeCompare(right.characterId))
      .slice(0, 5);

    return {
      status: "unmatched",
      characterId: null,
      method: null,
      identityText,
      candidates,
    };
  };
}

export function parseOcrInteger(value) {
  const compact = value
    .normalize("NFKC")
    .trim()
    .replace(/[\s,.]/g, "")
    .replace(/[Oo]/g, "0")
    .replace(/[Il|]/g, "1");
  if (!/^\d+$/.test(compact)) return null;
  const parsed = Number(compact);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function integerCandidates(text) {
  return (text.match(/[0-9OoIl|]+(?:[\s,.][0-9OoIl|]+)*/g) ?? [])
    .map(parseOcrInteger)
    .filter((value) => value !== null);
}

function extractStatValue(ocr) {
  const rightSideTexts = (ocr.observations ?? [])
    .filter(({ x }) => x >= 0.5)
    .map(({ text }) => text);
  const preferredCandidates = [...new Set(rightSideTexts.flatMap(integerCandidates))];
  if (preferredCandidates.length === 1) return { value: preferredCandidates[0], issue: null };
  if (preferredCandidates.length > 1) return { value: null, issue: "ambiguous numeric OCR" };

  const fallbackCandidates = [...new Set((ocr.lines ?? []).flatMap(integerCandidates))];
  if (fallbackCandidates.length === 1) return { value: fallbackCandidates[0], issue: null };
  return {
    value: null,
    issue: fallbackCandidates.length ? "ambiguous numeric OCR" : "missing numeric OCR",
  };
}

export function extractLevel(ocr) {
  for (const text of ocr.lines ?? []) {
    const match = text.match(/\blv\s*\.?\s*([0-9OoIl|]+)(?:\s*\/\s*([0-9OoIl|]+))?/i);
    if (!match) continue;
    const level = parseOcrInteger(match[1]);
    const maximum = match[2] ? parseOcrInteger(match[2]) : null;
    return { level, maximum };
  }
  return { level: null, maximum: null };
}

export function extractCharacterIdentity(ocr) {
  const observations = (ocr.observations ?? []).filter(({ text }) => normalizeCharacterName(text));
  const primary = [...observations].sort(
    (left, right) => right.width * right.height - left.width * left.height,
  )[0]?.text ?? ocr.lines?.at(-1) ?? null;
  return {
    characterName: primary,
    identityLines: ocr.lines ?? [],
  };
}

export function buildCharacterStatsScreenshotDraft({
  sourceImage,
  templateId,
  crops,
  ocrByRegion,
  matchCharacterName,
}) {
  const identity = extractCharacterIdentity(ocrByRegion.characterName);
  const match = identity.characterName
    ? matchCharacterName(identity)
    : { status: "unmatched", characterId: null, method: null, identityText: "", candidates: [] };
  const levelResult = extractLevel(ocrByRegion.level);
  const stats = {
    hp: extractStatValue(ocrByRegion.hp),
    atk: extractStatValue(ocrByRegion.atk),
    def: extractStatValue(ocrByRegion.def),
  };
  const issues = [];

  if (!identity.characterName) issues.push({ code: "missing-character-name", message: "Character Name was not recognized" });
  if (match.status !== "matched") issues.push({ code: "character-match-needs-review", message: `Canonical Character match is ${match.status}` });
  if (levelResult.level !== 100 || (levelResult.maximum !== null && levelResult.maximum !== 100)) {
    issues.push({ code: "level-not-100", message: `Expected Lv.100/100, found ${levelResult.level ?? "unrecognized"}/${levelResult.maximum ?? "unrecognized"}` });
  }
  for (const [stat, result] of Object.entries(stats)) {
    if (result.value === null) issues.push({ code: `${stat}-needs-review`, message: `${stat.toUpperCase()}: ${result.issue}` });
  }

  return {
    sourceType: "screenshot",
    templateId,
    sourceImage,
    characterName: identity.characterName,
    characterId: match.characterId,
    level: levelResult.level,
    hp: stats.hp.value,
    atk: stats.atk.value,
    def: stats.def.value,
    reviewStatus: issues.length ? "needs-review" : "ready",
    issues,
    match,
    crops,
    ocr: ocrByRegion,
  };
}
