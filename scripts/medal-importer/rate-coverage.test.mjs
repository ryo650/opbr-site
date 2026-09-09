import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeRateScrollbarPixels,
  evaluateRateCoverage,
  RATE_SCROLLBAR_CROP,
} from "./rate-coverage.mjs";

function pixelDump(colorsByY = new Map()) {
  const lines = ["# ImageMagick pixel enumeration"];
  for (let y = 0; y < RATE_SCROLLBAR_CROP.height; y += 1) {
    for (let x = 0; x < RATE_SCROLLBAR_CROP.width; x += 1) {
      const color = colorsByY.get(y) ?? "FFFFFF";
      lines.push(`${x},${y}: (0,0,0) #${color} srgb(0,0,0)`);
    }
  }
  return lines.join("\n");
}

function scrollbarDump({ orangeStart = 0, orangeEnd = 120 } = {}) {
  const colors = new Map();
  for (let y = 0; y < RATE_SCROLLBAR_CROP.height; y += 1) {
    colors.set(y, y >= orangeStart && y <= orangeEnd ? "F58220" : "101010");
  }
  return pixelDump(colors);
}

const page = (viewport, allDisplayedTraitsParsed = true) => ({
  file: "R1.PNG",
  viewport,
  allDisplayedTraitsParsed,
});

test("Rate viewport without a scrollbar proves a one-kind list is complete", () => {
  const viewport = analyzeRateScrollbarPixels(pixelDump());
  assert.equal(viewport.noScrollbar, true);
  assert.deepEqual(evaluateRateCoverage({ traitKindCount: 1, pages: [page(viewport)] }), {
    accepted: true,
    terminalReached: true,
    basis: "complete-list-fits-without-scrollbar",
  });
});

test("a complete two-kind list is accepted by the same terminal rule", () => {
  const viewport = analyzeRateScrollbarPixels(pixelDump());
  assert.equal(
    evaluateRateCoverage({ traitKindCount: 2, pages: [page(viewport)] }).accepted,
    true,
  );
});

test("a scrollbar thumb at the bottom proves the last page was captured", () => {
  const viewport = analyzeRateScrollbarPixels(
    scrollbarDump({ orangeStart: 470, orangeEnd: 599 }),
  );
  assert.equal(viewport.scrollbarAtBottom, true);
  assert.equal(
    evaluateRateCoverage({ traitKindCount: 1, pages: [page(viewport)] }).accepted,
    true,
  );
});

test("a partial scrollable one-kind page remains needsReview", () => {
  const viewport = analyzeRateScrollbarPixels(scrollbarDump());
  const result = evaluateRateCoverage({ traitKindCount: 1, pages: [page(viewport)] });
  assert.equal(result.accepted, false);
  assert.equal(result.basis, "scrollable-list-end-not-reached");
});

test("a partial scrollable two-kind page remains needsReview", () => {
  const viewport = analyzeRateScrollbarPixels(scrollbarDump());
  assert.equal(
    evaluateRateCoverage({ traitKindCount: 2, pages: [page(viewport)] }).accepted,
    false,
  );
});

test("an unparsed visible Trait is rejected even at the list end", () => {
  const viewport = analyzeRateScrollbarPixels(pixelDump());
  const result = evaluateRateCoverage({
    traitKindCount: 1,
    pages: [page(viewport, false)],
  });
  assert.equal(result.accepted, false);
  assert.equal(result.basis, "unparsed-visible-trait");
});

test("established three-kind batches retain their existing coverage behavior", () => {
  const viewport = analyzeRateScrollbarPixels(scrollbarDump());
  const result = evaluateRateCoverage({ traitKindCount: 3, pages: [page(viewport)] });
  assert.equal(result.accepted, true);
  assert.equal(result.basis, "complete-common-trait-set");
});
