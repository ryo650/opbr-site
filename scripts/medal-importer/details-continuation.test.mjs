import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateDetailsContinuation,
  extractUniqueTraitFieldLines,
  mergeUniqueTraitSegments,
} from "./details-continuation.mjs";

test("same-name lower scroll before Rate is a continuation candidate", () => {
  assert.deepEqual(
    evaluateDetailsContinuation({
      baseName: "Savior Medal",
      candidateName: "savior medal",
      baseScroll: { detected: true, center: 0.45 },
      candidateScroll: { detected: true, center: 0.65 },
      rateStarted: false,
    }),
    { candidate: true, accepted: true, issues: [] },
  );
});

test("a different medal or a Details screen after Rate is not a continuation", () => {
  const scroll = { detected: true, center: 0.5 };
  assert.equal(
    evaluateDetailsContinuation({
      baseName: "A Medal",
      candidateName: "B Medal",
      baseScroll: scroll,
      candidateScroll: scroll,
      rateStarted: false,
    }).candidate,
    false,
  );
  assert.equal(
    evaluateDetailsContinuation({
      baseName: "A Medal",
      candidateName: "A Medal",
      baseScroll: scroll,
      candidateScroll: { detected: true, center: 0.7 },
      rateStarted: true,
    }).candidate,
    false,
  );
});

test("field lines exclude modal controls and retain visible continuation text", () => {
  assert.deepEqual(
    extractUniqueTraitFieldLines({
      lines: [
        "Savior Medal",
        "Unique Trait",
        "tag",
        "character type Long-Range Normal",
        "assigned Trait may be",
        "untrue.",
        "Extra Trait 1",
      ],
    }),
    [
      "character type Long-Range Normal",
      "assigned Trait may be",
      "untrue.",
    ],
  );
});

test("overlapping Unique Trait pages merge without duplicated lines", () => {
  const result = mergeUniqueTraitSegments(
    ["When equipped:", "Increase damage dealt by 5%.", "Trait may be"],
    ["Increase damage dealt by 5%.", "Trait may be", "untrue."],
  );
  assert.equal(result.merged, true);
  assert.equal(result.overlapLines, 2);
  assert.deepEqual(result.lines, [
    "When equipped:",
    "Increase damage dealt by 5%.",
    "Trait may be",
    "untrue.",
  ]);
});

test("unrelated Details text cannot be joined", () => {
  assert.equal(
    mergeUniqueTraitSegments(
      ["When equipped: Increase ATK by 5%."],
      ["When capturing: Recover HP by 5%."],
    ).merged,
    false,
  );
});
