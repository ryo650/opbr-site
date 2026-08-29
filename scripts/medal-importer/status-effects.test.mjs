import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  approveStatusEffect,
  parseApprovalArguments,
} from "./approve-status.mjs";
import { parseGeneratedMedals } from "./incremental.mjs";
import {
  createUnknownStatusEffectIssue,
  createStatusEffectIndex,
  loadStatusEffectCatalog,
  renderStatusEffectTypes,
  resolveStatusEffect,
  validateProductionStatusEffects,
  validateStatusEffectCatalog,
} from "./status-effects.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const productionPath = path.join(projectDir, "src/data/medals/medals.ts");
const realCatalog = await loadStatusEffectCatalog(
  path.join(importerDir, "status-effects.json"),
);
const testStatus = {
  id: "importer-test-status",
  name: "Importer Test Status",
};

async function withTemporaryCatalog(run, initialCatalog = realCatalog) {
  const root = await mkdtemp(path.join(tmpdir(), "opbr-status-effects-test-"));
  const catalogPath = path.join(root, "status-effects.json");
  const generatedTypesPath = path.join(root, "status-effects.generated.ts");
  await writeFile(catalogPath, `${JSON.stringify(initialCatalog, null, 2)}\n`);
  await writeFile(generatedTypesPath, renderStatusEffectTypes(initialCatalog));
  try {
    return await run({ catalogPath, generatedTypesPath });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("A. known Status Effects resolve by approved display name", () => {
  const index = createStatusEffectIndex(realCatalog);
  assert.equal(resolveStatusEffect(index, "Stolen Heart")?.id, "stolen-heart");
  assert.equal(resolveStatusEffect(index, '  "BIND"  ')?.id, "bind");
  assert.equal(realCatalog.length > 0, true);
});

test("B. an unknown Status Effect remains unknown and does not alter catalog", async () => {
  await withTemporaryCatalog(async ({ catalogPath }) => {
    const before = await readFile(catalogPath, "utf8");
    const catalog = await loadStatusEffectCatalog(catalogPath);
    assert.equal(
      resolveStatusEffect(createStatusEffectIndex(catalog), testStatus.name),
      null,
    );
    const issues = [
      createUnknownStatusEffectIssue({
        medalName: "Test Medal",
        displayNameCandidate: testStatus.name,
        ocrText: `Reduces duration of ${testStatus.name} by 36%`,
        screenshot: "IMG_9999.PNG",
      }),
    ];
    assert.equal(issues.length > 0, true, "unknown status must need review");
    assert.deepEqual(issues[0], {
      code: "unknown-status-effect",
      message: `Unknown Status Effect: ${testStatus.name}`,
      screenshot: "IMG_9999.PNG",
      ocrText: `Reduces duration of ${testStatus.name} by 36%`,
      medalName: "Test Medal",
      displayNameCandidate: testStatus.name,
      unknownStatusText: testStatus.name,
      suggestedId: testStatus.id,
      rateScreen: "IMG_9999.PNG",
    });
    assert.equal(await readFile(catalogPath, "utf8"), before);
  });
});

test("C. approve-status adds a new display name and generated ID", async () => {
  assert.deepEqual(
    parseApprovalArguments([
      "--name",
      "Some Status",
      "--id",
      "some-status",
    ]),
    { name: "Some Status", id: "some-status" },
  );
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    const result = await approveStatusEffect({
      name: testStatus.name,
      catalogPath,
      generatedTypesPath,
    });
    assert.deepEqual(result.entry, testStatus);
    assert.equal(result.changed, true);
    const catalog = await loadStatusEffectCatalog(catalogPath);
    assert.deepEqual(catalog.at(-1), result.entry);
    assert.equal(
      await readFile(generatedTypesPath, "utf8"),
      renderStatusEffectTypes(catalog),
    );
  });
});

test("D. approval makes the same previously unknown display name resolvable", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    let catalog = await loadStatusEffectCatalog(catalogPath);
    assert.equal(
      resolveStatusEffect(createStatusEffectIndex(catalog), testStatus.name),
      null,
    );
    await approveStatusEffect({
      name: testStatus.name,
      catalogPath,
      generatedTypesPath,
    });
    catalog = await loadStatusEffectCatalog(catalogPath);
    assert.equal(
      resolveStatusEffect(createStatusEffectIndex(catalog), testStatus.name)?.id,
      testStatus.id,
    );
  });
});

test("E. reapproving the same Status Effect is a no-op", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    await approveStatusEffect({
      name: testStatus.name,
      catalogPath,
      generatedTypesPath,
    });
    const before = await readFile(catalogPath, "utf8");
    const result = await approveStatusEffect({
      name: testStatus.name,
      catalogPath,
      generatedTypesPath,
    });
    assert.equal(result.changed, false);
    assert.equal(await readFile(catalogPath, "utf8"), before);
  });
});

test("F. the same name with a different ID is rejected", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    await assert.rejects(
      approveStatusEffect({
        name: "Stun",
        id: "different-stun",
        catalogPath,
        generatedTypesPath,
      }),
      /already uses ID stun/,
    );
  });
});

test("G. the same ID with a different name is rejected", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    await assert.rejects(
      approveStatusEffect({
        name: "Catalog Collision Test",
        id: "stun",
        catalogPath,
        generatedTypesPath,
      }),
      /already uses name "Stun"/,
    );
  });
});

test("H. an invalid or empty ID is rejected", async () => {
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    for (const id of ["", "Sleep Effect", "sleep_effect", "-sleep"]) {
      await assert.rejects(
        approveStatusEffect({
          name: testStatus.name,
          id,
          catalogPath,
          generatedTypesPath,
        }),
        /Invalid Status Effect ID/,
      );
    }
  });
});

test("I. every production statusReductions ID exists in the catalog", async () => {
  const production = parseGeneratedMedals(await readFile(productionPath, "utf8"));
  const catalogIds = new Set(realCatalog.map(({ id }) => id));
  const usedIds = new Set(
    production.flatMap((medal) => medal.statusReductions ?? []),
  );
  for (const id of usedIds) assert.equal(catalogIds.has(id), true, id);
  validateProductionStatusEffects(production, realCatalog);
  assert.throws(
    () =>
      validateProductionStatusEffects(
        [{ ...production[0], statusReductions: ["not-approved"] }],
        realCatalog,
      ),
    /unknown Status Effect ID: not-approved/,
  );
});

test("J. catalog operations do not change production medal data", async () => {
  const before = await readFile(productionPath, "utf8");
  await withTemporaryCatalog(async ({ catalogPath, generatedTypesPath }) => {
    await approveStatusEffect({
      name: testStatus.name,
      catalogPath,
      generatedTypesPath,
    });
    validateStatusEffectCatalog(await loadStatusEffectCatalog(catalogPath));
  });
  assert.equal(await readFile(productionPath, "utf8"), before);
});
