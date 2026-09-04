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
  canonicalizeScoutTitle,
  extractCharacterRows,
  extractEndAt,
  extractScoutIdentity,
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
import { decimal, decimalToString } from "./decimal.mjs";

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

test("Scout ID uses the canonical title from the top of the Drop Rates screen", () => {
  const identity = extractScoutIdentity(realOcr.rateScreen);
  assert.deepEqual(identity, {
    canonicalTitle:
      "260 Million Downloads Celebration Extreme Bounty Festival 2",
    id: "260-million-downloads-celebration-extreme-bounty-festival-2",
  });
  assert.equal(identity.id.includes("show-drop-rates"), false);
  assert.equal(identity.id.includes("scout-points"), false);
  assert.equal(identity.id.includes("until"), false);
});

test("Scout title canonicalization removes only numeric step wrappers", () => {
  assert.equal(
    canonicalizeScoutTitle("4-Step [New Year] Bounty Festival Step 2"),
    "New Year Bounty Festival",
  );
  assert.equal(
    canonicalizeScoutTitle("Step-Up Scout Celebration"),
    "Step-Up Scout Celebration",
  );
});

test("Scout ID extraction stops at rate data and reports a missing title", () => {
  assert.deepEqual(
    extractScoutIdentity({
      observations: [
        { text: "Show Drop Rates", x: 0.4, y: 0.9, width: 0.2, height: 0.05 },
        { text: "7.0000000%", x: 0.59, y: 0.43, width: 0.09, height: 0.04 }
      ],
    }),
    { canonicalTitle: null, id: null },
  );
});

test("an ambiguous oversized title region stops instead of producing a giant ID", () => {
  const observations = [
    { text: "Show Drop Rates", x: 0.4, y: 0.9, width: 0.2, height: 0.05 },
    ...Array.from({ length: 5 }, (_, index) => ({
      text: `Untrusted title fragment ${index}`,
      x: 0.4,
      y: 0.82 - index * 0.02,
      width: 0.2,
      height: 0.04,
    })),
  ];
  assert.deepEqual(extractScoutIdentity({ observations }), {
    canonicalTitle: null,
    id: null,
  });
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
