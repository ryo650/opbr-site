import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  approveNativeEffect,
  parseNativeEffectApprovalArguments,
} from "./approve-native-effect.mjs";
import { parseGeneratedMedals } from "./incremental.mjs";
import {
  createNativeEffectIndex,
  createUnknownNativeEffectIssue,
  loadNativeEffectCatalog,
  renderNativeEffectTypes,
  resolveNativeEffect,
  validateNativeEffectCatalog,
  validateProductionNativeEffects,
} from "./native-effects.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const productionPath = path.join(projectDir, "src/data/medals/medals.ts");
const realCatalog = await loadNativeEffectCatalog(
  path.join(importerDir, "native-effects.json"),
);
const testEffect = {
  id: "dodge-cooldown-reduction-speed",
  name: "Dodge cooldown reduction speed",
};

async function withTemporaryCatalog(run, initialCatalog = realCatalog) {
  const root = await mkdtemp(path.join(tmpdir(), "opbr-native-effects-test-"));
  const catalogPath = path.join(root, "native-effects.json");
  const generatedTypesPath = path.join(root, "native-effects.generated.ts");
  await writeFile(catalogPath, `${JSON.stringify(initialCatalog, null, 2)}\n`);
  await writeFile(generatedTypesPath, renderNativeEffectTypes(initialCatalog));
  try {
    return await run({ catalogPath, generatedTypesPath });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("approved Native Effects resolve by exact normalized display name", () => {
  const index = createNativeEffectIndex(realCatalog);
  assert.equal(
    resolveNativeEffect(index, "  SKILL 1 cooldown reduction speed ")?.id,
    "skill1-cooldown-reduction-speed",
  );
  assert.equal(resolveNativeEffect(index, "Skill 3 cooldown reduction speed"), null);
  assert.equal(
    parseNativeEffectApprovalArguments(["Skill 1 cooldown reduction speed"]).name,
    "Skill 1 cooldown reduction speed",
  );
});

test("an unknown Native Effect remains diagnostic-only", async () => {
  await withTemporaryCatalog(async ({ catalogPath }) => {
    const before = await readFile(catalogPath, "utf8");
    const nativeIssue = createUnknownNativeEffectIssue({
      medalName: "Test Medal",
      displayNameCandidate: testEffect.name,
      ocrText: "Boost the cooldown reduction speed of Dodge by 1%.",
      screenshot: "IMG_9999.PNG",
    });
    assert.equal(nativeIssue.code, "unknown-native-effect");
    assert.equal(nativeIssue.suggestedId, testEffect.id);
    assert.equal(nativeIssue.rateScreen, "IMG_9999.PNG");
    assert.equal(await readFile(catalogPath, "utf8"), before);
  });
});

test("approve-native-effect adds an entry and regenerates its type", async () => {
  assert.deepEqual(
    parseNativeEffectApprovalArguments([
      "--name",
      testEffect.name,
      "--id",
      testEffect.id,
    ]),
    testEffect,
  );
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    const result = await approveNativeEffect({
      name: testEffect.name,
      catalogPath,
      generatedTypesPath,
    });
    assert.deepEqual(result.entry, testEffect);
    assert.equal(result.changed, true);
    const catalog = await loadNativeEffectCatalog(catalogPath);
    assert.deepEqual(catalog.at(-1), testEffect);
    assert.equal(
      await readFile(generatedTypesPath, "utf8"),
      renderNativeEffectTypes(catalog),
    );
  });
});

test("reapproval is a no-op and name/ID conflicts are rejected", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    const initiallyApproved = await approveNativeEffect({
      name: "Skill 1 cooldown reduction speed",
      catalogPath,
      generatedTypesPath,
    });
    assert.equal(initiallyApproved.changed, false);
    assert.equal(initiallyApproved.entry.id, "skill1-cooldown-reduction-speed");

    await approveNativeEffect({
      name: testEffect.name,
      catalogPath,
      generatedTypesPath,
    });
    const before = await readFile(catalogPath, "utf8");
    const repeated = await approveNativeEffect({
      name: testEffect.name,
      catalogPath,
      generatedTypesPath,
    });
    assert.equal(repeated.changed, false);
    assert.equal(await readFile(catalogPath, "utf8"), before);

    await assert.rejects(
      approveNativeEffect({
        name: testEffect.name,
        id: "different-id",
        catalogPath,
        generatedTypesPath,
      }),
      /already uses ID/,
    );
    await assert.rejects(
      approveNativeEffect({
        name: "Different effect name",
        id: testEffect.id,
        catalogPath,
        generatedTypesPath,
      }),
      /already uses name/,
    );
  });
});

test("invalid Native Effect IDs and invalid catalogs are rejected", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    for (const id of ["", "Bad ID", "bad_id", "-bad-id"]) {
      await assert.rejects(
        approveNativeEffect({
          name: testEffect.name,
          id,
          catalogPath,
          generatedTypesPath,
        }),
        /Invalid Native Effect ID/,
      );
    }
  });
  assert.throws(
    () =>
      validateNativeEffectCatalog([
        realCatalog[0],
        { ...realCatalog[0], name: "Different" },
      ]),
    /Duplicate Native Effect ID/,
  );
});

test("production Native Effect IDs must be approved and unique", async () => {
  const production = parseGeneratedMedals(await readFile(productionPath, "utf8"));
  validateProductionNativeEffects(production, realCatalog);
  assert.throws(
    () =>
      validateProductionNativeEffects(
        [{ ...production[0], nativeEffects: ["not-approved"] }],
        realCatalog,
      ),
    /unknown Native Effect ID/,
  );
  assert.throws(
    () =>
      validateProductionNativeEffects(
        [
          {
            ...production[0],
            nativeEffects: [
              "skill1-cooldown-reduction-speed",
              "skill1-cooldown-reduction-speed",
            ],
          },
        ],
        realCatalog,
      ),
    /duplicate nativeEffects/,
  );
});

test("K. temporary catalog approval does not change production medal data", async () => {
  const before = await readFile(productionPath, "utf8");
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    await approveNativeEffect({
      name: testEffect.name,
      catalogPath,
      generatedTypesPath,
    });
  });
  assert.equal(await readFile(productionPath, "utf8"), before);
});
