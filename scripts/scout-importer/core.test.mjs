import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadCharacterMaster } from "./character-master.mjs";
import {
  addScoutToIndex,
  automaticStartAt,
  calculateScoutRates,
  extractCharacterRows,
  extractEndAt,
  mergeCharacterRows,
  naturalImageCompare,
  parseDateOverride,
  parseDropRates,
  renderScoutModule,
  scoutVariableName,
  validateOrderedScreenshotOcr,
} from "./core.mjs";
import { decimal, decimalToString } from "./decimal.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const characterDir = path.resolve(importerDir, "../../src/data/characters");

test("automaticStartAt uses the previous 14:00 JST before cutoff", () => {
  assert.equal(
    automaticStartAt(new Date("2026-09-01T04:30:00Z")),
    "2026-08-31T14:00:00+09:00",
  );
  assert.equal(
    automaticStartAt(new Date("2026-09-01T06:30:00Z")),
    "2026-09-01T14:00:00+09:00",
  );
});

test("date overrides default to JST and offset dates are converted", () => {
  assert.equal(
    parseDateOverride("2026-08-28 14:00"),
    "2026-08-28T14:00:00+09:00",
  );
  assert.equal(
    parseDateOverride("2026-08-28T05:00:00Z"),
    "2026-08-28T14:00:00+09:00",
  );
  assert.equal(
    parseDateOverride("2026-09-15 13:59", "endAt", 59),
    "2026-09-15T13:59:59+09:00",
  );
});

test("endAt is extracted from common game period formats", () => {
  const start = "2026-09-01T14:00:00+09:00";
  assert.equal(
    extractEndAt(["Scout Period", "to 09/15/2026 1:59 PM (JST)"], start),
    "2026-09-15T13:59:59+09:00",
  );
  assert.equal(
    extractEndAt(["to", "2026/09/15 13:59"], start),
    "2026-09-15T13:59:59+09:00",
  );
});

test("Drop Rates summary keeps seven-decimal OCR precision", () => {
  const rates = parseDropRates([
    "★4 Characters",
    "7.0000000%",
    "★3 Characters 35.0000000%",
    "★2 Characters",
    "58.0000000%",
  ]);
  assert.equal(decimalToString(rates.fourStar), "7");
  assert.equal(decimalToString(rates.threeStar), "35");
  assert.equal(decimalToString(rates.twoStar), "58");
});

test("IMG filenames use numeric natural order without role-based names", () => {
  assert.deepEqual(
    ["IMG_100.JPG", "IMG_20.PNG", "IMG_3.PNG"].sort(naturalImageCompare),
    ["IMG_3.PNG", "IMG_20.PNG", "IMG_100.JPG"],
  );
});

test("ordered OCR slots accept period, total rates, then character rates", () => {
  const result = validateOrderedScreenshotOcr({
    startAt: "2026-09-01T14:00:00+09:00",
    periodScreen: {
      file: "IMG_1001.PNG",
      ocr: { lines: ["Scout Period", "to 09/15/2026 1:59 PM"] },
    },
    rateScreen: {
      file: "IMG_1002.PNG",
      ocr: { lines: ["4 Star 7%", "3 Star 35%", "2 Star 58%"] },
    },
    characterScreens: [{
      file: "IMG_1003.PNG",
      ocr: {
        lines: [
          "Featured Characters",
          "Unexpected Collaboration Kaku",
          "1%",
          "4 Star Characters",
          "Navy HQ Captain Koby",
          "0.01%",
        ],
      },
    }],
  });
  assert.deepEqual(result.issues, []);
  assert.equal(result.endAt, "2026-09-15T13:59:59+09:00");
  assert.equal(decimalToString(result.rateSummary.fourStar), "7");
});

test("ordered OCR slots stop when period and total-rate images are swapped", () => {
  const result = validateOrderedScreenshotOcr({
    startAt: "2026-09-01T14:00:00+09:00",
    periodScreen: {
      file: "IMG_1001.PNG",
      ocr: { lines: ["4 Star 7%", "3 Star 35%", "2 Star 58%"] },
    },
    rateScreen: {
      file: "IMG_1002.PNG",
      ocr: { lines: ["Scout Period", "to 09/15/2026 1:59 PM"] },
    },
    characterScreens: [{
      file: "IMG_1003.PNG",
      ocr: { lines: ["Featured Characters", "Kaku", "1%"] },
    }],
  });
  assert.ok(result.issues.some((issue) => issue.includes("2nd image")));
  assert.ok(result.issues.some((issue) => issue.includes("3rd image")));
});

test("reviewed endAt override still requires a visible to marker in slot 2", () => {
  const base = {
    startAt: "2026-09-01T14:00:00+09:00",
    endAtOverride: "2026-09-15 13:59",
    rateScreen: {
      file: "IMG_1002.PNG",
      ocr: { lines: ["4 Star 7%", "3 Star 35%", "2 Star 58%"] },
    },
    characterScreens: [{
      file: "IMG_1003.PNG",
      ocr: { lines: ["Featured Characters", "Kaku", "1%"] },
    }],
  };
  const reviewed = validateOrderedScreenshotOcr({
    ...base,
    periodScreen: {
      file: "IMG_1001.PNG",
      ocr: { lines: ["Scout Period", "to O9/15/2026 1:59 PM"] },
    },
  });
  assert.deepEqual(reviewed.issues, []);

  const wrongImage = validateOrderedScreenshotOcr({
    ...base,
    periodScreen: {
      file: "IMG_1001.PNG",
      ocr: { lines: ["Scout menu with no period"] },
    },
  });
  assert.ok(wrongImage.issues.some((issue) => issue.includes("2nd image")));
});

test("character rows use exact master names and section headings", () => {
  const characters = [
    { id: "egghead-monkey-d-luffy", name: "Egghead-Monkey-D-Luffy", grade: "bf" },
    { id: "navy-hq-captain-koby", name: "Navy-Hq-Captain-Koby", grade: "bf" },
  ];
  const result = extractCharacterRows(
    [{
      file: "characters-01.png",
      lines: [
        "Featured Characters",
        "Egghead",
        "Monkey D. Luffy",
        "1.0000000%",
        "★4 Characters",
        "Navy HQ Captain Koby",
        "0.0123456%",
      ],
    }],
    characters,
  );
  assert.deepEqual(result.issues, []);
  assert.deepEqual(
    result.rows.map(({ character, featured, rate }) => ({
      id: character.id,
      featured,
      rate: decimalToString(rate),
    })),
    [
      { id: "egghead-monkey-d-luffy", featured: true, rate: "1" },
      { id: "navy-hq-captain-koby", featured: false, rate: "0.0123456" },
    ],
  );
});

test("ambiguous OCR is reported and never fuzzily selected", () => {
  const result = extractCharacterRows(
    [{ file: "characters.png", lines: ["Featured Characters", "Monkey Lufy", "1.0%"] }],
    [{ id: "monkey-d-luffy", name: "Monkey-D-Luffy", grade: "bf" }],
  );
  assert.equal(result.rows.length, 0);
  assert.equal(result.issues[0].code, "unresolved-character-name");
  assert.equal(result.issues[0].suggestions[0].id, "monkey-d-luffy");
});

test("explicit reviewed character mappings resolve OCR without fuzzy matching", () => {
  const characters = [{ id: "monkey-d-luffy", name: "Monkey-D-Luffy", grade: "bf" }];
  const result = extractCharacterRows(
    [{ file: "characters.png", lines: ["Featured Characters", "Monkey Lufy", "1.0%"] }],
    characters,
    { manualMappings: new Map([["monkey lufy", "monkey-d-luffy"]]) },
  );
  assert.equal(result.issues.length, 0);
  assert.equal(result.rows[0].character.id, "monkey-d-luffy");
  assert.equal(result.rows[0].manuallyResolved, true);
});

test("duplicate character screenshots cross-check rates", () => {
  const character = { id: "bf-one", name: "BF-One", grade: "bf" };
  const merged = mergeCharacterRows([
    { character, featured: false, rate: decimal("0.01"), sourceFile: "one.png" },
    { character, featured: false, rate: decimal("0.02"), sourceFile: "two.png" },
  ]);
  assert.equal(merged.issues[0].code, "conflicting-character-rate");
});

test("BF and star-4 calculations are exact fixed-point operations", () => {
  const characters = [
    { id: "pickup-bf", grade: "bf" },
    { id: "normal-bf-1", grade: "bf" },
    { id: "normal-bf-2", grade: "bf" },
    { id: "normal-star4", grade: "star-4" },
  ];
  const result = calculateScoutRates({
    totalFourStarRate: decimal("7.0000000"),
    threeStarRate: decimal("35.0000000"),
    twoStarRate: decimal("58.0000000"),
    pickups: [{ characterId: "pickup-bf", rate: decimal("1.0000000") }],
    bfUnitRate: decimal("0.0123456"),
    characters,
  });
  assert.equal(result.bfCount, 2);
  assert.equal(decimalToString(result.bfTotal), "0.0246912");
  assert.equal(decimalToString(result.star4), "5.9753088");
  assert.equal(decimalToString(result.finalTotal), "100");
});

test("character master is parsed from the repository TypeScript", async () => {
  const master = await loadCharacterMaster(characterDir);
  assert.ok(master.characters.length > 300);
  assert.ok(master.characters.filter(({ grade }) => grade === "bf").length > 100);
  assert.equal(master.byId.get("unexpected-collaboration-kaku").grade, "bf");
});

test("generated module and index follow existing ScoutBanner registration", () => {
  const variableName = scoutVariableName("sample-scout");
  const draft = {
    id: "sample-scout",
    variableName,
    name: "Sample Scout",
    bannerPublicPath: "/scouts/bf/sample-scout.webp",
    startAt: "2026-09-01T14:00:00+09:00",
    endAt: "2026-09-15T13:59:59+09:00",
    featuredCharacter: { id: "pickup-bf" },
    pickups: [{ characterId: "pickup-bf", rate: decimal("1") }],
    threeStarRate: decimal("35"),
    twoStarRate: decimal("58"),
    rateCalculation: { bfTotal: decimal("1.5"), star4: decimal("4.5") },
  };
  const moduleSource = renderScoutModule(draft);
  assert.match(moduleSource, /export const scoutSampleScout: ScoutBanner/);
  assert.doesNotMatch(moduleSource, /^\+/m);
  const index = addScoutToIndex(
    'import { old } from "./old";\n\nexport const scouts = [\n    old\n]\n',
    variableName,
    draft.id,
  );
  assert.match(index, /import \{ scoutSampleScout \} from "\.\/sample-scout";/);
  assert.match(index, /export const scouts = \[\n    scoutSampleScout,\n    old/);
});
