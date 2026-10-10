import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, writeFile, rm, open, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { characters, characterLevel100BaseStatsCatalog } from '../../src/data/characters/index.ts';
import { buildDraft, applyCorrection } from './draft.mjs';
import { previewBaseStats } from './base-conversion.mjs';
import { parseBaseCatalog, readBaseCatalog, prepareBaseSave, saveBaseApproved } from './base-store.mjs';
import { startReviewServer } from './server.mjs';
const expected = JSON.parse(await readFile(new URL('./fixtures/expected.json', import.meta.url), 'utf8'));
const captured = JSON.parse(await readFile(new URL('./fixtures/ocr-results.json', import.meta.url), 'utf8'));
const original = await readFile(new URL('../../src/data/characters/level-100-base-stats.ts', import.meta.url), 'utf8');
function draft(truth = expected[0]) { return buildDraft(captured.rows.find(row => row.file === truth.file).draft, characters); }
function selection(row, truth = expected[0], overrides = {}) {
  return { draftId: row.id, characterId: truth.characterId, maxStats: truth.maxStats, conditions: truth.conditions, reviewed: true, baseReviewed: true, ...overrides };
}
async function temporary(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'opbr-base-test-'));
  const path = join(dir, 'level-100-base-stats.ts'); await writeFile(path, original);
  try { await fn(path, dir); } finally { await rm(dir, { recursive: true, force: true }); }
}
test('five captured OCR rows convert to independently specified Base Stats; Garp matches the existing catalog', () => {
  for (const truth of expected) {
    const row = draft(truth);
    const result = previewBaseStats(applyCorrection(row, selection(row, truth)), characterLevel100BaseStatsCatalog, characters);
    assert.deepEqual(result.boost, { hp: 2580, atk: 640, def: 640 });
    assert.deepEqual(result.baseStats, truth.baseStats);
    assert.deepEqual(result.issues, []);
    if (truth.characterId === 'legendary-hero-monkey-d-garp') {
      assert.deepEqual(result.existing, { characterId: truth.characterId, ...truth.baseStats });
      assert.equal(result.conflict, false);
    }
  }
});
test('conversion stops for uncertain ID, unknown role, wrong conditions, invalid or nonpositive results', () => {
  const row = draft(); const good = applyCorrection(row, selection(row));
  for (const bad of [
    { ...good, characterId: null }, { ...good, characterId: '__proto__' },
    { ...good, conditions: { ...good.conditions, characterBoost: 20 } },
    { ...good, conditions: { ...good.conditions, screen: null } },
    { ...good, maxStats: { ...good.maxStats, hp: 2580 } },
    { ...good, maxStats: { ...good.maxStats, atk: 639 } },
    { ...good, maxStats: { ...good.maxStats, def: 640.5 } },
    { ...good, maxStats: { ...good.maxStats, hp: null, atk: null, def: null } },
  ]) assert.ok(previewBaseStats(bad, [], characters).issues.length);
  assert.ok(previewBaseStats(good, [], { ...characters, [good.characterId]: { ...characters[good.characterId], role: 'unknown' } }).issues.length);
});
test('Base Stats save always requires screenshot and conversion/diff approval, including an unchanged Garp', () => {
  const truth = expected.find(row => row.characterId === 'legendary-hero-monkey-d-garp'); const row = draft(truth);
  for (const overrides of [{ reviewed: false }, { baseReviewed: false }, { baseReviewed: undefined }, { conditions: { ...truth.conditions, medalsEquipped: null } }]) {
    assert.throws(() => prepareBaseSave({ records: characterLevel100BaseStatsCatalog, drafts: [row], selections: [selection(row, truth, overrides)], characters }));
  }
});
test('conflicting Base Stats require separate overwrite consent; client base values cannot bypass conversion', () => {
  const truth = expected.find(row => row.characterId === 'legendary-hero-monkey-d-garp'); const row = draft(truth);
  const changed = selection(row, truth, { maxStats: { ...truth.maxStats, hp: 9467 }, baseStats: { baseHp: 1, baseAtk: 2, baseDef: 3 }, allowOverwrite: true });
  assert.throws(() => prepareBaseSave({ records: characterLevel100BaseStatsCatalog, drafts: [row], selections: [changed], characters }), /Base Stats overwrite/);
  const plan = prepareBaseSave({ records: characterLevel100BaseStatsCatalog, drafts: [row], selections: [{ ...changed, allowBaseOverwrite: true }], characters });
  assert.equal(plan.records.find(record => record.characterId === truth.characterId).baseHp, 6887);
  assert.equal(plan.changes[0].previous.baseHp, 6886);
});
test('partial conversion preserves existing non-null fields and keeps missing new fields null', () => {
  const truth = expected.find(row => row.characterId === 'legendary-hero-monkey-d-garp'); const row = draft(truth);
  const plan = prepareBaseSave({ records: characterLevel100BaseStatsCatalog, drafts: [row], selections: [selection(row, truth, { maxStats: { hp: null, atk: 2511, def: null, crit: null, totalPower: null } })], characters });
  assert.deepEqual(plan.records, characterLevel100BaseStatsCatalog);
  const fresh = draft();
  const result = prepareBaseSave({ records: [], drafts: [fresh], selections: [selection(fresh, expected[0], { maxStats: { hp: 9169, atk: null, def: null, crit: null, totalPower: null } })], characters });
  assert.deepEqual(result.records, [{ characterId: expected[0].characterId, baseHp: 6589, baseAtk: null, baseDef: null }]);
});
test('five individually approved conversions atomically add four entries, preserve every existing entry and surrounding source', async () => temporary(async (path, dir) => {
  const snapshot = await readBaseCatalog(path, characters);
  const drafts = expected.map(truth => draft(truth));
  const result = await saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts, selections: drafts.map((row, index) => selection(row, expected[index])), characters });
  assert.equal(result.savedIds.length, 5); assert.equal(result.records.length, snapshot.records.length + 4);
  for (const old of snapshot.records) assert.deepEqual(result.records.find(row => row.characterId === old.characterId), old);
  for (const truth of expected) assert.deepEqual(result.records.find(row => row.characterId === truth.characterId), { characterId: truth.characterId, ...truth.baseStats });
  const text = await readFile(path, 'utf8');
  assert.equal(text.slice(0, snapshot.array.elements[0].getStart(snapshot.source)), original.slice(0, snapshot.array.elements[0].getStart(snapshot.source)));
  assert.equal(text.slice(text.indexOf('export const characterLevel100BaseStatsByCharacterId')), original.slice(original.indexOf('export const characterLevel100BaseStatsByCharacterId')));
  const backup = join(dir, '.character-stats-backups', `${snapshot.revision}.ts`);
  assert.equal(await readFile(backup, 'utf8'), original);
  assert.deepEqual((await readBaseCatalog(path, characters)).records, result.records);
}));
test('Garp equal-value save leaves source bytes and revision unchanged without a backup', async () => temporary(async (path, dir) => {
  const truth = expected.find(row => row.characterId === 'legendary-hero-monkey-d-garp'); const row = draft(truth);
  const snapshot = await readBaseCatalog(path, characters);
  const result = await saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts: [row], selections: [selection(row, truth)], characters });
  assert.equal(result.revision, snapshot.revision); assert.equal(await readFile(path, 'utf8'), original);
  assert.deepEqual(await readdir(dir), ['level-100-base-stats.ts']);
}));
test('explicit overwrite changes only the approved field and saves the previous source', async () => temporary(async path => {
  const truth = expected.find(row => row.characterId === 'legendary-hero-monkey-d-garp'); const row = draft(truth);
  const snapshot = await readBaseCatalog(path, characters);
  await saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts: [row], selections: [selection(row, truth, { maxStats: { ...truth.maxStats, hp: 9467 }, allowBaseOverwrite: true })], characters });
  assert.equal(await readFile(path, 'utf8'), original.replace('baseHp: 6_886', 'baseHp: 6887'));
}));
test('invalid batches, duplicate IDs, stale revisions and locks leave Base Stats source intact', async () => temporary(async path => {
  const a = draft(); const b = draft(expected[1]); const snapshot = await readBaseCatalog(path, characters);
  for (const selections of [[], [selection(a), selection(b, expected[1], { baseReviewed: false })], [selection(a), selection(a)], [selection(a, expected[0], { characterId: 'fake' })]]) {
    await assert.rejects(saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts: [a, b], selections, characters }));
    assert.equal(await readFile(path, 'utf8'), original);
  }
  await writeFile(path, original + '\n// concurrent edit\n');
  await assert.rejects(saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts: [a], selections: [selection(a)], characters }), /changed/);
  assert.equal(await readFile(path, 'utf8'), original + '\n// concurrent edit\n');
  const lock = await open(`${path}.lock`, 'wx');
  try { await assert.rejects(saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts: [a], selections: [selection(a)], characters }), /another process/); }
  finally { await lock.close(); }
}));
test('literal parser rejects schema changes, expressions, duplicates and invalid values before editing', () => {
  for (const text of [original.replace('baseHp: 6_806', 'baseHp: -1'), original.replace('baseHp: 6_806', 'baseHp: compute()'), original.replace('baseHp: 6_806', 'other: 6806'), original.replace('characterLevel100BaseStatsCatalog: readonly CharacterLevel100BaseStats[] = [', 'characterLevel100BaseStatsCatalog = (() => ['), original.replace('flame-emperor-sabo', 'red-rock-monkey-d-luffy')]) assert.throws(() => parseBaseCatalog(text, characters));
});
test('a catalog without trailing commas remains valid after adding a partial record', async () => temporary(async path => {
  const minimal = `// keep me\nexport const characterLevel100BaseStatsCatalog = [\n  { characterId: "legendary-hero-monkey-d-garp", baseHp: 6886, baseAtk: 1871, baseDef: 1423 }\n];\n// keep me too\n`;
  await writeFile(path, minimal);
  const row = draft(); const snapshot = await readBaseCatalog(path, characters);
  await saveBaseApproved({ path, expectedRevision: snapshot.revision, drafts: [row], selections: [selection(row)], characters });
  assert.equal((await readBaseCatalog(path, characters)).records.length, 2);
  assert.ok((await readFile(path, 'utf8')).endsWith('// keep me too\n'));
}));
test('local HTTP preview/save handles both save orders, requires Base Stats approval, and isolates both catalogs', async () => temporary(async (path, dir) => {
  const maxPath = join(dir, 'max.json'); await writeFile(maxPath, '[]\n');
  const app = await startReviewServer({ catalogPath: maxPath, baseCatalogPath: path, port: 0, recognize: async () => captured.rows[0].draft });
  const call = async (route, data, headers = {}) => fetch(`${app.url}${route}`, { method: data ? 'POST' : 'GET', headers: { 'x-review-token': app.token, ...(data ? { 'Content-Type': 'application/json', Origin: app.url } : {}), ...headers }, ...(data ? { body: JSON.stringify(data) } : {}) });
  try {
    assert.equal((await call('/api/base-save', {}, { Origin: 'https://example.com' })).status, 403);
    const bytes = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
    for (const name of ['first.png', 'second.png']) assert.equal((await call('/api/upload', { name, data: bytes })).status, 200);
    let state = await (await call('/api/state')).json();
    const a = selection(state.drafts[0]); const b = selection(state.drafts[1], expected[1]);
    const preview = await (await call('/api/base-preview', { expectedRevision: state.baseCatalog.revision, selection: a })).json();
    assert.deepEqual(preview.baseStats, expected[0].baseStats);
    assert.equal((await call('/api/base-save', { expectedRevision: state.baseCatalog.revision, selections: [{ ...a, baseReviewed: false }] })).status, 400);
    assert.equal(await readFile(path, 'utf8'), original);
    assert.equal((await call('/api/base-save', { expectedRevision: state.baseCatalog.revision, selections: [a] })).status, 200);
    assert.equal(await readFile(maxPath, 'utf8'), '[]\n');
    assert.equal((await call('/api/save', { expectedRevision: state.revision, selections: [a] })).status, 200);
    state = await (await call('/api/state')).json();
    assert.equal(state.drafts[0].baseSaved, true); assert.equal(state.drafts[0].status, 'saved');
    assert.equal((await call('/api/base-save', { expectedRevision: state.baseCatalog.revision, selections: [a] })).status, 400);
    assert.equal((await call('/api/save', { expectedRevision: state.revision, selections: [b] })).status, 200);
    const maxContent = await readFile(maxPath, 'utf8');
    assert.equal((await call('/api/base-save', { expectedRevision: state.baseCatalog.revision, selections: [b] })).status, 200);
    assert.equal(await readFile(maxPath, 'utf8'), maxContent);
    for (const truth of expected.slice(0, 2)) assert.deepEqual((await readBaseCatalog(path, characters)).records.find(row => row.characterId === truth.characterId), { characterId: truth.characterId, ...truth.baseStats });
    assert.equal((await call('/api/base-preview', { expectedRevision: state.baseCatalog.revision, selection: b })).status, 400);
  } finally { await app.close(); }
}));
