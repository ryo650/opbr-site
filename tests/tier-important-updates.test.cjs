const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getImportantTierUpdateState } = require('../src/lib/tier-important-updates');
const { importantTierUpdates } = require('../src/data/tier-important-updates');
const { tierList } = require('../src/data/tierList');
const { characters } = require('../src/data/characters');
const { demoUpdate, demoNow, getDemoScenario } = require('./fixtures/tier-important-updates');
const day = 24 * 60 * 60 * 1000;
// Synthetic scenarios need synthetic placements, independent of live editorial changes.
const demoRankings = tierList.map((row) => ({
  ...row,
  characterIds: [
    ...row.characterIds.filter((id) => !demoUpdate.changes.some((change) => change.characterId === id)),
    ...demoUpdate.changes.filter((change) => change.toTier === row.tier).map((change) => change.characterId),
  ],
}));
const state = (events, now = demoNow, rankings = demoRankings) => getImportantTierUpdateState(events, rankings, now);

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
  const removed = demoRankings.map((row) => ({ ...row, characterIds: row.characterIds.filter((characterId) => characterId !== id) }));
  assert.equal(state([demoUpdate], now, removed).badges[id], undefined);
});

test('all four editorial change kinds are represented; same-tier adjustment can receive a marker', () => {
  assert.deepEqual(new Set(Object.values(state([demoUpdate]).badges).map((badge) => badge.kind)), new Set(['rise', 'fall', 'new', 'adjustment']));
});

test('rise can represent an existing character moving from unranked into a tier', () => {
  const event = {
    ...demoUpdate,
    id: 'unranked-rise',
    changes: [{
      characterId: 'happy-halloween-uta',
      kind: 'rise',
      fromTier: null,
      toTier: 'B',
      reason: 'Buffed into the ranked list.',
    }],
  };
  const result = state([event], Date.parse(event.publishedAt), [{ tier: 'B', characterIds: ['happy-halloween-uta'] }]);
  assert.equal(result.badges['happy-halloween-uta'].kind, 'rise');
  assert.equal(result.update.changes[0].fromTier, null);
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
      assert.ok(ranks.includes(change.toTier));
      if (change.reason !== undefined) assert.ok(change.reason.trim());
      if (change.kind === 'new') assert.equal(change.fromTier, null);
      else if (!(change.kind === 'rise' && change.fromTier === null)) assert.ok(ranks.includes(change.fromTier));
      if (change.kind === 'rise') {
        if (change.fromTier !== null) assert.ok(ranks.indexOf(change.toTier) <= ranks.indexOf(change.fromTier));
      } else if (change.kind === 'fall') assert.ok(ranks.indexOf(change.toTier) >= ranks.indexOf(change.fromTier));
      else if (change.kind === 'adjustment') assert.equal(change.fromTier, change.toTier);
      else assert.equal(change.kind, 'new');
    }
  }
});

test('buffed characters can rise within a tier and receive an UP badge', () => {
  const event = {
    ...demoUpdate,
    id: 'within-tier-rise',
    changes: [{
      characterId: 'blackbeard-pirates-kuzan',
      kind: 'rise',
      fromTier: 'A',
      toTier: 'A',
      reason: 'Moved higher in A after buffs.',
    }],
  };
  const result = state([event], Date.parse(event.publishedAt));
  assert.equal(result.badges['blackbeard-pirates-kuzan'].kind, 'rise');
  assert.equal(result.update.changes[0].toTier, 'A');
});

test('October 10 meta follow-up retains the October 8 review and marks both same-tier directions', () => {
  const followUp = importantTierUpdates.find((event) => event.id === '2026-10-10-oden-meta-follow-up');
  const october8 = importantTierUpdates.find((event) => event.id === '2026-10-08-post-buff-tier-review');
  assert.deepEqual(followUp.changes.slice(2), october8.changes);
  assert.equal(followUp.changes.length, 9);
  assert.equal(followUp.officialAdjustment, undefined);
  const start = Date.parse(followUp.publishedAt);
  assert.equal(state(importantTierUpdates, start - 1, tierList).update.id, october8.id);
  const result = state(importantTierUpdates, start, tierList);
  assert.equal(result.update.id, followUp.id);
  assert.equal(Object.keys(result.badges).length, 9);
  for (const [id, kind] of [['the-wings-zoro-sanji', 'fall'], ['the-five-elders-st-marcus-mars', 'rise']]) {
    const change = followUp.changes.find((item) => item.characterId === id);
    assert.equal(change.fromTier, 'S');
    assert.equal(change.toTier, 'S');
    assert.equal(change.kind, kind);
    assert.equal(result.badges[id].kind, kind);
    assert.match(change.reason, /Oden's buff/);
    assert.match(change.reason, /not received a balance adjustment/);
  }
  assert.deepEqual(tierList.find((row) => row.tier === 'S').characterIds, [
    'the-five-elders-st-marcus-mars',
    'future-where-i-m-the-most-free-jewelry-bonney',
    'the-wings-zoro-sanji',
  ]);
  assert.equal(Object.keys(state(importantTierUpdates, start + 14 * day - 1, tierList).badges).length, 9);
  assert.deepEqual(state(importantTierUpdates, start + 14 * day, tierList).badges, {});
});
