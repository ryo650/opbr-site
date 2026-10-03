const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getImportantTierUpdateState } = require('../src/lib/tier-important-updates');
const { importantTierUpdates } = require('../src/data/tier-important-updates');
const { tierList } = require('../src/data/tierList');
const { characters } = require('../src/data/characters');
const { demoUpdate, demoNow, getDemoScenario } = require('./fixtures/tier-important-updates');
const day = 24 * 60 * 60 * 1000;
const state = (events, now = demoNow, rankings = tierList) => getImportantTierUpdateState(events, rankings, now);

test('no event is inferred from rankings, drafts, invalid dates or scheduled publications', () => {
  for (const scenario of ['empty', 'draft', 'future']) {
    const { events, now } = getDemoScenario(scenario);
    assert.equal(state(events, now).update, null);
    assert.deepEqual(state(events, now).badges, {});
  }
  assert.equal(state([{ ...demoUpdate, publishedAt: 'invalid' }]).update, null);
  assert.equal(state([{ ...demoUpdate, changes: [] }]).update, null);
  assert.equal(state([], demoNow, [...tierList].reverse()).update, null);
});

test('publication is inclusive and the 14-day cutoff is exclusive, retaining the dated summary', () => {
  const start = Date.parse(demoUpdate.publishedAt);
  assert.equal(state([demoUpdate], start - 1).update, null);
  assert.equal(Object.keys(state([demoUpdate], start).badges).length, 5);
  assert.equal(Object.keys(state([demoUpdate], start + 14 * day - 1).badges).length, 5);
  const expired = state([demoUpdate], start + 14 * day);
  assert.deepEqual(expired.badges, {});
  assert.equal(expired.update.id, demoUpdate.id);
});

test('latest explicit published event wins, and replaces all prior badges at its timestamp', () => {
  const next = { ...demoUpdate, id: 'next', publishedAt: '2026-10-03T00:00:00Z', changes: [demoUpdate.changes[3]] };
  const cutoff = Date.parse(next.publishedAt);
  const before = state([next, demoUpdate], cutoff - 1);
  assert.equal(before.update.id, demoUpdate.id);
  assert.ok(Object.values(before.badges).every((badge) => badge.expiresAt === cutoff));
  const after = state([demoUpdate, next], cutoff);
  assert.equal(after.update.id, 'next');
  assert.deepEqual(Object.keys(after.badges), ['seraphim-s-snake']);
  const draft = { ...next, status: 'draft' };
  assert.equal(state([demoUpdate, draft], cutoff).update.id, demoUpdate.id);
  assert.equal(Object.values(state([demoUpdate, draft]).badges)[0].expiresAt, Date.parse(demoUpdate.publishedAt) + 14 * day);
});

test('historical tier mismatch or removal suppresses misleading badges without rewriting the event', () => {
  const { events, now } = getDemoScenario('mismatch');
  const result = state(events, now);
  const id = demoUpdate.changes[0].characterId;
  assert.equal(result.badges[id], undefined);
  assert.equal(result.currentTiers[id], 'SS');
  assert.equal(result.update.changes[0].toTier, 'S');
  const removed = tierList.map((row) => ({ ...row, characterIds: row.characterIds.filter((characterId) => characterId !== id) }));
  assert.equal(state([demoUpdate], now, removed).badges[id], undefined);
});

test('all four editorial change kinds are represented; same-tier adjustment can receive a marker', () => {
  assert.deepEqual(new Set(Object.values(state([demoUpdate]).badges).map((badge) => badge.kind)), new Set(['rise', 'fall', 'new', 'adjustment']));
});

test('registered production events have explicit, coherent editorial data and official sources', () => {
  const ranks = ['god', 'SS', 'S', 'A', 'B', 'C', 'D'];
  const ids = new Set();
  for (const event of importantTierUpdates) {
    assert.ok(event.id && !ids.has(event.id));
    ids.add(event.id);
    assert.match(event.publishedAt, /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/);
    assert.ok(Number.isFinite(Date.parse(event.publishedAt)));
    assert.ok(event.title.trim() && event.summary.trim() && event.changes.length);
    assert.ok(['draft', 'published'].includes(event.status));
    if (event.officialAdjustment) {
      assert.match(event.officialAdjustment.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(event.officialAdjustment.summary.trim());
      assert.equal(new URL(event.officialAdjustment.sourceUrl).protocol, 'https:');
    }
    const affected = new Set();
    for (const change of event.changes) {
      assert.ok(characters[change.characterId] && !affected.has(change.characterId));
      affected.add(change.characterId);
      assert.ok(change.reason.trim() && ranks.includes(change.toTier));
      if (change.kind === 'new') assert.equal(change.fromTier, null);
      else assert.ok(ranks.includes(change.fromTier));
      if (change.kind === 'rise') assert.ok(ranks.indexOf(change.toTier) < ranks.indexOf(change.fromTier));
      else if (change.kind === 'fall') assert.ok(ranks.indexOf(change.toTier) > ranks.indexOf(change.fromTier));
      else if (change.kind === 'adjustment') assert.equal(change.fromTier, change.toTier);
      else assert.equal(change.kind, 'new');
    }
  }
});
