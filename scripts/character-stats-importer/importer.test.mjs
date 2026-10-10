import assert from 'node:assert/strict';
import test from 'node:test';
import { get } from 'node:http';
import { mkdtemp, readFile, writeFile, rm, open, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { characters } from '../../src/data/characters/index.ts';
import { buildDraft, readNumber, applyCorrection, reviewIssues } from './draft.mjs';
import { prepareSave, readCatalog, saveApproved } from './store.mjs';
import { startReviewServer } from './server.mjs';
const expected = JSON.parse(await readFile(new URL('./fixtures/expected.json', import.meta.url), 'utf8'));
const fixture = expected[0];
function evidence() {
  return { sourceImage: fixture.file, sourceSha256: 'a'.repeat(64), templateId: 'stats-of-max-level-v01', crops: {}, imageSize: { width: 2048, height: 946 }, ocr: {
    identity: { lines: ['Navy HQ / Captain', 'Koby'] }, level: { lines: ['Lv.100/100'] }, boost: { lines: ['52/52'] }, preview: { lines: ['Stats of max level.'] },
    ...Object.fromEntries(Object.entries(fixture.maxStats).map(([field, value]) => [field, { lines: [String(value)] }])),
  } };
}
function draft() { return buildDraft(evidence(), characters); }
function selection(row, overrides = {}) {
  return { draftId: row.id, characterId: fixture.characterId, maxStats: { ...fixture.maxStats }, conditions: { ...fixture.conditions }, reviewed: true, ...overrides };
}
async function temporaryStore(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'opbr-stats-test-'));
  const path = join(dir, 'catalog.json'); await writeFile(path, '[]\n');
  try { await fn(path); } finally { await rm(dir, { recursive: true, force: true }); }
}
test('OCR never infers medals absent or approval; title and name match canonical ID', () => {
  const row = draft(); assert.equal(row.characterId, fixture.characterId); assert.equal(row.status, 'pending'); assert.equal(row.conditions.medalsEquipped, null);
  assert.deepEqual(row.maxStats, fixture.maxStats); assert.ok(reviewIssues(row, characters).some(issue => issue.includes('メダル')));
});
test('bare, misspelled and wrong-version names remain unmatched suggestions', () => {
  for (const identity of [['Koby'], ['Navy HQ / Admirai', 'Koby'], ['Unexpected Collaboration', 'Koby']]) {
    const source = evidence(); source.ocr.identity.lines = identity;
    const row = buildDraft(source, characters); assert.equal(row.characterId, null); assert.ok(row.match.candidates.length > 0);
  }
});
test('ambiguous OCR, text, decimal integer and glyph substitutions are withheld', () => {
  for (const lines of [['9169', '9189'], ['9I69'], ['9169 HP'], ['9169.5']]) assert.equal(readNumber({ lines }), null);
  assert.equal(readNumber({ lines: ['9,169'] }), 9169); assert.equal(readNumber({ lines: ['+11.00%'] }, true), 11);
});
test('server requires explicit human approval and canonical identity', () => {
  const row = draft();
  for (const update of [{ reviewed: false }, { characterId: 'fake' }, { characterId: '__proto__' }, { conditions: { ...fixture.conditions, medalsEquipped: null } }, { conditions: { ...fixture.conditions, level: 99 } }]) {
    assert.throws(() => prepareSave({ records: [], drafts: [row], selections: [selection(row, update)], characters }));
  }
});
test('invalid values and completely empty primary stats cannot be approved', () => {
  const row = draft();
  for (const value of [-5, 0, 1.5, '9169', NaN, Infinity, 1000000]) {
    assert.throws(() => prepareSave({ records: [], drafts: [row], selections: [selection(row, { maxStats: { ...fixture.maxStats, hp: value } })], characters }));
  }
  assert.throws(() => prepareSave({ records: [], drafts: [row], selections: [selection(row, { maxStats: { hp: null, atk: null, def: null, crit: 11, totalPower: 11446 } })], characters }));
});
test('partial stats are allowed, identity corrections do not alter raw evidence', () => {
  const row = draft(); const input = selection(row, { maxStats: { hp: 9169, atk: null, def: null, crit: null, totalPower: null } });
  const plan = prepareSave({ records: [], drafts: [row], selections: [input], characters });
  assert.equal(plan.records[0].maxStats.hp, 9169); assert.equal(plan.records[0].maxStats.atk, null);
  const corrected = applyCorrection(row, { ...input, characterId: expected[1].characterId });
  assert.equal(corrected.characterId, expected[1].characterId); assert.equal(row.characterId, fixture.characterId); assert.deepEqual(corrected.ocr, row.ocr);
});
test('conflicting existing values require explicit overwrite and retain prior value in review', () => {
  const row = draft(); const original = prepareSave({ records: [], drafts: [row], selections: [selection(row)], characters }).records;
  const next = draft(); const changed = selection(next, { maxStats: { ...fixture.maxStats, hp: 9170 } });
  assert.throws(() => prepareSave({ records: original, drafts: [next], selections: [changed], characters }), /overwrite/);
  const saved = prepareSave({ records: original, drafts: [next], selections: [{ ...changed, allowOverwrite: true }], characters }).records[0];
  assert.equal(saved.maxStats.hp, 9170); assert.equal(saved.reviews.length, 2); assert.equal(saved.reviews[1].previous.hp, 9169);
});
test('null incoming values preserve existing fields and unrelated characters', () => {
  const first = draft(); const records = prepareSave({ records: [], drafts: [first], selections: [selection(first)], characters }).records;
  const second = draft(); const plan = prepareSave({ records, drafts: [second], selections: [selection(second, { maxStats: { hp: null, atk: 2398, def: null, crit: null, totalPower: null } })], characters });
  assert.deepEqual(plan.records[0].maxStats, fixture.maxStats);
  const another = draft(); const result = prepareSave({ records, drafts: [another], selections: [selection(another, { characterId: expected[1].characterId, maxStats: expected[1].maxStats })], characters });
  assert.deepEqual(result.records[0], records[0]); assert.equal(result.records.length, 2);
});
test('duplicate IDs, unknown drafts, saved drafts and empty approvals are blocked', () => {
  const a = draft(); const b = draft();
  assert.throws(() => prepareSave({ records: [], drafts: [a,b], selections: [selection(a),selection(b)], characters }), /Duplicate/);
  assert.throws(() => prepareSave({ records: [], drafts: [a], selections: [selection(b)], characters }), /Unknown/);
  a.status = 'saved'; assert.throws(() => prepareSave({ records: [], drafts: [a], selections: [selection(a)], characters }), /saved/);
  assert.throws(() => prepareSave({ records: [], drafts: [], selections: [], characters }));
});
test('atomic save includes only selected rows; stale catalog and invalid batch leave file intact', async () => temporaryStore(async path => {
  const a = draft(); const b = draft(); const snapshot = await readCatalog(path, characters);
  await assert.rejects(saveApproved({ path, expectedRevision: snapshot.revision, drafts: [a,b], selections: [selection(a),selection(b,{ reviewed:false })], characters }));
  assert.equal(await readFile(path, 'utf8'), '[]\n');
  const result = await saveApproved({ path, expectedRevision: snapshot.revision, drafts: [a,b], selections: [selection(a)], characters });
  assert.deepEqual(result.savedIds, [a.id]); assert.equal(result.records.length, 1);
  const content = await readFile(path, 'utf8');
  await assert.rejects(saveApproved({ path, expectedRevision: snapshot.revision, drafts: [b], selections: [selection(b)], characters }), /changed/);
  assert.equal(await readFile(path, 'utf8'), content); assert.equal((await readCatalog(path, characters)).records.length, 1);
}));
test('exclusive catalog lock prevents concurrent writers', async () => temporaryStore(async path => {
  const lock = await open(`${path}.lock`, 'wx');
  try { const row = draft(); await assert.rejects(saveApproved({ path, expectedRevision: (await readCatalog(path, characters)).revision, drafts: [row], selections: [selection(row)], characters }), /another process/); }
  finally { await lock.close(); }
  assert.equal(await readFile(path, 'utf8'), '[]\n');
}));
test('malformed and duplicate existing records fail validation before save', async () => temporaryStore(async path => {
  const row = draft(); const records = prepareSave({ records: [], drafts: [row], selections: [selection(row)], characters }).records;
  await writeFile(path, JSON.stringify([...records,...records])); await assert.rejects(readCatalog(path, characters), /Invalid/);
  await writeFile(path, JSON.stringify([{...records[0], conditions: {...fixture.conditions, medalsEquipped:true}}])); await assert.rejects(readCatalog(path, characters), /Invalid/);
}));
test('HTTP upload → OCR → correction → individual approval → save; CSRF blocked', async () => temporaryStore(async path => {
  const app = await startReviewServer({ catalogPath:path, port:0, recognize:async () => evidence() });
  const call = async (route, data, extraHeaders = {}) => fetch(`${app.url}${route}`, { method:data ? 'POST':'GET', headers:{ 'x-review-token':app.token, ...(data ? { 'Content-Type':'application/json', Origin:app.url }:{}), ...extraHeaders }, ...(data ? { body:JSON.stringify(data) }:{}) });
  try {
    const noToken = await fetch(`${app.url}/api/state`); assert.equal(noToken.status,403);
    assert.equal(app.server.address().address, '127.0.0.1');
    const invalidOrigin = await call('/api/save', {}, { Origin:'https://example.com' }); assert.equal(invalidOrigin.status,403);
    const hostileHost = await new Promise((accept, reject) => { get(`${app.url}/api/state`, { headers: { Host: 'example.com', 'x-review-token': app.token } }, response => { response.resume(); accept(response.statusCode); }).on('error', reject); }); assert.equal(hostileHost,403);
    // Synthetic 1x1 PNG only tests transport; the OCR boundary is injected.
    const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64');
    for (const name of ['first.png','second.png']) assert.equal((await call('/api/upload',{ name, data:bytes.toString('base64') })).status,200);
    let state = await (await call('/api/state')).json(); assert.equal(state.drafts.length,2); assert.equal(state.records.length,0);
    const before = await readFile(path,'utf8');
    const noApproval = await call('/api/save',{ expectedRevision:state.revision,selections:[selection(state.drafts[0],{ reviewed:false })] }); assert.equal(noApproval.status,400); assert.equal(await readFile(path,'utf8'),before);
    const save = await call('/api/save',{ expectedRevision:state.revision,selections:[selection(state.drafts[0],{ maxStats:{ ...fixture.maxStats, hp:9170 } })] }); assert.equal(save.status,200);
    state = await (await call('/api/state')).json(); assert.equal(state.records[0].maxStats.hp,9170); assert.equal(state.drafts[0].status,'saved'); assert.equal(state.drafts[1].status,'pending');
    assert.equal(state.records[0].reviews[0].originalStats.hp,9169);
    assert.equal((await call('/api/upload',{ name:'bad.png',data:Buffer.from('not an image').toString('base64') })).status,400);
  } finally { await app.close(); }
}));

test('captured OCR text from five screenshots keeps every numeric value and condition; manual identity review saves exact expected records', async () => temporaryStore(async path => {
  const result = JSON.parse(await readFile(new URL('./fixtures/ocr-results.json', import.meta.url), 'utf8'));
  const rows = [];
  for (const item of result.rows) {
    const truth = expected.find(value => value.file === item.file);
    assert.match(item.draft.sourceSha256, /^[a-f0-9]{64}$/); // Provenance only; source pixels are intentionally not retained.
    const row = buildDraft(item.draft, characters);
    assert.deepEqual(row.maxStats, truth.maxStats);
    for (const field of ['screen','level','levelMaximum','characterBoost','characterBoostMaximum']) assert.equal(row.conditions[field],truth.conditions[field]);
    assert.ok(row.characterId === null || row.characterId === truth.characterId, 'No wrong automatic match is allowed');
    assert.ok(row.match.status === 'matched' || row.match.candidates.some(value => value.characterId === truth.characterId));
    rows.push(row);
  }
  const snapshot = await readCatalog(path,characters);
  const selections = rows.map(row => { const truth = expected.find(value => value.file === row.sourceImage); return { draftId:row.id, characterId:truth.characterId, maxStats:row.maxStats, conditions:{...row.conditions,medalsEquipped:false}, reviewed:true }; });
  await saveApproved({path,expectedRevision:snapshot.revision,drafts:rows,selections,characters});
  const saved = await readCatalog(path,characters);
  assert.equal(saved.records.length,5);
  for (const record of saved.records) assert.deepEqual(record.maxStats,expected.find(value => value.characterId === record.characterId).maxStats);
}));

test('batch preload uses temporary image copies and removes them when the local session closes', async () => temporaryStore(async path => {
  const imagePaths = [`${path}.first.png`, `${path}.second.png`];
  for (const imagePath of imagePaths) await writeFile(imagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64'));
  const copies = [];
  const app = await startReviewServer({ catalogPath:path, imagePaths, port:0, recognize:async imagePath => { copies.push(imagePath); return evidence(); } });
  try {
    assert.equal(app.drafts.length,2);
    assert.ok(app.drafts.every(row => row.status === 'pending'));
    assert.equal(app.server.address().address,'127.0.0.1');
    for (const copy of copies) { assert.ok(!imagePaths.includes(copy)); await access(copy); }
  } finally { await app.close(); }
  for (const copy of copies) await assert.rejects(access(copy), {code:'ENOENT'});
  for (const original of imagePaths) await access(original);
}));
