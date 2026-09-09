import assert from "node:assert/strict";
import test from "node:test";
import { parseImageSequence, resolveInputOrder } from "./input-order.mjs";

test("numeric filename suffixes sort after their unsuffixed sequence", () => {
  const files = ["IMG_3866.PNG", "IMG_3865_2.PNG", "IMG_3865.PNG"];
  const items = files.map((file, index) => ({
    file,
    sequence: parseImageSequence(file),
    captureTime: `2026:08:29 14:15:0${index}`,
  }));
  const result = resolveInputOrder(items);
  assert.deepEqual(result.ordered.map((item) => item.file), [
    "IMG_3865.PNG",
    "IMG_3865_2.PNG",
    "IMG_3866.PNG",
  ]);
  assert.equal(result.source, "filename sequence");
});

test("multiple continuation suffixes use numeric rather than lexical order", () => {
  const files = ["IMG_4000_10.PNG", "IMG_4000_3.PNG", "IMG_4000_2.PNG", "IMG_4000.PNG"];
  const result = resolveInputOrder(
    files.map((file) => ({ file, sequence: parseImageSequence(file), captureTime: null })),
  );
  assert.deepEqual(result.ordered.map((item) => item.file), [
    "IMG_4000.PNG",
    "IMG_4000_2.PNG",
    "IMG_4000_3.PNG",
    "IMG_4000_10.PNG",
  ]);
});

test("non-sequence filenames still require a safe EXIF fallback", () => {
  const result = resolveInputOrder([
    { file: "capture-b.png", sequence: null, captureTime: "2026:08:29 10:00:02" },
    { file: "capture-a.png", sequence: null, captureTime: "2026:08:29 10:00:01" },
  ]);
  assert.deepEqual(result.ordered.map((item) => item.file), [
    "capture-a.png",
    "capture-b.png",
  ]);
  assert.equal(result.source, "EXIF DateTimeOriginal");
});
