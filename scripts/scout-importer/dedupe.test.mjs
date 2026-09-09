import assert from "node:assert/strict";
import test from "node:test";
import { deduplicateScreenshots } from "./dedupe.mjs";

test("deduplicateScreenshots keeps the first image for each signature", () => {
  const first = { file: "IMG_1.PNG", signature: "same" };
  const duplicate = { file: "IMG_2.PNG", signature: "same" };
  const other = { file: "IMG_3.PNG", signature: "other" };

  assert.deepEqual(deduplicateScreenshots([first, duplicate, other]), {
    unique: [first, other],
    skipped: [{ item: duplicate, duplicateOf: first }],
  });
});
