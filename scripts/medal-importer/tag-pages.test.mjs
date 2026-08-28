import assert from "node:assert/strict";
import test from "node:test";
import { groupScreens, mergeTagPages } from "./tag-pages.mjs";

const screen = (file, type) => ({ file, type });
const tag = (id) => ({ id, name: id.toUpperCase() });
const page = (file, ids) => ({
  file,
  tags: ids.map(tag),
  issues: [],
});

test("1. Details + one Tag + Rate keeps the existing grouping", () => {
  assert.deepEqual(
    groupScreens([
      screen("D1", "details"),
      screen("T1", "tag"),
      screen("R1", "rate"),
    ]),
    [{ details: "D1", tagScreens: ["T1"], rates: ["R1"] }],
  );
});

test("2. Details + two Tags + Rate groups both Tag pages", () => {
  assert.deepEqual(
    groupScreens([
      screen("D1", "details"),
      screen("T1", "tag"),
      screen("T2", "tag"),
      screen("R1", "rate"),
    ]),
    [{ details: "D1", tagScreens: ["T1", "T2"], rates: ["R1"] }],
  );
});

test("3. overlapping Tag pages preserve order and deduplicate final tags", () => {
  const result = mergeTagPages([
    page("T1", ["a", "b", "c", "d"]),
    page("T2", ["d", "e", "f"]),
  ]);
  assert.deepEqual(result.tags.map((item) => item.id), [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ]);
  assert.deepEqual(result.issues, []);
});

test("4. identical Tag content is detected as an accidental duplicate", () => {
  const result = mergeTagPages([
    page("T1", ["a", "b"]),
    page("T2", ["a", "b"]),
  ]);
  assert.deepEqual(result.tags.map((item) => item.id), ["a", "b"]);
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].code, "duplicate-tag-page-content");
  assert.equal(result.issues[0].duplicateScreenshot, "T1");
});

test("5. Details boundaries keep Tag pages in separate groups", () => {
  assert.deepEqual(
    groupScreens([
      screen("DA", "details"),
      screen("TA", "tag"),
      screen("RA", "rate"),
      screen("DB", "details"),
      screen("TB", "tag"),
      screen("RB", "rate"),
    ]),
    [
      { details: "DA", tagScreens: ["TA"], rates: ["RA"] },
      { details: "DB", tagScreens: ["TB"], rates: ["RB"] },
    ],
  );
});

test("6. a Tag screen after Rate is a fatal structure error", () => {
  assert.throws(
    () =>
      groupScreens([
        screen("D1", "details"),
        screen("T1", "tag"),
        screen("R1", "rate"),
        screen("T2", "tag"),
      ]),
    /Tag screen appears after Rate screens/,
  );
});
