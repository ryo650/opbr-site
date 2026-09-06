import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCharacterStatsScreenshotDraft,
  createCharacterNameMatcher,
  normalizeCharacterName,
  parseOcrInteger,
} from "./screenshot-importer.mjs";
import {
  maxLevelPreviewTemplate,
  resolveTemplateCrops,
} from "./screenshot-template.mjs";

const canonicalCharacters = {
  "red-rock-monkey-d-luffy": {
    id: "red-rock-monkey-d-luffy",
    name: "Red-Rock-Monkey-D-Luffy",
  },
  "flame-emperor-sabo": {
    id: "flame-emperor-sabo",
    name: "Flame-Emperor-Sabo",
  },
};

const fixtureOcr = {
  characterName: {
    lines: ["Red Roc", "Monkey D. Luffy"],
    observations: [
      { text: "Red Roc", x: 0.119, y: 0.528, width: 0.258, height: 0.204 },
      { text: "Monkey D. Luffy", x: 0.119, y: 0.147, width: 0.677, height: 0.306 },
    ],
  },
  level: { lines: ["Lv.100/100"], observations: [] },
  hp: { lines: ["HP", "9386"], observations: [{ text: "9386", x: 0.672, y: 0.109, width: 0.221, height: 0.527 }] },
  atk: { lines: ["2175"], observations: [{ text: "2175", x: 0.672, y: 0.251, width: 0.221, height: 0.552 }] },
  def: { lines: ["2328", "1 DEF"], observations: [
    { text: "2328", x: 0.672, y: 0.336, width: 0.222, height: 0.609 },
    { text: "1 DEF", x: 0.036, y: 0.26, width: 0.264, height: 0.72 },
  ] },
};

function fixtureDraft(overrides = {}) {
  const matchCharacterName = createCharacterNameMatcher(canonicalCharacters, {
    "red roc monkey d luffy": "red-rock-monkey-d-luffy",
  });
  return buildCharacterStatsScreenshotDraft({
    sourceImage: "IMG_4816.PNG",
    templateId: maxLevelPreviewTemplate.id,
    crops: resolveTemplateCrops(maxLevelPreviewTemplate, maxLevelPreviewTemplate.referenceSize),
    ocrByRegion: { ...fixtureOcr, ...overrides },
    matchCharacterName,
  });
}

test("relative crops reproduce the measured 2532x1170 fixture regions", () => {
  assert.deepEqual(resolveTemplateCrops(maxLevelPreviewTemplate, { width: 2532, height: 1170 }), {
    characterName: { x: 180, y: 950, width: 700, height: 180 },
    level: { x: 1390, y: 190, width: 460, height: 70 },
    hp: { x: 1390, y: 300, width: 470, height: 55 },
    atk: { x: 1390, y: 355, width: 470, height: 55 },
    def: { x: 1390, y: 410, width: 470, height: 50 },
  });
  assert.deepEqual(
    resolveTemplateCrops(maxLevelPreviewTemplate, { width: 5064, height: 2340 }).hp,
    { x: 2780, y: 600, width: 940, height: 110 },
  );
});

test("fixture extracts Monkey D. Luffy Lv.100 and the three expected stats", () => {
  const draft = fixtureDraft();
  assert.equal(draft.characterName, "Monkey D. Luffy");
  assert.equal(draft.characterId, "red-rock-monkey-d-luffy");
  assert.equal(draft.level, 100);
  assert.equal(draft.hp, 9386);
  assert.equal(draft.atk, 2175);
  assert.equal(draft.def, 2328);
  assert.equal(draft.reviewStatus, "ready");
  assert.deepEqual(draft.issues, []);
});

test("numeric OCR normalization handles separators and conservative glyph substitutions", () => {
  assert.equal(parseOcrInteger("9,386"), 9386);
  assert.equal(parseOcrInteger("2 175"), 2175);
  assert.equal(parseOcrInteger("23I8"), 2318);
  assert.equal(parseOcrInteger("ATK 2175"), null);
});

test("punctuation, apostrophes, hyphens, and whitespace normalize consistently", () => {
  assert.equal(normalizeCharacterName("  Flame—Emperor  Sabo  "), "flame emperor sabo");
  const matcher = createCharacterNameMatcher(canonicalCharacters);
  assert.equal(
    matcher({ characterName: "Flame Emperor Sabo", identityLines: ["Flame Emperor Sabo"] }).characterId,
    "flame-emperor-sabo",
  );
});

test("a level other than 100 is always needs-review", () => {
  const draft = fixtureDraft({ level: { lines: ["Lv.99/100"], observations: [] } });
  assert.equal(draft.reviewStatus, "needs-review");
  assert.ok(draft.issues.some(({ code }) => code === "level-not-100"));
});

test("unmatched names expose suggestions but are never auto-confirmed", () => {
  const matchCharacterName = createCharacterNameMatcher(canonicalCharacters);
  const result = matchCharacterName({ characterName: "Monkey D. Luffy", identityLines: ["Monkey D. Luffy"] });
  assert.equal(result.status, "unmatched");
  assert.equal(result.characterId, null);
  assert.ok(result.candidates.length > 0);
});

test("missing or ambiguous stat OCR is needs-review", () => {
  const draft = fixtureDraft({
    hp: {
      lines: ["9386", "9886"],
      observations: [
        { text: "9386", x: 0.67, y: 0.1, width: 0.2, height: 0.5 },
        { text: "9886", x: 0.72, y: 0.1, width: 0.2, height: 0.5 },
      ],
    },
  });
  assert.equal(draft.hp, null);
  assert.equal(draft.reviewStatus, "needs-review");
  assert.ok(draft.issues.some(({ code }) => code === "hp-needs-review"));
});
