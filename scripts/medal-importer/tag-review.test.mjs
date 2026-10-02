import assert from "node:assert/strict";
import { mkdtemp, open, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { mergeTagPages } from "./tag-pages.mjs";
import { validateImporterBatch } from "./batch-validation.mjs";
import { parseGeneratedMedals } from "./incremental.mjs";
import {
  compareTagResults, createTagAudit, publishWithTagAudit, readTagAudit,
  sourceImageSha256, tagComparisonCrop, verifySourceImageHash,
} from "./tag-review.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const importerSource = await readFile(path.join(directory, "import.mjs"), "utf8");
// Evaluate only unchanged private pure function declarations, never the CLI.
// This seam lets the original one-tag/no-issues extraction be tested without
// moving extractTags or executing OCR/import/top-level filesystem side effects.
const privateContext = vm.createContext({});
const declarations = [...importerSource.matchAll(/^function (\w+)\(/gm)];
for (const name of ["normalizeText", "slugify", "issue", "ignoredTagText", "extractTags", "rebaseFieldOcrToScreenshot"]) {
  const index = declarations.findIndex((match) => match[1] === name);
  assert.notEqual(index, -1, `Missing private function ${name}`);
  vm.runInContext(importerSource.slice(declarations[index].index, declarations[index + 1].index), privateContext);
}
const extract = (ocr) => JSON.parse(JSON.stringify(privateContext.extractTags(ocr, "synthetic-tag.png")));
const observation = (text, y = 0.7) => ({ text, x: 0.4, y, width: 0.15, height: 0.025 });
const ocr = (...texts) => ({ lines: texts, observations: texts.map((text, i) => observation(text, 0.7 - i * 0.08)) });
const result = (...ids) => ({ tags: ids.map((id) => ({ id, name: id })), issues: [] });
const hash = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
const evidence = (overrides = {}) => ({
  medalId: "synthetic-medal", sourceImage: "synthetic-tag.png", sourceImageSha256: hash,
  detectedTags: result("land-of-wano").tags,
  tagRegionDetectedTags: result("land-of-wano", "navy").tags,
  reviewStatus: "needs-review", importedAt: null, ...overrides,
});
async function temporary(t) {
  const root = await mkdtemp(path.join(tmpdir(), "opbr-tag-review-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
function runExistingGate(drafts) {
  const start = importerSource.indexOf("for (const draft of drafts) {\n  draft.needsReview = draft.issues.length > 0;");
  assert.notEqual(start, -1, "Existing final gate changed; update test seam explicitly");
  const end = importerSource.indexOf("\nconst importCandidates", start);
  assert.notEqual(end, -1);
  const context = vm.createContext({ drafts });
  vm.runInContext(importerSource.slice(start, end), context);
  return drafts;
}

test("regression: one tag and no issues versus multiple region tags enters Review, keeps normal tags, and is excluded", () => {
  const normal = extract(ocr("Land of Wano"));
  const region = extract(ocr("Land of Wano", "Navy", "Logia"));
  assert.equal(normal.tags.length, 1);
  assert.deepEqual(normal.issues, []);
  const compared = compareTagResults(normal, region, "synthetic-tag.png");
  assert.equal(compared.matches, false);
  assert.strictEqual(compared.tags, normal.tags);
  assert.deepEqual(compared.tags, [{ id: "land-of-wano", name: "Land of Wano" }]);
  const merged = mergeTagPages([{ file: "synthetic-tag.png", ...compared }]);
  const [draft] = runExistingGate([{
    id: "synthetic-medal", name: "Synthetic Medal", category: "character",
    uniqueTrait: "Test.", tags: merged.tags, nativeTraits: ["atk"], issues: merged.issues,
  }]);
  assert.equal(draft.needsReview, true);
  assert.equal(draft.validationPassed, false);
  const batch = {
    mode: "incremental", merge: { previousProduction: [] }, medals: [draft],
    summary: { existingProductionMedals: 0, batchMedals: 1, newMedals: 0,
      duplicateMedals: 0, conflicts: 0, nextProductionMedals: 0 },
  };
  assert.equal(validateImporterBatch([], batch).newMedals, 0);
});

test("equal sets ignore order, duplicate IDs, and normalized name differences without mutation", () => {
  const normal = result("royalty-former-royalty", "navy", "navy");
  const region = result("navy", "royalty-former-royalty");
  region.tags[1].name = "Royalty/ Former Royalty";
  const original = structuredClone(normal);
  assert.equal(compareTagResults(normal, region, "T").matches, true);
  assert.deepEqual(normal, original);
  assert.deepEqual(compareTagResults(normal, region, "T").issues, []);
});

test("successful empty OCR differs from unavailable OCR; neither zero rescue nor issue clearing occurs", () => {
  const empty = extract(ocr());
  const one = extract(ocr("Navy"));
  assert.equal(compareTagResults(empty, empty, "T").matches, true);
  assert.equal(compareTagResults(empty, empty, "T").issues[0].code, "missing-tags");
  assert.equal(compareTagResults(empty, one, "T").matches, false);
  assert.deepEqual(compareTagResults(empty, one, "T").tags, []);
  assert.equal(compareTagResults(one, empty, "T").matches, false);
  for (const unavailable of [null, undefined, {}, { tags: null, issues: [] }]) {
    assert.throws(() => compareTagResults(one, unavailable, "T"), /completed extraction/);
  }
});

test("a dedicated parse failure is comparison unavailable, not a successful equal set", () => {
  assert.throws(() => compareTagResults(result("navy"), {
    ...result("navy"), issues: [{ code: "unparsed-tag-text" }],
  }, "T"), /comparison cannot proceed/);
  assert.throws(() => compareTagResults(result("navy"), result("bad id"), "T"), /invalid normalized/);
});

test("normal issues and other-field Review survive equal tag OCR", () => {
  const originalIssue = { code: "unparsed-tag-text" };
  const normal = { ...result("navy"), issues: [originalIssue] };
  const compared = compareTagResults(normal, result("navy"), "T");
  assert.strictEqual(compared.issues[0], originalIssue);
  const [draft] = runExistingGate([{ issues: [...compared.issues, { code: "missing-name" }] }]);
  assert.equal(draft.needsReview, true);
});

test("page mismatches survive aggregation even when the final normal/region unions would match", () => {
  const pages = [
    { file: "T1", ...compareTagResults(result("a"), result("b"), "T1") },
    { file: "T2", ...compareTagResults(result("b"), result("a"), "T2") },
  ];
  const merged = mergeTagPages(pages);
  assert.deepEqual(merged.tags.map((tag) => tag.id), ["a", "b"]);
  assert.equal(merged.issues.filter((issue) => issue.code === "tag-ocr-mismatch").length, 2);
});

test("dedicated crop covers the existing viewport; unchanged rebasing preserves screenshot coordinates", () => {
  const size = { width: 2532, height: 1170 };
  const crop = tagComparisonCrop(size, 2.5);
  assert.ok(crop.x <= size.width * 0.2);
  assert.ok(crop.x + crop.width >= size.width * 0.8);
  assert.ok(crop.y <= size.height * 0.15);
  assert.ok(crop.y + crop.height >= size.height * 0.86);
  for (const y of [0.141, 0.7, 0.849]) {
    const original = observation("Navy", y);
    const local = { ...original,
      x: (original.x * size.width - crop.x) / crop.width,
      y: (original.y * size.height - (size.height - crop.y - crop.height)) / crop.height,
      width: original.width * size.width / crop.width,
      height: original.height * size.height / crop.height,
    };
    const rebased = privateContext.rebaseFieldOcrToScreenshot({ crop, lines: ["Navy"], observations: [local] }, size);
    assert.deepEqual(extract(rebased).tags, [{ id: "navy", name: "Navy" }]);
  }
});

test("all 11 reviewed fixture tag arrays remain identical to production and synthetic equal comparisons pass", async () => {
  const review = JSON.parse(await readFile(path.join(directory, "reviewed-medals.json"), "utf8"));
  const production = parseGeneratedMedals(await readFile(path.resolve(directory, "../../src/data/medals/medals.ts"), "utf8"));
  assert.equal(review.medals.length, 11);
  for (const fixture of review.medals) {
    assert.deepEqual(production.find((medal) => medal.id === fixture.id).tags, fixture.tags);
    const normal = { tags: structuredClone(fixture.tags), issues: [] };
    assert.equal(compareTagResults(normal, { ...normal, tags: [...normal.tags].reverse() }, "synthetic").matches, true);
  }
});

test("source SHA-256 uses original bytes, identifies same-name replacement, and refuses failed/invalid reads", async (t) => {
  const root = await temporary(t);
  const file = path.join(root, "IMG_0001.PNG");
  await writeFile(file, Buffer.from("abc"));
  assert.equal(await sourceImageSha256(file), hash);
  await verifySourceImageHash(file, hash);
  const cropFile = path.join(root, "crop.PNG");
  await writeFile(cropFile, "cropped/transformed bytes");
  assert.notEqual(await sourceImageSha256(cropFile), hash);
  await writeFile(file, "abd");
  assert.notEqual(await sourceImageSha256(file), hash);
  await assert.rejects(verifySourceImageHash(file, hash), /changed during OCR/);
  await assert.rejects(sourceImageSha256(path.join(root, "missing.PNG")), { code: "ENOENT" });
  await assert.rejects(sourceImageSha256(file, async () => ""), /original image bytes/);
  await assert.rejects(verifySourceImageHash(file, ""), /changed during OCR/);
});

test("exclusive per-run creation, serial appends, and retries preserve earlier evidence", async (t) => {
  const root = await temporary(t);
  const options = { startedAt: new Date("2026-10-02T00:00:00Z"), runId: "same-run" };
  const audit = await createTagAudit(root, options);
  await Promise.all(["comparison-started", "comparison-complete", "validation-complete"].map((event) =>
    audit.append({ event, records: [evidence()] })));
  await audit.close();
  const before = await readFile(audit.file, "utf8");
  assert.deepEqual(readTagAudit(before).events.map((entry) => entry.event), [
    "run-started", "comparison-started", "comparison-complete", "validation-complete",
  ]);
  await assert.rejects(createTagAudit(root, options), { code: "EEXIST" });
  assert.equal(await readFile(audit.file, "utf8"), before);
  const retry = await createTagAudit(root, { ...options, runId: "retry-run" });
  await retry.append({ event: "run-completed", outcome: "duplicate-only", records: [evidence({ importedAt: null })] });
  await retry.close();
  assert.equal((await readdir(root)).length, 2);
  assert.equal(readTagAudit(await readFile(retry.file, "utf8")).events[1].records[0].importedAt, null);
  await assert.rejects(audit.append({ event: "late" }), /closed/);
});

test("unavailable versus empty dedicated evidence is preserved; no invalid successful hash is accepted", async (t) => {
  const root = await temporary(t);
  const audit = await createTagAudit(root);
  await audit.append({ event: "comparison-started", records: [evidence({ tagRegionDetectedTags: null, reviewStatus: "pending" })] });
  await audit.append({ event: "comparison-complete", records: [evidence({ tagRegionDetectedTags: [] })] });
  await audit.close();
  const events = readTagAudit(await readFile(audit.file, "utf8")).events;
  assert.equal(events[1].records[0].tagRegionDetectedTags, null);
  assert.deepEqual(events[2].records[0].tagRegionDetectedTags, []);
  const bad = await createTagAudit(root);
  await assert.rejects(bad.append({ event: "comparison-complete", records: [evidence({ sourceImageSha256: "" })] }), /original source image SHA/);
  await assert.rejects(bad.close());
});

test("JSONL torn tail is incomplete; malformed complete lines are errors", () => {
  const complete = '{"event":"run-started"}\n';
  assert.equal(readTagAudit(complete).incompleteTail, false);
  assert.deepEqual(readTagAudit(complete + '{"event":"publication-succ').events, [{ event: "run-started" }]);
  assert.equal(readTagAudit(complete + '{"event":"publication-succ').incompleteTail, true);
  assert.throws(() => readTagAudit(complete + 'bad-json\n'), SyntaxError);
});

test("audit write/sync failure before publication prevents the publish callback", async (t) => {
  const root = await temporary(t);
  for (const failingOperation of ["writeFile", "sync"]) {
    let count = 0;
    const audit = await createTagAudit(root, { openFile: async (...args) => {
      const handle = await open(...args);
      return {
        writeFile: async (...values) => {
          if (failingOperation === "writeFile" && ++count === 2) throw new Error("audit write failed");
          return handle.writeFile(...values);
        },
        sync: async () => {
          if (failingOperation === "sync" && ++count === 2) throw new Error("audit sync failed");
          return handle.sync();
        },
        close: () => handle.close(),
      };
    } });
    let invoked = false;
    await assert.rejects(publishWithTagAudit({ audit, records: [], publish: async () => { invoked = true; } }), /audit .* failed/);
    assert.equal(invoked, false);
    await assert.rejects(audit.close());
  }
});

test("successful publication stamps only caller-selected new records, at one successful commit time", async (t) => {
  const root = await temporary(t);
  const audit = await createTagAudit(root);
  const record = evidence({ reviewStatus: "validation-passed" });
  const outcome = await publishWithTagAudit({ audit, records: [record, record],
    publish: async () => {}, now: () => new Date("2026-10-02T01:00:00Z") });
  assert.equal(outcome.auditComplete, true);
  assert.equal(record.importedAt, null);
  const success = readTagAudit(await readFile(audit.file, "utf8")).events.at(-1);
  assert.equal(success.event, "publication-success");
  assert.deepEqual(success.records.map((entry) => entry.importedAt), ["2026-10-02T01:00:00.000Z", "2026-10-02T01:00:00.000Z"]);
});

test("production failure is recorded without importedAt; image-only recovery has no new imported records", async (t) => {
  const root = await temporary(t);
  const failed = await createTagAudit(root);
  await assert.rejects(publishWithTagAudit({ audit: failed, records: [evidence()], publish: async () => { throw new Error("publish failed"); } }), /publish failed/);
  await failed.close();
  assert.equal(readTagAudit(await readFile(failed.file, "utf8")).events.at(-1).event, "publication-failed");
  const recovered = await createTagAudit(root);
  await publishWithTagAudit({ audit: recovered, records: [], publish: async () => {} });
  assert.deepEqual(readTagAudit(await readFile(recovered.file, "utf8")).events.at(-1).records, []);
});

test("post-publication audit write, sync, or close failure preserves committed data and reports audit failure separately", async (t) => {
  const root = await temporary(t);
  for (const failingOperation of ["writeFile", "sync", "close"]) {
    let count = 0;
    const audit = await createTagAudit(root, { openFile: async (...args) => {
      const handle = await open(...args);
      return {
        writeFile: async (...values) => {
          if (failingOperation === "writeFile" && ++count === 3) throw new Error("completion unavailable");
          return handle.writeFile(...values);
        },
        sync: async () => {
          if (failingOperation === "sync" && ++count === 3) throw new Error("completion unavailable");
          return handle.sync();
        },
        close: async () => {
          await handle.close();
          if (failingOperation === "close") throw new Error("completion unavailable");
        },
      };
    } });
    const production = path.join(root, `synthetic-production-${failingOperation}.json`);
    const outcome = await publishWithTagAudit({ audit, records: [evidence({ reviewStatus: "validation-passed" })],
      publish: () => writeFile(production, '{"committed":true}') });
    assert.equal(outcome.published, true);
    assert.equal(outcome.auditComplete, false);
    assert.equal(outcome.auditError.message, "completion unavailable");
    assert.equal(await readFile(production, "utf8"), '{"committed":true}');
    const events = readTagAudit(await readFile(audit.file, "utf8")).events;
    assert.equal(events.at(-1).event, failingOperation === "writeFile" ? "publication-started" : "publication-success");
  }
});


test("actual importer publication selection excludes Review and duplicates; pre-publication evidence stays unstamped", async () => {
  const start = importerSource.indexOf("  const importedSources = new Set(mergePlan.newMedals.map");
  const end = importerSource.indexOf("\n} finally {", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const drafts = [
    { sources: { details: "new-D.png" }, tagOcrComparisons: [evidence({ medalId: "new", reviewStatus: "validation-passed" })] },
    { sources: { details: "review-D.png" }, tagOcrComparisons: [evidence({ medalId: "review", reviewStatus: "needs-review" })] },
    { sources: { details: "duplicate-D.png" }, tagOcrComparisons: [evidence({ medalId: "duplicate", reviewStatus: "validation-passed" })] },
  ];
  const events = [];
  let publishes = 0;
  const context = vm.createContext({
    mergePlan: { newMedals: [{ sources: { details: "new-D.png" } }] }, drafts,
    audit: { append: async (event) => events.push(event), close: async () => {} },
    publishWithTagAudit: (args) => publishWithTagAudit({ ...args, now: () => new Date("2026-10-02T01:00:00Z") }),
    publishAtomic: async () => { publishes++; },
    stagedDataPath: "synthetic-data", stagedImages: [], dataPath: "synthetic-data", imageDir: "synthetic-images",
    console, process: {},
  });
  await vm.runInContext(`(async () => {${importerSource.slice(start, end)}})()`, context);
  assert.equal(publishes, 1);
  assert.equal(events[0].event, "publication-started");
  assert.equal(events[1].records.length, 1);
  assert.equal(events[1].records[0].medalId, "new");
  assert.equal(events[1].records[0].importedAt, "2026-10-02T01:00:00.000Z");
  assert.deepEqual(drafts.flatMap((draft) => draft.tagOcrComparisons.map((record) => record.importedAt)), [null, null, null]);
});
