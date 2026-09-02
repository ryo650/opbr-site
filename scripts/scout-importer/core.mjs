import {
  compareDecimal,
  decimal,
  decimalToNumber,
  decimalToString,
  multiplyDecimalByInteger,
  subtractDecimal,
  sumDecimals,
} from "./decimal.mjs";

const PERCENT_PATTERN = /([0-9]+(?:[.,][0-9]+)?)\s*%/;
const ZERO = decimal("0");
const ONE_HUNDRED = decimal("100");

export function normalizeText(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugify(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

export function naturalImageCompare(left, right) {
  return left.localeCompare(right, "en", {
    numeric: true,
    sensitivity: "base",
  });
}

export function scoutVariableName(id) {
  const pascal = id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");
  return `scout${pascal || "Imported"}`;
}

function parsePercent(value) {
  const match = value.match(PERCENT_PATTERN);
  return match ? decimal(match[1].replace(",", ".")) : null;
}

function detectStarLabel(value) {
  const normalized = value
    .replace(/[★☆*]/g, " star ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase();
  const explicit = normalized.match(/(?:star\s*([234])|([234])\s*star)/);
  if (explicit) return Number(explicit[1] ?? explicit[2]);
  const characterLabel = normalized.match(/\b([234])\s*(?:characters?|units?)\b/);
  return characterLabel ? Number(characterLabel[1]) : null;
}

export function parseDropRates(lines) {
  const found = new Map();
  let segment = [];
  for (const rawLine of lines) {
    const rate = parsePercent(rawLine);
    const textBeforeRate = rawLine.replace(PERCENT_PATTERN, " ").trim();
    if (textBeforeRate) segment.push(textBeforeRate);
    if (!rate) continue;

    const label = detectStarLabel(segment.slice(-3).join(" "));
    if (label) {
      const existing = found.get(label);
      if (existing && compareDecimal(existing, rate) !== 0) {
        throw new Error(`Conflicting ★${label} rates were recognized`);
      }
      found.set(label, rate);
    }
    segment = [];
  }
  return {
    fourStar: found.get(4) ?? null,
    threeStar: found.get(3) ?? null,
    twoStar: found.get(2) ?? null,
  };
}

function headingMode(line) {
  const normalized = normalizeText(line);
  if (/\bfeatured characters?\b/.test(normalized)) return true;
  if (
    /\b(?:other|all|standard|normal|four star|4 star|4) characters?\b/.test(normalized) ||
    /^characters?$/.test(normalized)
  ) {
    return false;
  }
  return null;
}

function isCandidateNoise(line) {
  const normalized = normalizeText(line);
  return (
    !normalized ||
    headingMode(line) !== null ||
    /^(?:character )?drop rates?$/.test(normalized) ||
    /drop rates are rounded/.test(normalized) ||
    /^(?:close|back|details|rarity)$/.test(normalized) ||
    /^to \d/.test(normalized)
  );
}

function candidatePhrases(lines) {
  const cleaned = lines
    .map((line) => line.replace(PERCENT_PATTERN, " ").trim())
    .filter((line) => !isCandidateNoise(line));
  const phrases = [];
  const maxParts = Math.min(6, cleaned.length);
  for (let length = maxParts; length >= 1; length -= 1) {
    for (let start = cleaned.length - length; start >= 0; start -= 1) {
      phrases.push(cleaned.slice(start, start + length).join(" "));
    }
  }
  return [...new Set(phrases.map((phrase) => phrase.trim()).filter(Boolean))];
}

export function createCharacterNameIndex(characters) {
  const index = new Map();
  for (const character of characters) {
    for (const value of [character.id, character.name]) {
      const key = normalizeText(value);
      if (!index.has(key)) index.set(key, []);
      if (!index.get(key).some(({ id }) => id === character.id)) {
        index.get(key).push(character);
      }
    }
  }
  return index;
}

function levenshtein(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          Number(left[leftIndex - 1] !== right[rightIndex - 1]),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function suggestions(phrases, characters) {
  const target = normalizeText(phrases.at(-1) ?? phrases.join(" "));
  if (!target) return [];
  return characters
    .map((character) => {
      const name = normalizeText(character.name);
      return {
        id: character.id,
        name: character.name,
        distance: levenshtein(target, name),
      };
    })
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 3);
}

function resolveCharacter(phrases, nameIndex, characters, manualMappings) {
  const resolved = new Map();
  for (const phrase of phrases) {
    const normalized = normalizeText(phrase);
    const manualId = manualMappings.get(normalized);
    if (manualId) {
      const character = characters.find(({ id }) => id === manualId);
      if (character) resolved.set(character.id, { character, phrase, manual: true });
    }
    for (const character of nameIndex.get(normalized) ?? []) {
      resolved.set(character.id, { character, phrase, manual: false });
    }
  }
  if (resolved.size === 1) return { match: [...resolved.values()][0], issue: null };
  if (resolved.size > 1) {
    return {
      match: null,
      issue: {
        code: "ambiguous-character-name",
        message: `OCR text exactly matches multiple characters: ${[...resolved.keys()].join(", ")}`,
        phrases,
      },
    };
  }
  return {
    match: null,
    issue: {
      code: "unresolved-character-name",
      message: "Character OCR could not be matched exactly to the character master",
      phrases,
      suggestions: suggestions(phrases, characters),
    },
  };
}

export function extractCharacterRows(
  ocrPages,
  characters,
  { manualMappings = new Map() } = {},
) {
  const nameIndex = createCharacterNameIndex(characters);
  const rows = [];
  const issues = [];
  let featuredMode = null;

  for (const page of ocrPages) {
    let segment = [];
    for (const rawLine of page.lines) {
      const mode = headingMode(rawLine);
      if (mode !== null) {
        featuredMode = mode;
        segment = [];
        continue;
      }
      const rate = parsePercent(rawLine);
      segment.push(rawLine);
      if (!rate) continue;

      const phrases = candidatePhrases(segment);
      const resolution = resolveCharacter(
        phrases,
        nameIndex,
        characters,
        manualMappings,
      );
      if (!resolution.match) {
        issues.push({
          ...resolution.issue,
          file: page.file,
          rate: decimalToString(rate),
          featured: featuredMode,
        });
      } else if (featuredMode === null) {
        issues.push({
          code: "unknown-character-section",
          message: "Character rate was recognized before a Featured/normal section heading",
          file: page.file,
          characterId: resolution.match.character.id,
          phrases,
        });
      } else {
        rows.push({
          character: resolution.match.character,
          rate,
          featured: featuredMode,
          sourceText: resolution.match.phrase,
          sourceFile: page.file,
          manuallyResolved: resolution.match.manual,
        });
      }
      segment = [];
    }
  }
  return { rows, issues };
}

export function mergeCharacterRows(rows) {
  const byKey = new Map();
  const issues = [];
  for (const row of rows) {
    const key = `${row.featured ? "featured" : "normal"}:${row.character.id}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
      continue;
    }
    if (compareDecimal(existing.rate, row.rate) !== 0) {
      issues.push({
        code: "conflicting-character-rate",
        message: `${row.character.id} has conflicting rates across screenshots`,
        firstFile: existing.sourceFile,
        secondFile: row.sourceFile,
      });
    }
  }
  return { rows: [...byKey.values()], issues };
}

export function calculateScoutRates({
  totalFourStarRate,
  threeStarRate,
  twoStarRate,
  pickups,
  bfUnitRate,
  characters,
}) {
  const pickupIds = new Set(pickups.map(({ characterId }) => characterId));
  const allBfCount = characters.filter(({ grade }) => grade === "bf").length;
  const pickupBfCount = characters.filter(
    ({ id, grade }) => grade === "bf" && pickupIds.has(id),
  ).length;
  const bfCount = allBfCount - pickupBfCount;
  const pickupTotal = sumDecimals(pickups.map(({ rate }) => rate));
  const bfTotal = multiplyDecimalByInteger(bfUnitRate, bfCount);
  const star4 = subtractDecimal(
    subtractDecimal(totalFourStarRate, pickupTotal),
    bfTotal,
  );
  const finalTotal = sumDecimals([
    pickupTotal,
    bfTotal,
    star4,
    threeStarRate,
    twoStarRate,
  ]);
  return {
    allBfCount,
    pickupBfCount,
    bfCount,
    pickupTotal,
    bfTotal,
    star4,
    finalTotal,
  };
}

function datePartsInTokyo(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function isoTokyoDate(year, month, day, hour, minute, second) {
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    throw new Error("Recognized date/time is outside the valid calendar range");
  }
  const pad = (value) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}+09:00`;
}

export function automaticStartAt(now = new Date()) {
  const parts = datePartsInTokyo(now);
  let date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  if (Number(parts.hour) < 14) {
    date = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  }
  return isoTokyoDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    14,
    0,
    0,
  );
}

export function parseDateOverride(value, label = "date", defaultSecond = 0) {
  const local = value.trim().match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (local) {
    return isoTokyoDate(
      Number(local[1]),
      Number(local[2]),
      Number(local[3]),
      Number(local[4]),
      Number(local[5]),
      Number(local[6] ?? defaultSecond),
    );
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ${label}: ${value}`);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return isoTokyoDate(
    Number(values.year),
    Number(values.month),
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
}

export function extractEndAt(lines, startAt) {
  const text = lines.join(" ").replace(/\s+/g, " ");
  const startYear = Number(startAt.slice(0, 4));
  const patterns = [
    /\bto\s+(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i,
    /\bto\s+(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i,
    /\bto\s+(\d{1,2})[\/.\-](\d{1,2})\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i,
  ];
  let match = text.match(patterns[0]);
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let meridiem;
  if (match) {
    [, year, month, day, hour, minute, meridiem] = match;
  } else if ((match = text.match(patterns[1]))) {
    [, month, day, year, hour, minute, meridiem] = match;
  } else if ((match = text.match(patterns[2]))) {
    [, month, day, hour, minute, meridiem] = match;
    year = startYear;
    if (Number(month) < Number(startAt.slice(5, 7)) - 6) year += 1;
  } else {
    return null;
  }
  let numericHour = Number(hour);
  if (meridiem) {
    numericHour %= 12;
    if (meridiem.toLowerCase() === "pm") numericHour += 12;
  }
  return isoTokyoDate(
    Number(year),
    Number(month),
    Number(day),
    numericHour,
    Number(minute),
    59,
  );
}

export function extractScoutName(ocr) {
  const excluded = /(?:drop rates?|scout points?|exchange|details|step\s*\d|\bto\s+\d|rainbow diamonds?|close)/i;
  const keyword = /(?:scout|festival|anniv|celebration|campaign|bounty)/i;
  const candidates = ocr.observations
    .filter(({ text }) => keyword.test(text) && !excluded.test(text))
    .map(({ text, height = 0 }) => ({ text: text.trim(), height }))
    .filter(({ text }) => text.length >= 4);
  const unique = [...new Map(candidates.map((candidate) => [normalizeText(candidate.text), candidate])).values()];
  const maximal = unique.filter(
    (candidate) =>
      !unique.some(
        (other) =>
          other !== candidate &&
          normalizeText(other.text).includes(normalizeText(candidate.text)),
      ),
  );
  if (maximal.length === 1) return { name: maximal[0].text, candidates: maximal };
  const ranked = [...maximal].sort((left, right) => right.height - left.height);
  if (ranked.length > 0 && (ranked.length === 1 || ranked[0].height >= ranked[1].height * 1.25)) {
    return { name: ranked[0].text, candidates: ranked };
  }
  return { name: null, candidates: ranked };
}

export function inspectScreenshotOcr(ocr, startAt) {
  const text = ocr.lines.join(" ");
  const rates = parseDropRates(ocr.lines);
  const starRateCount = [rates.fourStar, rates.threeStar, rates.twoStar]
    .filter(Boolean)
    .length;
  return {
    endAt: extractEndAt(ocr.lines, startAt),
    rates,
    starRateCount,
    percentageCount: ocr.lines.filter((line) => PERCENT_PATTERN.test(line)).length,
    hasFeaturedHeading: /\bfeatured characters?\b/i.test(text),
    hasToMarker: /\bto\b/i.test(text),
  };
}

export function validateOrderedScreenshotOcr({
  periodScreen,
  rateScreen,
  characterScreens,
  startAt,
  endAtOverride = null,
}) {
  const issues = [];
  const period = inspectScreenshotOcr(periodScreen.ocr, startAt);
  if (!period.endAt && !(endAtOverride && period.hasToMarker)) {
    issues.push(`${periodScreen.file}: 2nd image must contain a recognizable "to ..." end date`);
  }
  if (period.starRateCount === 3 || period.hasFeaturedHeading) {
    issues.push(`${periodScreen.file}: 2nd image OCR looks like a Drop Rates screen`);
  }

  const rate = inspectScreenshotOcr(rateScreen.ocr, startAt);
  if (rate.starRateCount !== 3) {
    issues.push(`${rateScreen.file}: 3rd image must contain ★4, ★3, and ★2 total rates`);
  }
  if (rate.endAt || rate.hasFeaturedHeading) {
    issues.push(`${rateScreen.file}: 3rd image OCR conflicts with the expected Drop Rates summary`);
  }

  let hasFeaturedHeading = false;
  for (const screen of characterScreens) {
    const evidence = inspectScreenshotOcr(screen.ocr, startAt);
    hasFeaturedHeading ||= evidence.hasFeaturedHeading;
    if (evidence.percentageCount === 0) {
      issues.push(`${screen.file}: Character Drop Rates image contains no recognized percentage`);
    }
    if (
      evidence.starRateCount === 3 &&
      evidence.percentageCount === 3 &&
      !evidence.hasFeaturedHeading
    ) {
      issues.push(`${screen.file}: 4th-or-later image looks like the ★4/★3/★2 summary`);
    }
    if (evidence.endAt) {
      issues.push(`${screen.file}: 4th-or-later image looks like the Scout period screen`);
    }
  }
  if (!hasFeaturedHeading) {
    issues.push("4th-or-later images must include a Featured Characters heading");
  }
  return {
    issues,
    endAt: period.endAt,
    rateSummary: rate.rates,
  };
}

export function validateScoutDraft(draft) {
  const issues = [];
  const requiredRates = [
    ["★4 total", draft.totalFourStarRate],
    ["★3", draft.threeStarRate],
    ["★2", draft.twoStarRate],
    ["normal BF unit", draft.bfUnitRate],
  ];
  for (const [label, value] of requiredRates) {
    if (!value) issues.push(`${label} rate was not recognized`);
  }
  if (!draft.name) issues.push("Scout name was not recognized");
  if (!draft.endAt) issues.push("Scout endAt was not recognized");
  if (!draft.featuredCharacter) issues.push("featuredCharacterId does not exist in character master");
  if (draft.pickups.length === 0) issues.push("No Featured Characters pickup was recognized");
  for (const pickup of draft.pickups) {
    if (compareDecimal(pickup.rate, ZERO) <= 0) {
      issues.push(`Pickup ${pickup.characterId} must have a positive rate`);
    }
  }
  if (draft.bfUnitRate && compareDecimal(draft.bfUnitRate, ZERO) <= 0) {
    issues.push("Normal BF unit rate must be positive");
  }
  if (draft.characterIssues.length > 0) issues.push("One or more character names/rates need review");
  if (draft.rateCalculation) {
    if (draft.rateCalculation.bfCount < 0) issues.push("Calculated BF count is negative");
    if (compareDecimal(draft.rateCalculation.bfTotal, ZERO) < 0) issues.push("Calculated BF total is negative");
    if (compareDecimal(draft.rateCalculation.star4, ZERO) < 0) issues.push("Calculated star-4 rate is negative");
    for (const [label, rate] of [
      ["pickup", draft.rateCalculation.pickupTotal],
      ["BF", draft.rateCalculation.bfTotal],
      ["star-4", draft.rateCalculation.star4],
      ["star-3", draft.threeStarRate],
      ["star-2", draft.twoStarRate],
    ]) {
      if (rate && (compareDecimal(rate, ZERO) < 0 || compareDecimal(rate, ONE_HUNDRED) > 0)) {
        issues.push(`${label} rate is outside 0..100`);
      }
    }
    const totalDifference = Math.abs(decimalToNumber(draft.rateCalculation.finalTotal) - 100);
    if (totalDifference > 0.001) {
      issues.push(`Final rates total ${decimalToString(draft.rateCalculation.finalTotal)} instead of 100`);
    }
  }
  if (draft.startAt && draft.endAt && new Date(draft.endAt) <= new Date(draft.startAt)) {
    issues.push("endAt must be later than startAt");
  }
  return issues;
}

export function renderScoutModule(draft) {
  const pickups = draft.pickups
    .map(
      ({ characterId, rate }) =>
        `    {\n        characterId: ${JSON.stringify(characterId)},\n        rate: ${decimalToString(rate)},\n    },`,
    )
    .join("\n");
  const calculation = draft.rateCalculation;
  return `/* This file is generated by scripts/scout-importer/import.mjs. */\n\nimport type {\n    ScoutBanner,\n    ScoutPickup,\n} from "./type";\n\nconst pickups = [\n${pickups}\n] satisfies readonly ScoutPickup[];\n\nconst totalPickupRate = pickups.reduce(\n    (total, pickup) => total + pickup.rate,\n    0,\n);\n\nexport const ${draft.variableName}: ScoutBanner = {\n    id: ${JSON.stringify(draft.id)},\n    name: ${JSON.stringify(draft.name)},\n    bannerImg: ${JSON.stringify(draft.bannerPublicPath)},\n    startAt: ${JSON.stringify(draft.startAt)},\n    endAt: ${JSON.stringify(draft.endAt)},\n    pullOptions: {\n        single: { pullCount: 1, diamondCost: 5 },\n        multi: { pullCount: 11, diamondCost: 50 },\n    },\n    pickups,\n    featuredCharacterId: ${JSON.stringify(draft.featuredCharacter.id)},\n    rates: {\n        pickup: totalPickupRate,\n        bf: ${decimalToString(calculation.bfTotal)},\n        "star-4": ${decimalToString(calculation.star4)},\n        "star-3": ${decimalToString(draft.threeStarRate)},\n        "star-2": ${decimalToString(draft.twoStarRate)},\n    },\n};\n`;
}

export function addScoutToIndex(source, variableName, id) {
  if (new RegExp(`\\b${variableName}\\b`).test(source)) {
    throw new Error(`Scout index already contains ${variableName}`);
  }
  const exportOffset = source.indexOf("export const scouts");
  if (exportOffset === -1) throw new Error("Could not locate scouts export in index.ts");
  const importLine = `import { ${variableName} } from ${JSON.stringify(`./${id}`)};\n`;
  const withImport = `${source.slice(0, exportOffset)}${importLine}\n${source.slice(exportOffset)}`;
  const arrayPattern = /(export const scouts\s*=\s*\[\s*\n)/;
  if (!arrayPattern.test(withImport)) throw new Error("Could not locate scouts array in index.ts");
  return withImport.replace(arrayPattern, `$1    ${variableName},\n`);
}

export function decimalDisplay(value) {
  return value ? decimalToString(value) : "<missing>";
}
