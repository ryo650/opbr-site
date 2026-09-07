import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadCharacterMaster } from "./character-master.mjs";
import {
  addScoutToIndex,
  automaticStartAt,
  calculateFinalScoutRates,
  calculateScoutRates,
  characterComparisonKey,
  createDefaultScoutId,
  extractCharacterRows,
  extractEndAt,
  isCompleteFeaturedOnlyFourStarPool,
  mergeCharacterRows,
  naturalImageCompare,
  parseBfCountOverride,
  parseDateOverride,
  parseDropRates,
  renderScoutModule,
  scoutVariableName,
  selectNormalBfUnitRate,
  validateOrderedScreenshotOcr,
  validateScoutDraft,
} from "./core.mjs";
import { decimal, decimalToString, sumDecimals } from "./decimal.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const characterDir = path.resolve(importerDir, "../../src/data/characters");
const realOcr = JSON.parse(
  await readFile(new URL("./fixtures/real-ocr-patterns.json", import.meta.url), "utf8"),
);

function characterPage(rows) {
  const observations = [{
    text: "Character Drop Rates",
    x: 0.4,
    y: 0.84,
    width: 0.18,
    height: 0.04,
  }];
  for (const [index, row] of rows.entries()) {
    const rateY = 0.69 - index * 0.18;
    if (row.star) {
      observations.push({
        text: `★${row.star}`,
        x: 0.22,
        y: rateY,
        width: 0.03,
        height: 0.03,
      });
    }
    for (const [partIndex, text] of row.nameParts.entries()) {
      observations.push({
        text,
        x: 0.4,
        y: rateY + 0.03 - partIndex * 0.04,
        width: 0.12,
        height: 0.03,
      });
    }
    if (row.featured) {
      observations.push({
        text: "Featured Characters",
        x: 0.58,
        y: rateY + 0.05,
        width: 0.14,
        height: 0.03,
      });
    }
    observations.push({
      text: row.rate,
      x: 0.61,
      y: rateY,
      width: 0.09,
      height: 0.03,
    });
  }
  return { file: "characters.png", observations };
}

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

test("Scout ID uses the featured character and Tokyo end date", () => {
  assert.equal(
    createDefaultScoutId(
      "giant-warrior-hajrudin",
      "2026-09-18T13:59:59+09:00",
    ),
    "giant-warrior-hajrudin-20260918",
  );
  assert.equal(
    createDefaultScoutId(
      "battle-of-monsters-on-onigashima-kaido",
      "2026-09-09",
    ),
    "battle-of-monsters-on-onigashima-kaido-20260909",
  );
});

test("Scout ID date is calculated in Asia/Tokyo and never gains a suffix", () => {
  const id = createDefaultScoutId(
    "giant-warrior-hajrudin",
    "2026-09-18T16:00:00Z",
  );
  assert.equal(id, "giant-warrior-hajrudin-20260919");
  assert.equal(
    createDefaultScoutId("giant-warrior-hajrudin", "2026-09-18T16:00:00Z"),
    id,
  );
  assert.throws(() => createDefaultScoutId("giant-warrior-hajrudin", null));
  assert.throws(() => createDefaultScoutId("giant-warrior-hajrudin", "bad"));
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

test("IMG_4805 summary accepts aggregate rates above a visible character fragment", () => {
  const result = validateOrderedScreenshotOcr({
    startAt: "2026-09-01T14:00:00+09:00",
    periodScreen: {
      file: "IMG_4804.PNG",
      ocr: { lines: ["Scout Period", "to 09/15/2026 1:59 PM"] },
    },
    rateScreen: {
      file: realOcr.summerBfRateScreen.file,
      ocr: realOcr.summerBfRateScreen,
    },
    characterScreens: [{
      file: "IMG_4806.PNG",
      ocr: { lines: ["Featured Characters", "Giant Warrior Dorry", "0.5%"] },
    }],
  });
  assert.deepEqual(result.issues, []);
  assert.equal(decimalToString(result.rateSummary.fourStar), "7");
  assert.equal(decimalToString(result.rateSummary.threeStar), "35");
  assert.equal(decimalToString(result.rateSummary.twoStar), "58");
});

test("a character-only image is not accepted as the third summary image", () => {
  const result = validateOrderedScreenshotOcr({
    startAt: "2026-09-01T14:00:00+09:00",
    periodScreen: {
      file: "IMG_4804.PNG",
      ocr: { lines: ["Scout Period", "to 09/15/2026 1:59 PM"] },
    },
    rateScreen: {
      file: "IMG_4805.PNG",
      ocr: {
        lines: [
          "Character Drop Rates",
          "Featured Characters",
          "Giant Warrior Dorry",
          "0.5000000%",
        ],
      },
    },
    characterScreens: [{
      file: "IMG_4806.PNG",
      ocr: { lines: ["Featured Characters", "Giant Warrior Dorry", "0.5%"] },
    }],
  });
  assert.ok(
    result.issues.some((issue) =>
      issue.includes("3rd image must contain ★4, ★3, and ★2 total rates")),
  );
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
    [characterPage([
      {
        nameParts: ["Egghead", "Monkey D. Luffy"],
        rate: "1.0000000%",
        featured: true,
      },
      {
        nameParts: ["Navy HQ Captain Koby"],
        rate: "0.0123456%",
        featured: false,
      },
    ])],
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
    [characterPage([{
      nameParts: ["Monkey Lufy"],
      rate: "1.0%",
      featured: true,
    }])],
    [{ id: "monkey-d-luffy", name: "Monkey-D-Luffy", grade: "bf" }],
  );
  assert.equal(result.rows.length, 0);
  assert.equal(result.issues[0].code, "unresolved-character-name");
  assert.equal(result.issues[0].suggestions[0].id, "monkey-d-luffy");
});

test("strict character comparison ignores OCR spaces but stops on key collisions", () => {
  assert.equal(
    characterComparisonKey("Battle of Monsters on On igashima Kaido"),
    characterComparisonKey("Battle-of-Monsters-on-Onigashima-Kaido"),
  );

  const result = extractCharacterRows(
    [characterPage([{
      nameParts: ["Alpha Beta"],
      rate: "1.0%",
      featured: true,
    }])],
    [
      { id: "alpha-beta", name: "Alpha-Beta", grade: "bf" },
      { id: "alph-abeta", name: "Alph-Abeta", grade: "bf" },
    ],
  );
  assert.equal(result.rows.length, 0);
  assert.equal(result.issues[0].code, "ambiguous-character-name");
});

test("explicit reviewed character mappings resolve OCR without fuzzy matching", () => {
  const characters = [{ id: "monkey-d-luffy", name: "Monkey-D-Luffy", grade: "bf" }];
  const result = extractCharacterRows(
    [characterPage([{
      nameParts: ["Monkey Lufy"],
      rate: "1.0%",
      featured: true,
    }])],
    characters,
    { manualMappings: new Map([["monkey lufy", "monkey-d-luffy"]]) },
  );
  assert.equal(result.issues.length, 0);
  assert.equal(result.rows[0].character.id, "monkey-d-luffy");
  assert.equal(result.rows[0].manuallyResolved, true);
});

test("real Character Drop Rates boxes reconstruct rows and exclude the left Scout UI", async () => {
  const master = await loadCharacterMaster(characterDir);
  const result = extractCharacterRows(
    [realOcr.characterScreen],
    master.characters,
  );
  assert.deepEqual(result.issues, []);
  assert.deepEqual(
    result.rows.map(({ character, featured, rate, sourceText }) => ({
      id: character.id,
      featured,
      rate: decimalToString(rate),
      sourceText,
    })),
    [
      {
        id: "the-wings-zoro-sanji",
        featured: true,
        rate: "0.2",
        sourceText: "The Wings Zoro & Sanji",
      },
      {
        id: "unexpected-collaboration-kaku",
        featured: false,
        rate: "0.0195804",
        sourceText: "Unexpected Collaboration Kaku",
      },
    ],
  );
  assert.equal(
    result.rows.some(({ sourceText }) =>
      /Extreme Bounty Festival|day\(s\) left|Get Points/.test(sourceText)),
    false,
  );

  const bfSelection = selectNormalBfUnitRate(result.rows);
  assert.deepEqual(bfSelection.issues, []);
  assert.equal(decimalToString(bfSelection.rate), "0.0195804");
  assert.equal(bfSelection.rows[0].character.id, "unexpected-collaboration-kaku");
});

test("the third-image character fragment is parsed and deduped with the fourth image", () => {
  const character = {
    id: "legendary-gladiator-kyros",
    name: "Legendary-Gladiator-Kyros",
    grade: "bf",
  };
  const summaryFragment = {
    file: "IMG_4805.PNG",
    dimensions: { width: 2532, height: 1170 },
    optionalFragment: true,
    observations: [
      { text: "Character Drop Rates", x: 0.3997, y: 0.2673, width: 0.1802, height: 0.0378 },
      { text: "Featured Characters", x: 0.5741, y: 0.18, width: 0.1541, height: 0.0283 },
      { text: "Legendary Gladiator", x: 0.3823, y: 0.17, width: 0.125, height: 0.03 },
      { text: "Kyros", x: 0.4258, y: 0.13, width: 0.0366, height: 0.03 },
      { text: "0.5000000%", x: 0.609, y: 0.11, width: 0.0843, height: 0.03 },
    ],
  };
  const fourthImage = {
    ...characterPage([{
      nameParts: ["Legendary Gladiator", "Kyros"],
      rate: "0.5000000%",
      featured: true,
    }]),
    file: "IMG_4806.PNG",
    dimensions: { width: 2532, height: 1170 },
  };
  const extracted = extractCharacterRows(
    [summaryFragment, fourthImage],
    [character],
  );
  assert.deepEqual(extracted.issues, []);
  assert.equal(extracted.rows.length, 2);
  assert.equal(extracted.rows[0].sourceFile, "IMG_4805.PNG");

  const merged = mergeCharacterRows(extracted.rows);
  assert.deepEqual(merged.issues, []);
  assert.equal(merged.rows.length, 1);
  assert.equal(merged.rows[0].character.id, character.id);
  assert.equal(merged.rows[0].featured, true);
  assert.equal(decimalToString(merged.rows[0].rate), "0.5");
});

test("real continuation screenshots inherit table geometry and finalize all complete rows", async () => {
  const master = await loadCharacterMaster(characterDir);
  const extracted = extractCharacterRows(
    realOcr.continuationCharacterScreens,
    master.characters,
  );
  assert.deepEqual(
    extracted.issues.filter(({ featured }) => featured !== false),
    [],
  );

  const merged = mergeCharacterRows(extracted.rows);
  assert.deepEqual(merged.issues, []);
  assert.deepEqual(
    merged.rows.map(({ character, featured, rate }) => ({
      id: character.id,
      featured,
      rate: decimalToString(rate),
    })),
    [
      {
        id: "battle-of-monsters-on-onigashima-kaido",
        featured: true,
        rate: "0.2",
      },
      { id: "legendary-gladiator-kyros", featured: true, rate: "0.5" },
      { id: "sakura-kingdom-king-dalton", featured: true, rate: "0.5" },
      { id: "clear-clear-fruit-shiryu", featured: true, rate: "0.5" },
      {
        id: "unexpected-collaboration-kaku",
        featured: false,
        rate: "0.0092856",
      },
      {
        id: "unexpected-collaboration-rob-lucci",
        featured: false,
        rate: "0.0092856",
      },
    ],
  );

  const shiryuRows = extracted.rows.filter(
    ({ character }) => character.id === "clear-clear-fruit-shiryu",
  );
  assert.equal(shiryuRows.length, 1);
  assert.equal(shiryuRows[0].sourceFile, "IMG_4792 2.PNG");

  const pickups = merged.rows.filter(({ featured }) => featured);
  assert.deepEqual(
    pickups.map(({ character }) => character.id),
    [
      "battle-of-monsters-on-onigashima-kaido",
      "legendary-gladiator-kyros",
      "sakura-kingdom-king-dalton",
      "clear-clear-fruit-shiryu",
    ],
  );
  assert.equal(
    decimalToString(sumDecimals(pickups.map(({ rate }) => rate))),
    "1.7",
  );

  const bfSelection = selectNormalBfUnitRate(merged.rows);
  assert.deepEqual(bfSelection.issues, []);
  assert.equal(decimalToString(bfSelection.rate), "0.0092856");
  assert.deepEqual(
    bfSelection.rows.map(({ character }) => character.id),
    [
      "unexpected-collaboration-kaku",
      "unexpected-collaboration-rob-lucci",
    ],
  );
});

test("continuation screenshots stop when inherited table geometry is unsafe", async () => {
  const master = await loadCharacterMaster(characterDir);
  const pages = structuredClone(realOcr.continuationCharacterScreens);
  pages[1].dimensions = { width: 1170, height: 2532 };
  const extracted = extractCharacterRows(pages, master.characters);
  assert.ok(
    extracted.issues.some(
      ({ code }) => code === "incompatible-character-table-geometry",
    ),
  );
  assert.equal(
    extracted.rows.some(
      ({ character }) => character.id === "clear-clear-fruit-shiryu",
    ),
    false,
  );
});

test("duplicate character screenshots dedupe exact rows and cross-check conflicts", () => {
  const character = { id: "bf-one", name: "BF-One", grade: "bf" };
  const duplicate = mergeCharacterRows([
    { character, featured: true, rate: decimal("0.5"), sourceFile: "one.png" },
    { character, featured: true, rate: decimal("0.5"), sourceFile: "two.png" },
  ]);
  assert.equal(duplicate.rows.length, 1);
  assert.deepEqual(duplicate.issues, []);

  const merged = mergeCharacterRows([
    { character, featured: false, rate: decimal("0.01"), sourceFile: "one.png" },
    { character, featured: false, rate: decimal("0.02"), sourceFile: "two.png" },
  ]);
  assert.equal(merged.issues[0].code, "conflicting-character-rate");

  const featuredConflict = mergeCharacterRows([
    { character, featured: true, rate: decimal("0.5"), sourceFile: "one.png" },
    { character, featured: false, rate: decimal("0.5"), sourceFile: "two.png" },
  ]);
  assert.equal(
    featuredConflict.issues[0].code,
    "conflicting-character-featured",
  );
});

test("multiple non-featured BF rows must have the same unit rate", () => {
  const result = selectNormalBfUnitRate([
    {
      character: { id: "bf-one", grade: "bf" },
      featured: false,
      rate: decimal("0.0092856"),
      sourceFile: "one.png",
    },
    {
      character: { id: "bf-two", grade: "bf" },
      featured: false,
      rate: decimal("0.01"),
      sourceFile: "two.png",
    },
  ]);
  assert.equal(result.rate, null);
  assert.equal(result.issues[0].code, "normal-bf-rate-mismatch");
});

test("a completed featured-only ★4 pool succeeds without a normal BF row", () => {
  const characters = [
    { id: "featured-one", name: "Featured-One", grade: "bf" },
    { id: "three-star-one", name: "Three-Star-One", grade: "star-3" },
  ];
  const extraction = extractCharacterRows(
    [characterPage([
      {
        nameParts: ["Featured One"],
        featured: true,
        rate: "5.0000000%",
        star: 4,
      },
      {
        nameParts: ["Three Star One"],
        featured: false,
        rate: "2.5000000%",
        star: 3,
      },
    ])],
    characters,
  );
  const pickups = extraction.rows
    .filter(({ featured }) => featured)
    .map(({ character, rate }) => ({ characterId: character.id, rate }));
  const featuredOnlyFourStarPool = isCompleteFeaturedOnlyFourStarPool({
    totalFourStarRate: decimal("5"),
    pickups,
    extractionIssues: extraction.issues,
    fourStarSectionComplete: extraction.fourStarSectionComplete,
    normalBfRowCount: 0,
  });

  assert.equal(extraction.fourStarSectionComplete, true);
  assert.equal(featuredOnlyFourStarPool, true);
  assert.equal(selectNormalBfUnitRate(extraction.rows).rate, null);

  const rateCalculation = calculateScoutRates({
    totalFourStarRate: decimal("5"),
    threeStarRate: decimal("35"),
    twoStarRate: decimal("60"),
    pickups,
    bfUnitRate: null,
    characters,
    featuredOnlyFourStarPool,
  });
  const finalRates = calculateFinalScoutRates({
    totalFourStarRate: decimal("5"),
    threeStarRate: decimal("35"),
    twoStarRate: decimal("60"),
    pickups,
    rateCalculation,
  });

  assert.equal(rateCalculation.bfCount, 0);
  assert.equal(rateCalculation.bfCountSource, "complete featured ★4 pool");
  assert.equal(decimalToString(finalRates.pickupTotal), "5");
  assert.equal(decimalToString(finalRates.bf), "0");
  assert.equal(decimalToString(finalRates.star4), "0");
  assert.equal(decimalToString(finalRates.total), "100");
  assert.deepEqual(validateScoutDraft({
    name: "Featured Only Scout",
    startAt: "2026-09-01T14:00:00+09:00",
    endAt: "2026-09-15T13:59:59+09:00",
    featuredCharacter: characters[0],
    pickups,
    totalFourStarRate: decimal("5"),
    threeStarRate: decimal("35"),
    twoStarRate: decimal("60"),
    bfUnitRate: null,
    featuredOnlyFourStarPool,
    rateCalculation,
    finalRates,
    characterIssues: [],
  }), []);
});

test("a missing BF row is not treated as zero without complete and resolved ★4 evidence", () => {
  const complete = {
    totalFourStarRate: decimal("5"),
    pickups: [{ characterId: "featured-one", rate: decimal("5") }],
    extractionIssues: [],
    fourStarSectionComplete: true,
    normalBfRowCount: 0,
  };
  assert.equal(
    isCompleteFeaturedOnlyFourStarPool({
      ...complete,
      fourStarSectionComplete: false,
    }),
    false,
  );
  assert.equal(
    isCompleteFeaturedOnlyFourStarPool({
      ...complete,
      extractionIssues: [{
        code: "unresolved-character-name",
        featured: true,
      }],
    }),
    false,
  );
  assert.equal(
    isCompleteFeaturedOnlyFourStarPool({
      ...complete,
      pickups: [{ characterId: "featured-one", rate: decimal("4.5") }],
    }),
    false,
  );
  assert.equal(
    isCompleteFeaturedOnlyFourStarPool({
      ...complete,
      normalBfRowCount: 1,
    }),
    false,
  );
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
  assert.equal(result.bfCountSource, "character master");
  assert.equal(decimalToString(result.bfTotal), "0.0246912");
  assert.equal(decimalToString(result.star4), "5.9753088");
  assert.equal(decimalToString(result.finalTotal), "100");
});

test("BF count override replaces the character-master count and validates input", () => {
  assert.equal(parseBfCountOverride(undefined), null);
  assert.equal(parseBfCountOverride("147"), 147);
  for (const invalid of ["0", "-1", "1.5", "abc", "9007199254740992"]) {
    assert.throws(() => parseBfCountOverride(invalid), /positive/);
  }

  const result = calculateScoutRates({
    totalFourStarRate: decimal("7"),
    threeStarRate: decimal("35"),
    twoStarRate: decimal("58"),
    pickups: [{ characterId: "pickup-bf", rate: decimal("0.2") }],
    bfUnitRate: decimal("0.0195804"),
    characters: [
      { id: "pickup-bf", grade: "bf" },
      { id: "normal-bf", grade: "bf" },
    ],
    bfCountOverride: 147,
  });
  assert.equal(result.bfCount, 147);
  assert.equal(result.bfCountSource, "override");
  assert.equal(decimalToString(result.bfTotal), "2.8783188");
});

test("final rates round BF, derive star-4 from the rounded BF, and total 100", () => {
  const characters = [
    { id: "pickup-ex", grade: "ex" },
    ...Array.from({ length: 147 }, (_, index) => ({
      id: `normal-bf-${index}`,
      grade: "bf",
    })),
  ];
  const pickups = [{ characterId: "pickup-ex", rate: decimal("0.2000000") }];
  const rateCalculation = calculateScoutRates({
    totalFourStarRate: decimal("7.0000000"),
    threeStarRate: decimal("35.0000000"),
    twoStarRate: decimal("58.0000000"),
    pickups,
    bfUnitRate: decimal("0.0195804"),
    characters,
  });
  const finalRates = calculateFinalScoutRates({
    totalFourStarRate: decimal("7.0000000"),
    threeStarRate: decimal("35.0000000"),
    twoStarRate: decimal("58.0000000"),
    pickups,
    rateCalculation,
  });

  assert.equal(decimalToString(rateCalculation.bfTotal), "2.8783188");
  assert.equal(decimalToString(rateCalculation.star4), "3.9216812");
  assert.equal(decimalToString(pickups[0].rate), "0.2");
  assert.equal(decimalToString(finalRates.bf), "2.88");
  assert.equal(decimalToString(finalRates.star4), "3.92");
  assert.equal(decimalToString(finalRates.star3), "35");
  assert.equal(decimalToString(finalRates.star2), "58");
  assert.equal(decimalToString(finalRates.total), "100");

  const issues = validateScoutDraft({
    name: "Sample Scout",
    startAt: "2026-09-01T14:00:00+09:00",
    endAt: "2026-09-15T13:59:59+09:00",
    featuredCharacter: characters[0],
    pickups,
    totalFourStarRate: decimal("7"),
    threeStarRate: decimal("35"),
    twoStarRate: decimal("58"),
    bfUnitRate: decimal("0.0195804"),
    rateCalculation,
    finalRates: { ...finalRates, total: decimal("99.99") },
    characterIssues: [],
  });
  assert.ok(issues.includes("Final output rates total 99.99 instead of 100"));
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
    bannerPublicPath: "/scouts/sample-scout.webp",
    startAt: "2026-09-01T14:00:00+09:00",
    endAt: "2026-09-15T13:59:59+09:00",
    featuredCharacter: { id: "pickup-bf" },
    pickups: [{ characterId: "pickup-bf", rate: decimal("1") }],
    threeStarRate: decimal("35"),
    twoStarRate: decimal("58"),
    rateCalculation: { bfTotal: decimal("1.49999"), star4: decimal("4.50001") },
    finalRates: { bf: decimal("1.5"), star4: decimal("4.5") },
  };
  const moduleSource = renderScoutModule(draft);
  assert.match(moduleSource, /export const scoutSampleScout: ScoutBanner/);
  assert.match(moduleSource, /bannerImg: "\/scouts\/sample-scout\.webp"/);
  assert.match(moduleSource, /bf: 1\.5,/);
  assert.match(moduleSource, /"star-4": 4\.5,/);
  assert.doesNotMatch(moduleSource, /1\.49999|4\.50001/);
  assert.doesNotMatch(moduleSource, /^\+/m);
  const index = addScoutToIndex(
    'import { old } from "./old";\n\nexport const scouts = [\n    old\n]\n',
    variableName,
    draft.id,
  );
  assert.match(index, /import \{ scoutSampleScout \} from "\.\/sample-scout";/);
  assert.match(index, /export const scouts = \[\n    scoutSampleScout,\n    old/);
});
