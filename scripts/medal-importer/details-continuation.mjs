export const UNIQUE_TRAIT_SCROLLBAR_CROP = {
  x: 1745,
  y: 275,
  width: 14,
  height: 225,
};

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function extractDetailsScreenName(ocr) {
  const candidates = ocr.lines
    .map((line) => line.trim())
    .filter(
      (line) =>
        /\bmedals?$/i.test(line) && normalizeText(line) !== "medal details",
    );
  return candidates.length === 1 ? candidates[0] : null;
}

export function analyzeUniqueTraitScrollbarPixels(pixelDump) {
  const header = pixelDump.match(
    /^# ImageMagick pixel enumeration: (\d+),(\d+),/m,
  );
  if (!header) throw new Error("Could not parse Unique Trait scrollbar crop");
  const width = Number(header[1]);
  const height = Number(header[2]);
  const orangePixelsByRow = new Map();

  for (const match of pixelDump.matchAll(
    /\d+,(\d+): \((\d+),(\d+),(\d+)(?:,[^)]+)?\)/g,
  )) {
    const y = Number(match[1]);
    const red = Number(match[2]);
    const green = Number(match[3]);
    const blue = Number(match[4]);
    if (red >= 215 && green >= 70 && green <= 170 && blue <= 80) {
      orangePixelsByRow.set(y, (orangePixelsByRow.get(y) ?? 0) + 1);
    }
  }

  const orangeRows = [];
  for (let y = 0; y < height; y += 1) {
    if ((orangePixelsByRow.get(y) ?? 0) >= Math.max(1, width * 0.4)) {
      orangeRows.push(y);
    }
  }

  const runs = [];
  for (const y of orangeRows) {
    const current = runs.at(-1);
    if (current && y === current.end + 1) current.end = y;
    else runs.push({ start: y, end: y });
  }
  const thumb = runs
    .filter((run) => run.end - run.start + 1 >= 10)
    .sort(
      (left, right) =>
        right.end - right.start - (left.end - left.start),
    )[0];

  if (!thumb) {
    return { detected: false, atBottom: false, start: null, end: null, center: null };
  }
  return {
    detected: true,
    start: thumb.start,
    end: thumb.end,
    center: (thumb.start + thumb.end) / 2 / height,
    atBottom: thumb.end >= height - 6,
  };
}

export function evaluateDetailsContinuation({
  baseName,
  candidateName,
  baseScroll,
  candidateScroll,
  rateStarted,
}) {
  if (
    !baseName ||
    !candidateName ||
    normalizeText(baseName) !== normalizeText(candidateName) ||
    rateStarted
  ) {
    return { candidate: false, accepted: false, issues: [] };
  }

  const issues = [];
  if (!baseScroll.detected || !candidateScroll.detected) {
    issues.push("unique-trait-scrollbar-not-detected");
  } else if (candidateScroll.center <= baseScroll.center + 0.02) {
    issues.push("unique-trait-scroll-position-not-lower");
  }
  return { candidate: true, accepted: issues.length === 0, issues };
}

export function extractUniqueTraitFieldLines(ocr) {
  const labelIndex = ocr.lines.findIndex(
    (line) => normalizeText(line) === "unique trait",
  );
  if (labelIndex === -1) return [];
  const lines = [];
  for (const rawLine of ocr.lines.slice(labelIndex + 1)) {
    const line = rawLine.trim();
    const normalized = normalizeText(line);
    if (!normalized || normalized === "tag") continue;
    if (
      normalized === "limits" ||
      normalized === "close" ||
      normalized === "rate" ||
      normalized.startsWith("extra trait") ||
      normalized.startsWith("unlock with upgrade")
    ) {
      break;
    }
    lines.push(line);
  }
  return lines;
}

export function mergeUniqueTraitSegments(baseLines, continuationLines) {
  const maximum = Math.min(baseLines.length, continuationLines.length);
  let overlap = 0;
  for (let size = maximum; size >= 1; size -= 1) {
    const left = baseLines.slice(-size).map(normalizeText);
    const right = continuationLines.slice(0, size).map(normalizeText);
    if (left.every((line, index) => line === right[index])) {
      const overlapText = left.join(" ");
      if (overlapText.length >= 20 && overlapText.split(/\s+/).length >= 4) {
        overlap = size;
        break;
      }
    }
  }
  if (overlap === 0) {
    return { merged: false, overlapLines: 0, lines: baseLines };
  }
  return {
    merged: true,
    overlapLines: overlap,
    lines: [...baseLines, ...continuationLines.slice(overlap)],
  };
}
