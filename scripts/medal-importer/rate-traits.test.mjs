import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { approveNativeEffect } from "./approve-native-effect.mjs";
import {
  createNativeEffectIndex,
  loadNativeEffectCatalog,
  renderNativeEffectTypes,
} from "./native-effects.mjs";
import {
  analyzeRateTraits,
  isRateTraitRetryResolved,
  reconstructRateTraitLines,
} from "./rate-traits.mjs";
import {
  createStatusEffectIndex,
  loadStatusEffectCatalog,
} from "./status-effects.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const statusCatalog = await loadStatusEffectCatalog(
  path.join(importerDir, "status-effects.json"),
);
const nativeCatalog = await loadNativeEffectCatalog(
  path.join(importerDir, "native-effects.json"),
);

function parse(lines, catalog = nativeCatalog) {
  return analyzeRateTraits(
    { lines },
    "Test Medal",
    "IMG_9999.PNG",
    {
      statusEffectsByName: createStatusEffectIndex(statusCatalog),
      nativeEffectsByName: createNativeEffectIndex(catalog),
    },
  );
}

test("A. ATK / DEF / HP / CRIT remain nativeTraits", () => {
  const result = parse([
    "Increase ATK by 14%.",
    "Increase DEF by 14%.",
    "Increase HP by 14%.",
    "Increase CRIT by 14%.",
  ]);
  assert.deepEqual([...result.nativeTraits], ["atk", "def", "hp", "crit"]);
  assert.deepEqual([...result.nativeEffects], []);
  assert.deepEqual(result.issues, []);
});

test("B/C. approved Skill 1 and Skill 2 cooldown effects become nativeEffects", () => {
  const result = parse([
    "Boost the cooldown reduction speed of Skill 1 by 1%.",
    "Boost the cooldown reduction speed of Skill 2 by 1%.",
  ]);
  assert.deepEqual([...result.nativeEffects], [
    "skill1-cooldown-reduction-speed",
    "skill2-cooldown-reduction-speed",
  ]);
  assert.deepEqual([...result.nativeTraits], []);
  assert.deepEqual(result.issues, []);
});

test("D. conditions and values are discarded from an approved effect", () => {
  const result = parse([
    'When the equipped character is character type "Straw Hat Pirates": Boost the cooldown reduction speed of Skill 2 by 1%.',
  ]);
  assert.deepEqual([...result.nativeEffects], [
    "skill2-cooldown-reduction-speed",
  ]);
  assert.deepEqual(result.issues, []);
});

test("E. repeated values and conditions deduplicate by approved ID", () => {
  const result = parse([
    "Boost the cooldown reduction speed of Skill 1 by 1%.",
    'When character type is "Runner": Boost the cooldown reduction speed of Skill 1 by 2%.',
    "Boost the cooldown reduction speed of Skill 1 by 3%.",
  ]);
  assert.deepEqual([...result.nativeEffects], [
    "skill1-cooldown-reduction-speed",
  ]);
});

test("F. an unapproved cooldown target becomes unknown-native-effect", () => {
  const result = parse([
    "Boost the cooldown reduction speed of Dodge by 1%.",
  ]);
  assert.deepEqual([...result.nativeEffects], []);
  assert.equal(result.issues[0].code, "unknown-native-effect");
  assert.equal(result.issues[0].displayNameCandidate, "Dodge cooldown reduction speed");
  assert.equal(result.issues[0].suggestedId, "dodge-cooldown-reduction-speed");
});

test("G. human approval makes the same effect parse on the next run", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "opbr-rate-traits-test-"));
  const catalogPath = path.join(root, "native-effects.json");
  const generatedTypesPath = path.join(root, "native-effects.generated.ts");
  await writeFile(catalogPath, `${JSON.stringify(nativeCatalog, null, 2)}\n`);
  await writeFile(generatedTypesPath, renderNativeEffectTypes(nativeCatalog));
  try {
    await approveNativeEffect({
      name: "Dodge cooldown reduction speed",
      catalogPath,
      generatedTypesPath,
    });
    const approved = await loadNativeEffectCatalog(catalogPath);
    const result = parse(
      ["Boost the cooldown reduction speed of Dodge by 1%."],
      approved,
    );
    assert.deepEqual([...result.nativeEffects], [
      "dodge-cooldown-reduction-speed",
    ]);
    assert.deepEqual(result.issues, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("H. Status reductions remain separate from nativeEffects", () => {
  const result = parse([
    "Reduces duration of Stun by 36%.",
    "Boost the cooldown reduction speed of Skill 1 by 1%.",
  ]);
  assert.deepEqual([...result.statusReductions], ["stun"]);
  assert.deepEqual([...result.nativeEffects], [
    "skill1-cooldown-reduction-speed",
  ]);
  assert.deepEqual(result.issues, []);
});

test("I. stat increases remain nativeTraits only", () => {
  const result = parse([
    "Increase ATK by 14%.",
    "Increase DEF by 14%.",
    "Increase HP by 14%.",
    "Increase CRIT by 14%.",
  ]);
  assert.deepEqual([...result.nativeTraits], ["atk", "def", "hp", "crit"]);
  assert.deepEqual([...result.nativeEffects], []);
  assert.deepEqual([...result.statusReductions], []);
});

test("an approved nativeEffect can be the only parsed trait kind", () => {
  const result = parse([
    "Boost the cooldown reduction speed of Skill 2 by 1%.",
  ]);
  assert.equal(result.traitKinds.size, 1);
  assert.deepEqual([...result.nativeTraits], []);
  assert.deepEqual([...result.statusReductions], []);
  assert.deepEqual(result.issues, []);
});

test("J. effect-like percentage text is not silently discarded", () => {
  const raw = "Amplifies Treasure Gauge charge efficiency by 5%.";
  const result = parse([raw]);
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].code, "unknown-native-effect");
  assert.equal(result.issues[0].ocrText, raw);
  assert.equal(result.issues[0].rateScreen, "IMG_9999.PNG");
});

test("field retry cannot resolve an unknown effect by merely omitting it", () => {
  const initial = parse([
    "Increase ATK by 14%.",
    "Boost the cooldown reduction speed of Dodge by 1%.",
  ]);
  const incompleteRetry = parse(["Increase ATK by 14%."]);
  assert.equal(isRateTraitRetryResolved(initial, incompleteRetry), false);
});

test("condition-only and probability lines do not become false effects", () => {
  const result = parse([
    "The drop rates are rounded off to the nearest thousandth.",
    "The total number of the listed drop rates may not add up to 100%.",
    'When the equipped character is character type "Straw Hat Pirates":',
    "Increase ATK by 14%.",
    "4.00%",
  ]);
  assert.deepEqual([...result.nativeTraits], ["atk"]);
  assert.deepEqual(result.issues, []);
});

test("a split conditional stat Trait is reconstructed across its probability", () => {
  const lines = [
    'character type "Zoan": Increase',
    "1.10%",
    "ATK by 18%.",
  ];
  assert.deepEqual(reconstructRateTraitLines(lines), [
    'character type "Zoan": Increase ATK by 18%.',
    "1.10%",
  ]);
  const result = parse(lines);
  assert.deepEqual([...result.nativeTraits], ["atk"]);
  assert.deepEqual(result.issues, []);
});

test("split Skill cooldown text resolves to the existing approved Effect", () => {
  const lines = [
    'type "Straw Hat Pirates": Boost the cooldown',
    "1.12%",
    "reduction speed of Skill 2 by 1%.",
  ];
  const result = parse(lines);
  assert.deepEqual([...result.nativeEffects], [
    "skill2-cooldown-reduction-speed",
  ]);
  assert.deepEqual(result.issues, []);
});

test("approved damage dealt text split by a probability line is safely reconstructed", () => {
  const lines = [
    'character type "Navy": Increase',
    "1.10%",
    "damage dealt by 3%.",
  ];
  const result = parse(lines);
  assert.deepEqual([...result.nativeEffects], ["damage-dealt"]);
  assert.deepEqual(result.issues, []);
});

test("approved damage dealt text may split after damage within one Rate entry", () => {
  const lines = [
    'When attacking a character type "Logia" enemy: Increase damage',
    "2.70%",
    "dealt by 3%.",
  ];
  const result = parse(lines);
  assert.deepEqual([...result.nativeEffects], ["damage-dealt"]);
  assert.deepEqual(result.issues, []);
});

test("approved Skill cooldown text split after Boost the is safely reconstructed", () => {
  const lines = [
    'type "Revolutionary Army": Boost the',
    "1.12%",
    "cooldown reduction speed of Skill 2 by 1%.",
  ];
  const result = parse(lines);
  assert.deepEqual([...result.nativeEffects], [
    "skill2-cooldown-reduction-speed",
  ]);
  assert.deepEqual(result.issues, []);
});

test("nearby lines are not joined unless the result is an approved Native Effect", () => {
  const result = parse([
    "Increase",
    "1.00%",
    "Treasure Gauge charge efficiency by 5%.",
  ]);
  assert.deepEqual([...result.nativeEffects], []);
  assert.ok(result.issues.length > 0);
});

test("approved damage dealt and received Effects parse without values or conditions", () => {
  const result = parse([
    'character type "The Grand Line": Increase damage dealt by 5%.',
    'character type "The Grand Line": Reduce damage received by 3%.',
  ]);
  assert.deepEqual([...result.nativeEffects], [
    "damage-dealt",
    "damage-received",
  ]);
  assert.deepEqual(result.issues, []);
});

test("retry may replace an accented Increase line only when the same stat is parsed", () => {
  const initial = parse(["*** Incréase ATK by 12%."]);
  const correctedRetry = parse(["Increase ATK by 12%."]);
  assert.equal(isRateTraitRetryResolved(initial, correctedRetry), true);
  assert.equal(
    isRateTraitRetryResolved(initial, parse(["Increase DEF by 12%."])),
    false,
  );
});

test("field retry may restore one dropped character in a native Trait at the same value", () => {
  const initial = parse([
    "Increase ATK by 14%.",
    "Increase AT by 12%.",
  ]);
  const correctedRetry = parse([
    "Increase ATK by 14%.",
    "Increase ATK by 12%.",
  ]);

  assert.equal(isRateTraitRetryResolved(initial, correctedRetry), true);
  assert.equal(
    isRateTraitRetryResolved(
      initial,
      parse(["Increase ATK by 14%.", "Increase DEF by 12%."]),
    ),
    false,
  );
  assert.equal(
    isRateTraitRetryResolved(initial, parse(["Increase ATK by 14%."])),
    false,
  );
});
