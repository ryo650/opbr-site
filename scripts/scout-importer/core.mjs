import {
  compareDecimal,
  decimal,
  decimalToNumber,
  decimalToString,
  multiplyDecimalByInteger,
  roundDecimal,
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

export function normalizeCharacterName(value) {
  return normalizeText(value)
    .replace(/\band\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalizeScoutTitle(value) {
  return value
    .normalize("NFKC")
    .replace(/^\s*\d+\s*[-‐‑‒–—]?\s*step\b[\s:：\-‐‑‒–—]*/i, "")
    .replace(/[\[\]{}()【】「」『』［］｛｝（）]/g, " ")
    .replace(/[#＃№]/g, " ")
    .replace(/[^\p{L}\p{N}&'’.\-]+/gu, " ")
    .replace(/[\s:：\-‐‑‒–—]*\bstep\s*\d+\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function centerX(observation) {
  return observation.x + observation.width / 2;
}

function centerY(observation) {
  return observation.y + observation.height / 2;
}

function singleAnchor(observations, label) {
  const normalizedLabel = normalizeText(label);
  const anchors = observations.filter(
    ({ text }) => normalizeText(text) === normalizedLabel,
  );
  return anchors.length === 1 ? anchors[0] : null;
}

export function extractScoutIdentity(ocr) {
  const observations = ocr.observations ?? [];
  const header = singleAnchor(observations, "Show Drop Rates");
  if (!header) return { canonicalTitle: null, id: null };

  const headerX = centerX(header);
  const headerY = centerY(header);
  // Vision coordinates are normalized. The title is the centered, large-text
  // block directly below the modal header and above the explanatory copy.
  const titleObservations = observations
    .filter((observation) => {
      if (observation === header) return false;
      const verticalGap = headerY - centerY(observation);
      return (
        verticalGap >= 0.05 &&
        verticalGap <= 0.19 &&
        Math.abs(centerX(observation) - headerX) <= 0.2 &&
        observation.height >= header.height * 0.75
      );
    })
    .sort((left, right) => centerY(right) - centerY(left));
  if (titleObservations.length === 0 || titleObservations.length > 4) {
    return { canonicalTitle: null, id: null };
  }

  const canonicalTitle = canonicalizeScoutTitle(
    titleObservations.map(({ text }) => text).join(" "),
  );
  const id = canonicalTitle ? slugify(canonicalTitle) : null;
  if (!id || id.length > 120 || id.split("-").length > 20) {
    return { canonicalTitle: null, id: null };
  }
  return { canonicalTitle: canonicalTitle || null, id: id || null };
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

export function createCharacterNameIndex(characters) {
  const index = new Map();
  for (const character of characters) {
    for (const value of [character.id, character.name]) {
      const key = normalizeCharacterName(value);
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
  const target = normalizeCharacterName(phrases.at(-1) ?? phrases.join(" "));
  if (!target) return [];
  return characters
    .map((character) => {
      const name = normalizeCharacterName(character.name);
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
    const normalized = normalizeCharacterName(phrase);
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

function joinCharacterNameParts(observations) {
  let name = "";
  for (const { text } of observations.sort((left, right) => {
    const vertical = centerY(right) - centerY(left);
    return Math.abs(vertical) > 0.01 ? vertical : left.x - right.x;
  })) {
    const part = text.trim();
    if (!part) continue;
    if (/^[a-z]$/.test(part) && /[a-z]$/i.test(name)) {
      name += part;
    } else {
      name += `${name ? " " : ""}${part}`;
    }
  }
  return name.replace(/\s+/g, " ").trim();
}

function characterRowsFromPage(page) {
  const observations = page.observations ?? [];
  const header = singleAnchor(observations, "Character Drop Rates");
  if (!header) {
    return {
      rows: [],
      issues: [{
        code: "missing-character-table-region",
        message: "Could not locate the Character Drop Rates modal header",
        file: page.file,
      }],
    };
  }

  const modalX = centerX(header);
  const tableTop = centerY(header) - 0.04;
  const tableBottom = Math.max(0, centerY(header) - 0.72);
  const inTableY = (observation) => {
    const y = centerY(observation);
    return y < tableTop && y > tableBottom;
  };
  const rateObservations = observations
    .filter((observation) => {
      const x = centerX(observation);
      return (
        inTableY(observation) &&
        x >= modalX + 0.06 &&
        x <= modalX + 0.25 &&
        parsePercent(observation.text)
      );
    })
    .sort((left, right) => centerY(right) - centerY(left));
  if (rateObservations.length === 0) {
    return {
      rows: [],
      issues: [{
        code: "missing-character-rate-rows",
        message: "No Character Drop Rates rows were found inside the modal",
        file: page.file,
      }],
    };
  }

  const gaps = rateObservations
    .slice(1)
    .map((observation, index) => centerY(rateObservations[index]) - centerY(observation));
  const fallbackHalfGap = gaps.length > 0
    ? Math.max(0.06, Math.min(...gaps) / 2)
    : 0.1;
  const rows = rateObservations.map((rateObservation, index) => {
    const rateY = centerY(rateObservation);
    const upper = index === 0
      ? tableTop
      : (centerY(rateObservations[index - 1]) + rateY) / 2;
    const lower = index === rateObservations.length - 1
      ? Math.max(tableBottom, rateY - fallbackHalfGap)
      : (rateY + centerY(rateObservations[index + 1])) / 2;
    const inRow = (observation) => {
      const y = centerY(observation);
      return y <= upper && y > lower;
    };
    // Name and rate columns are relative to the centered modal heading. This
    // excludes the Scout carousel on the left and the underlying UI on the right.
    const nameObservations = observations.filter((observation) => {
      const x = centerX(observation);
      return inRow(observation) && x >= modalX - 0.17 && x <= modalX + 0.06;
    });
    const featured = observations.some((observation) => {
      const x = centerX(observation);
      return (
        inRow(observation) &&
        x >= modalX + 0.04 &&
        x <= modalX + 0.28 &&
        headingMode(observation.text) === true
      );
    });
    return {
      name: joinCharacterNameParts(nameObservations),
      rate: parsePercent(rateObservation.text),
      featured,
      sourceRateText: rateObservation.text,
    };
  });
  return { rows, issues: [] };
}

export function extractCharacterRows(
  ocrPages,
  characters,
  { manualMappings = new Map() } = {},
) {
  const nameIndex = createCharacterNameIndex(characters);
  const rows = [];
  const issues = [];

  for (const page of ocrPages) {
    const reconstructed = characterRowsFromPage(page);
    issues.push(...reconstructed.issues);
    for (const row of reconstructed.rows) {
      const phrases = row.name ? [row.name] : [];
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
          rate: decimalToString(row.rate),
          featured: row.featured,
        });
      } else {
        rows.push({
          character: resolution.match.character,
          rate: row.rate,
          featured: row.featured,
          sourceText: resolution.match.phrase,
          sourceFile: page.file,
          manuallyResolved: resolution.match.manual,
        });
      }
    }
  }
  return { rows, issues };
}

export function selectNormalBfUnitRate(rows) {
  const normalBfRows = rows.filter(
    ({ featured, character }) => !featured && character.grade === "bf",
  );
  const issues = [];
  let rate = normalBfRows[0]?.rate ?? null;
  if (!rate) {
    issues.push({
      code: "missing-normal-bf-rate",
      message: "No non-featured grade=bf character and rate were resolved",
    });
  } else {
    for (const row of normalBfRows.slice(1)) {
      if (compareDecimal(row.rate, rate) !== 0) {
        issues.push({
          code: "normal-bf-rate-mismatch",
          message: `Normal BF rates differ: ${decimalToString(rate)}% and ${decimalToString(row.rate)}%`,
          file: row.sourceFile,
        });
        rate = null;
        break;
      }
    }
  }
  return { rate, rows: normalBfRows, issues };
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

export function calculateFinalScoutRates({
  totalFourStarRate,
  threeStarRate,
  twoStarRate,
  pickups,
  rateCalculation,
}) {
  const pickupTotal = sumDecimals(pickups.map(({ rate }) => rate));
  const bf = roundDecimal(rateCalculation.bfTotal, 2);
  const star4 = roundDecimal(
    subtractDecimal(
      subtractDecimal(totalFourStarRate, pickupTotal),
      bf,
    ),
    2,
  );
  const total = sumDecimals([
    pickupTotal,
    bf,
    star4,
    threeStarRate,
    twoStarRate,
  ]);
  return {
    pickupTotal,
    bf,
    star4,
    star3: threeStarRate,
    star2: twoStarRate,
    total,
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
  if (!draft.name) issues.push("Scout name was not provided");
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
      issues.push(`Raw rates total ${decimalToString(draft.rateCalculation.finalTotal)} instead of 100`);
    }
  }
  if (draft.finalRates) {
    for (const [label, rate] of [
      ["final pickup", draft.finalRates.pickupTotal],
      ["final BF", draft.finalRates.bf],
      ["final star-4", draft.finalRates.star4],
      ["final star-3", draft.finalRates.star3],
      ["final star-2", draft.finalRates.star2],
    ]) {
      if (compareDecimal(rate, ZERO) < 0 || compareDecimal(rate, ONE_HUNDRED) > 0) {
        issues.push(`${label} rate is outside 0..100`);
      }
    }
    if (compareDecimal(draft.finalRates.total, ONE_HUNDRED) !== 0) {
      issues.push(
        `Final output rates total ${decimalToString(draft.finalRates.total)} instead of 100`,
      );
    }
  } else if (draft.rateCalculation) {
    issues.push("Final output rates were not calculated");
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
  const calculation = {
    bfTotal: draft.finalRates.bf,
    star4: draft.finalRates.star4,
  };
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
