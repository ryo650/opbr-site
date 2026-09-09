export const RATE_SCROLLBAR_CROP = {
  x: 1939,
  y: 340,
  width: 12,
  height: 600,
};

export function analyzeRateScrollbarPixels(pixelDump) {
  let totalPixels = 0;
  let darkPixels = 0;
  let orangePixels = 0;
  let orangeMinY = null;
  let orangeMaxY = null;

  for (const line of pixelDump.split("\n")) {
    const match = line.match(/^(\d+),(\d+):.*#([0-9a-f]{6})/i);
    if (!match) continue;
    const y = Number(match[2]);
    const hex = match[3];
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    totalPixels += 1;

    if (red < 64 && green < 64 && blue < 64) darkPixels += 1;
    if (red > 180 && green > 60 && green < 200 && blue < 100) {
      orangePixels += 1;
      orangeMinY = orangeMinY === null ? y : Math.min(orangeMinY, y);
      orangeMaxY = orangeMaxY === null ? y : Math.max(orangeMaxY, y);
    }
  }

  if (totalPixels === 0) {
    throw new Error("Rate scrollbar pixel crop produced no pixels");
  }

  const darkRatio = darkPixels / totalPixels;
  const orangeRatio = orangePixels / totalPixels;
  const scrollbarDetected = darkRatio >= 0.1 && orangeRatio >= 0.05;
  const noScrollbar = darkRatio < 0.05 && orangeRatio < 0.05;
  const scrollbarAtBottom =
    scrollbarDetected &&
    orangeMaxY !== null &&
    orangeMaxY >= RATE_SCROLLBAR_CROP.height - 15;

  return {
    crop: RATE_SCROLLBAR_CROP,
    darkRatio,
    orangeRatio,
    orangeMinY,
    orangeMaxY,
    scrollbarDetected,
    noScrollbar,
    scrollbarAtBottom,
    ambiguous: !scrollbarDetected && !noScrollbar,
  };
}

export function evaluateRateCoverage({ traitKindCount, pages }) {
  if (pages.length === 0) {
    return {
      accepted: false,
      terminalReached: false,
      basis: "missing-rate-page",
    };
  }

  if (pages.some((page) => !page.allDisplayedTraitsParsed)) {
    return {
      accepted: false,
      terminalReached: false,
      basis: "unparsed-visible-trait",
    };
  }

  const lastPage = pages.at(-1);
  const terminalReached =
    lastPage.viewport.noScrollbar || lastPage.viewport.scrollbarAtBottom;
  if (terminalReached) {
    return {
      accepted: traitKindCount > 0,
      terminalReached: true,
      basis: lastPage.viewport.noScrollbar
        ? "complete-list-fits-without-scrollbar"
        : "scrollbar-reached-bottom",
    };
  }

  // Preserve established batches that already expose a complete common
  // three-kind native Trait set. Low-cardinality sets must prove the list end;
  // otherwise a partial first page could be mistaken for a one/two-kind medal.
  if (traitKindCount >= 3) {
    return {
      accepted: true,
      terminalReached: false,
      basis: "complete-common-trait-set",
    };
  }

  return {
    accepted: false,
    terminalReached: false,
    basis: lastPage.viewport.ambiguous
      ? "ambiguous-scrollbar-state"
      : "scrollable-list-end-not-reached",
  };
}
