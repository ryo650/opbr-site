const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getImportantTierUpdateState } = require('../src/lib/tier-important-updates');
const { importantTierUpdates } = require('../src/data/tier-important-updates');
const { tierList, visibleTierList } = require('../src/data/tierList');
const { tierListOctober10, tierListBeforeOctober22Reorder, tierListOctober22, tierListNovember4 } = require('../src/data/tier-list-archive');
const { characters } = require('../src/data/characters');
const { demoUpdate, demoNow, getDemoScenario } = require('./fixtures/tier-important-updates');
const day = 24 * 60 * 60 * 1000;
const october21Events = importantTierUpdates.filter((event) => event.publishedAt < '2026-10-22');
const october22Events = importantTierUpdates.filter((event) => event.publishedAt < '2026-10-23');
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
  const result = state([event], Date.parse(event.publishedAt), tierListOctober10);
  assert.equal(result.badges['blackbeard-pirates-kuzan'].kind, 'rise');
  assert.equal(result.update.changes[0].toTier, 'A');
});

test('October 10 meta follow-up retains the October 8 review and marks both same-tier directions', () => {
  const followUp = importantTierUpdates.find((event) => event.id === '2026-10-10-oden-meta-follow-up');
  const october8 = importantTierUpdates.find((event) => event.id === '2026-10-08-post-buff-tier-review');
  assert.deepEqual(followUp.changes.slice(2), october8.changes);
  assert.equal(followUp.changes.length, 9);
  assert.equal(followUp.officialAdjustment, undefined);
  const historicalEvents = [followUp, october8];
  const start = Date.parse(followUp.publishedAt);
  assert.equal(state(historicalEvents, start - 1, tierListOctober10).update.id, october8.id);
  const result = state(historicalEvents, start, tierListOctober10);
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
  assert.deepEqual(tierListOctober10.find((row) => row.tier === 'S').characterIds, [
    'the-five-elders-st-marcus-mars',
    'future-where-i-m-the-most-free-jewelry-bonney',
    'the-wings-zoro-sanji',
  ]);
  assert.equal(Object.keys(state(historicalEvents, start + 14 * day - 1, tierListOctober10).badges).length, 9);
  assert.deepEqual(state(historicalEvents, start + 14 * day, tierListOctober10).badges, {});
});

test('October 21 meta review retains 8 rises, 7 falls and 2 new entries', () => {
  const update = importantTierUpdates.find((event) => event.id === '2026-10-21-warcury-ju-peter-meta');
  const start = Date.parse(update.publishedAt);
  assert.equal(state(october21Events, start - 1, tierListBeforeOctober22Reorder).update.id, '2026-10-10-oden-meta-follow-up');
  const result = state(october21Events, start, tierListBeforeOctober22Reorder);
  assert.equal(result.update.id, update.id);
  assert.deepEqual(tierListBeforeOctober22Reorder.find(({ tier }) => tier === 'SS').characterIds, [
    'the-five-elders-st-topman-warcury',
    'the-five-elders-st-shepherd-ju-peter',
  ]);
  const warcury = update.changes.find(({ characterId }) => characterId === 'the-five-elders-st-topman-warcury');
  const peter = update.changes.find(({ characterId }) => characterId === 'the-five-elders-st-shepherd-ju-peter');
  assert.match(warcury.reason, /at the top of/);
  assert.match(peter.reason, /immediately after St. Topman Warcury/);
  const expected = {
    rise: ['flame-emperor-sabo', 'winner-island-trafalgar-law', 'unexpected-collaboration-rob-lucci', 'king-of-the-pirates-gol-d-roger', 'legendary-hero-monkey-d-garp', 'film-red-shanks', 'ama-no-murakumo-sword-kizaru', 'navy-hq-fleet-admiral-akainu'],
    fall: ['the-five-elders-st-ethanbaron-v-nusjuro', 'the-four-emperors-monkey-d-luffy', 'the-wings-zoro-sanji', 'blackbeard-pirates-kuzan', 'father-and-daughter-kuma-bonny', 'daimyo-of-kuri-kozuki-oden', 'the-four-emperors-marshall-d-teach'],
    new: ['the-five-elders-st-shepherd-ju-peter', 'the-five-elders-st-topman-warcury'],
  };
  for (const [kind, ids] of Object.entries(expected)) {
    assert.deepEqual(Object.keys(result.badges).filter((id) => result.badges[id].kind === kind).sort(), [...ids].sort());
  }
  assert.equal(Object.keys(result.badges).length, 17);
  assert.equal(update.officialAdjustment, undefined);
  assert.match(update.summary, /relative ranking/);
  assert.match(update.summary, /not character buffs or nerfs/);
  assert.equal(result.badges['the-five-elders-st-marcus-mars'], undefined);
  assert.equal(result.badges['seraphim-s-snake'], undefined);
  assert.equal(result.badges['ama-no-murakumo-sword-kizaru'].kind, 'rise');
  assert.equal(result.badges['navy-hq-fleet-admiral-akainu'].kind, 'rise');
  assert.equal(result.badges['animal-kingdom-pirates-lead-performer-king'], undefined);
  assert.equal(result.badges['the-red-broggy'], undefined);
  assert.equal(result.badges['the-four-emperors-marshall-d-teach'].kind, 'fall');
  assert.equal(result.badges['red-rock-monkey-d-luffy'], undefined);
  assert.equal(result.badges['happy-halloween-uta'], undefined);
  assert.equal(result.badges['the-four-emperors-monkey-d-luffy'].kind, 'fall');
  assert.equal(result.badges['the-wings-zoro-sanji'].kind, 'fall');
  assert.equal(Object.keys(state(october21Events, start + 14 * day - 1, tierListBeforeOctober22Reorder).badges).length, 17);
  assert.deepEqual(state(october21Events, start + 14 * day, tierListBeforeOctober22Reorder).badges, {});
});

test('October 22 placements satisfy all follow-ups, with blue Lucci last in B', () => {
  const row = (tier) => tierListOctober22.find((row) => row.tier === tier);
  assert.deepEqual(row('B').characterIds.slice(0, 3), [
    'ama-no-murakumo-sword-kizaru', 'the-wings-zoro-sanji', 'the-four-emperors-marshall-d-teach',
  ]);
  assert.equal(row('B').characterIds.at(-1), 'awakened-form-rob-lucci');
  const whiteNika = row('B').characterIds.indexOf('the-four-emperors-monkey-d-luffy');
  assert.ok(whiteNika >= 0);
  assert.deepEqual(row('B').characterIds.slice(whiteNika, whiteNika + 3), [
    'the-four-emperors-monkey-d-luffy', 'great-pirate-edward-newgate', 'egghead-tony-tony-chopper',
  ]);
  assert.deepEqual(row('B').characterIds.slice(2, 4), [
    'the-four-emperors-marshall-d-teach', 'king-of-the-pirates-gol-d-roger',
  ]);
  assert.deepEqual(row('C').characterIds.slice(0, 3), [
    'blackbeard-pirates-kuzan', 'legendary-hero-monkey-d-garp', 'daimyo-of-kuri-kozuki-oden',
  ]);
  assert.equal(row('A').characterIds.at(-1), 'unexpected-collaboration-rob-lucci');
  assert.notEqual(row('C').hidden, true);
  assert.deepEqual(tierListOctober22.filter((row) => row.hidden).map((row) => row.tier), ['god', 'D']);
});

test('October 22 reorder preserves the roster and all other characters’ relative tier order', () => {
  const moved = new Set([
    'ama-no-murakumo-sword-kizaru', 'awakened-form-rob-lucci', 'the-wings-zoro-sanji',
    'the-four-emperors-monkey-d-luffy', 'great-pirate-edward-newgate', 'blackbeard-pirates-kuzan',
    'daimyo-of-kuri-kozuki-oden', 'unexpected-collaboration-rob-lucci',
    'legendary-hero-monkey-d-garp', 'the-four-emperors-marshall-d-teach',
  ]);
  const placements = tierListOctober22.flatMap((row) => row.characterIds);
  assert.equal(new Set(placements).size, placements.length);
  assert.deepEqual([...placements].sort(), tierListBeforeOctober22Reorder.flatMap((row) => row.characterIds).sort());
  for (const row of tierListOctober22) {
    for (const id of row.characterIds) assert.ok(characters[id], id);
    const previous = tierListBeforeOctober22Reorder.find((old) => old.tier === row.tier);
    assert.equal(row.colorClass, previous.colorClass);
    assert.equal(row.hidden, previous.hidden);
    assert.deepEqual(row.characterIds.filter((id) => !moved.has(id)), previous.characterIds.filter((id) => !moved.has(id)));
  }
  assert.equal(placements.includes('red-rock-monkey-d-luffy'), false);
  assert.equal(characters['red-rock-monkey-d-luffy']?.element, 'black');
  for (const row of tierListOctober10) {
    for (const id of row.characterIds) assert.ok(characters[id], id);
  }
  assert.equal(tierListOctober10.find((row) => row.tier === 'D').characterIds.length, 6);
  assert.equal(tierListOctober10.find((row) => row.tier === 'C').characterIds.length, 13);
});

test('October 22 reorder retains the five historical tier mismatches before the explicit marker follow-up', () => {
  const update = importantTierUpdates.find((event) => event.id === '2026-10-21-warcury-ju-peter-meta');
  const start = Date.parse(update.publishedAt);
  const previous = state(october21Events, start, tierListBeforeOctober22Reorder);
  const current = state(october21Events, start, tierListOctober22);
  assert.equal(current.update, update);
  assert.equal(october21Events.length, 4);
  assert.equal(update.changes.length, 17);
  const suppressed = [
    'unexpected-collaboration-rob-lucci', 'the-four-emperors-monkey-d-luffy', 'daimyo-of-kuri-kozuki-oden',
    'legendary-hero-monkey-d-garp', 'blackbeard-pirates-kuzan',
  ];
  const expected = { ...previous.badges };
  for (const id of suppressed) {
    assert.ok(expected[id]);
    delete expected[id];
    assert.notEqual(current.currentTiers[id], update.changes.find((change) => change.characterId === id).toTier);
  }
  assert.deepEqual(current.badges, expected);
  assert.equal(Object.keys(current.badges).length, 12);
  assert.equal(current.badges['ama-no-murakumo-sword-kizaru'].kind, 'rise');
  assert.equal(current.badges['the-wings-zoro-sanji'].kind, 'fall');
  assert.equal(current.badges['the-four-emperors-marshall-d-teach'].kind, 'fall');
  for (const id of ['awakened-form-rob-lucci', 'great-pirate-edward-newgate', 'egghead-tony-tony-chopper']) {
    assert.equal(current.badges[id], undefined);
  }
  assert.deepEqual(state(october21Events, start + 14 * day - 1, tierListOctober22).badges, expected);
  const expired = state(october21Events, start + 14 * day, tierListOctober22);
  assert.deepEqual(expired.badges, {});
  assert.equal(expired.update, update);
});

test('October 22 explicit assessments carry prior markers whose placements still match', () => {
  const followUp = importantTierUpdates.find((event) => event.id === '2026-10-22-tier-assessment-follow-up');
  const start = Date.parse(followUp.publishedAt);
  const before = state(october22Events, start - 1, tierListOctober22);
  const current = state(october22Events, start, tierListOctober22);
  assert.equal(before.update.id, '2026-10-21-warcury-ju-peter-meta');
  assert.equal(Object.keys(before.badges).length, 12);
  assert.ok(Object.values(before.badges).every((badge) => badge.expiresAt === start));
  assert.equal(current.update, followUp);
  assert.equal(october22Events.length, 5);
  assert.equal(followUp.changes.length, 17);
  assert.equal(new Set(followUp.changes.map((change) => change.characterId)).size, 17);
  const requested = {
    'the-four-emperors-monkey-d-luffy': ['fall', 'B'],
    'blackbeard-pirates-kuzan': ['fall', 'C'],
    'great-pirate-gol-d-roger': ['fall', 'C'],
    'legendary-hero-monkey-d-garp': ['rise', 'C'],
    'animal-kingdom-pirates-lead-performer-king': ['rise', 'A'],
  };
  for (const [id, [kind, tier]] of Object.entries(requested)) {
    assert.equal(current.badges[id].kind, kind, id);
    const change = followUp.changes.find((change) => change.characterId === id);
    assert.equal(change.fromTier, tier);
    assert.equal(change.toTier, tier);
    assert.equal(current.currentTiers[id], tier);
    assert.match(change.reason, /tier and position are unchanged/);
  }
  // The later Kizaru correction records A. The archived October 22 table had him in B.
  const kizaru = 'ama-no-murakumo-sword-kizaru';
  assert.equal(before.badges[kizaru].kind, 'rise');
  assert.equal(current.badges[kizaru], undefined);
  const retained = Object.entries(before.badges).filter(([id]) => id !== kizaru);
  for (const [id, badge] of retained) {
    assert.equal(current.badges[id].kind, badge.kind, id);
    assert.match(followUp.changes.find((change) => change.characterId === id).reason, /carried forward from the October 21 review/);
  }
  assert.deepEqual(Object.keys(current.badges).sort(), [...retained.map(([id]) => id), ...Object.keys(requested)].sort());
  assert.deepEqual(['rise', 'fall', 'new'].map((kind) => Object.values(current.badges).filter((badge) => badge.kind === kind).length), [7, 7, 2]);
  for (const id of ['unexpected-collaboration-rob-lucci', 'daimyo-of-kuri-kozuki-oden', 'awakened-form-rob-lucci', 'great-pirate-edward-newgate', 'egghead-tony-tony-chopper']) {
    assert.equal(current.badges[id], undefined, id);
  }
  assert.equal(followUp.officialAdjustment, undefined);
  assert.match(followUp.summary, /not character buffs or nerfs/);
  assert.equal(Object.keys(state(october22Events, start + 14 * day - 1, tierListOctober22).badges).length, 16);
  const expired = state(october22Events, start + 14 * day, tierListOctober22);
  assert.deepEqual(expired.badges, {});
  assert.equal(expired.update, followUp);
});

test('current placements put awakened Lucci first in S and FILM RED Shanks last', () => {
  const placements = tierList.flatMap(({ characterIds }) => characterIds);
  assert.equal(placements.length, 32);
  assert.equal(new Set(placements).size, placements.length);
  assert.ok(placements.every((id) => characters[id]));
  assert.deepEqual(tierList.map(({ tier, characterIds }) => [tier, characterIds]), [
    ['god', []],
    ['SS', [
      'the-five-elders-st-shepherd-ju-peter', 'future-where-i-m-the-most-free-jewelry-bonney',
    ]],
    ['S', ['awakened-form-rob-lucci', 'the-five-elders-st-topman-warcury', 'flame-emperor-sabo', 'film-red-shanks']],
    ['A', [
      'the-four-emperors-monkey-d-luffy', 'winner-island-trafalgar-law',
      'animal-kingdom-pirates-lead-performer-king', 'the-five-elders-st-marcus-mars', 'unexpected-collaboration-rob-lucci',
    ]],
    ['B', [
      'the-five-elders-st-ethanbaron-v-nusjuro', 'battle-of-monsters-on-onigashima-kaido', 'the-wings-zoro-sanji',
      'ama-no-murakumo-sword-kizaru', 'great-pirate-edward-newgate', 'king-of-the-pirates-gol-d-roger',
      'kaido-s-son-yamato', 'father-and-daughter-kuma-bonny', 'egghead-sanji', 'egghead-tony-tony-chopper',
      'the-four-emperors-marshall-d-teach', 'happy-halloween-uta',
    ]],
    ['C', [
      'genius-scientist-vegapunk', 'great-pirate-gol-d-roger', 'legendary-hero-monkey-d-garp',
      'asl-ace-sabo-luffy', 'blackbeard-pirates-kuzan',
      'red-rock-monkey-d-luffy', 'navy-hq-fleet-admiral-akainu',
      'man-who-dreams-of-becoming-the-king-of-the-pirates-monkey-d-luffy', 'divine-departure-shanks',
    ]],
    ['D', []],
  ]);
  assert.deepEqual(visibleTierList.map(({ tier }) => tier), ['SS', 'S', 'A', 'B', 'C']);
});

const rankingsBeforeLucciMove = tierList.map((row) => ({
  ...row,
  characterIds: row.tier === 'SS'
    ? [...row.characterIds, 'awakened-form-rob-lucci']
    : row.characterIds.filter((id) => id !== 'awakened-form-rob-lucci'),
}));

test('November 12 shows the requested markers after removing nine directions and both New markers', () => {
  const update = importantTierUpdates.find(({ id }) => id === '2026-11-12-shanks-lucci-tier-review');
  const start = Date.parse(update.publishedAt);
  const before = state(importantTierUpdates, start - 1, tierListNovember4);
  const previousRankings = rankingsBeforeLucciMove.map((row) => ({
    ...row,
    characterIds: row.tier === 'A'
      ? ['film-red-shanks', ...row.characterIds]
      : row.characterIds.filter((id) => id !== 'film-red-shanks' && id !== 'genius-scientist-vegapunk'),
  }));
  const after = state(importantTierUpdates, start, previousRankings);
  const ranks = tierList.map(({ tier }) => tier);
  assert.equal(before.update.id, '2026-11-04-ryokugyu-b-tier-rise');
  assert.equal(after.update, update);
  assert.equal(before.badges['the-five-elders-st-topman-warcury'].kind, 'new');
  assert.equal(before.badges['the-five-elders-st-shepherd-ju-peter'].kind, 'new');
  assert.equal(after.badges['the-five-elders-st-topman-warcury'].kind, 'fall');
  assert.equal(after.badges['the-five-elders-st-shepherd-ju-peter'], undefined);

  const removedMarkers = new Set([
    'the-wings-zoro-sanji',
    'ama-no-murakumo-sword-kizaru',
    'egghead-sanji',
    'father-and-daughter-kuma-bonny',
    'the-four-emperors-marshall-d-teach',
    'great-pirate-gol-d-roger',
    'legendary-hero-monkey-d-garp',
    'asl-ace-sabo-luffy',
    'red-rock-monkey-d-luffy',
  ]);
  for (const id of removedMarkers) {
    assert.ok(after.currentTiers[id], id);
    assert.equal(after.badges[id], undefined, id);
    assert.ok(!update.changes.some(({ characterId }) => characterId === id), id);
  }

  for (const [id, toTier] of Object.entries(after.currentTiers)) {
    if (removedMarkers.has(id)) continue;
    const fromTier = before.currentTiers[id];
    const previousKind = before.badges[id]?.kind;
    if (fromTier === toTier) {
      assert.equal(after.badges[id]?.kind, previousKind === 'new' ? undefined : previousKind, id);
    } else {
      const kind = !fromTier || ranks.indexOf(toTier) < ranks.indexOf(fromTier) ? 'rise' : 'fall';
      const change = update.changes.find(({ characterId }) => characterId === id);
      assert.equal(after.badges[id].kind, kind, id);
      assert.equal(change.fromTier, fromTier ?? null, id);
      assert.equal(change.toTier, toTier, id);
    }
  }
  assert.equal(Object.keys(after.badges).length, 15);
  assert.ok(Object.keys(after.badges).every((id) => after.currentTiers[id]));
});

test('the November 14 follow-up marks the Shanks promotion and carries the other active markers', () => {
  const update = importantTierUpdates.find(({ id }) => id === '2026-11-14-film-red-shanks-s-tier');
  const previous = importantTierUpdates.find(({ id }) => id === '2026-11-12-shanks-lucci-tier-review');
  const start = Date.parse(update.publishedAt);
  const result = state(importantTierUpdates, start, rankingsBeforeLucciMove);
  assert.equal(result.update, update);
  assert.deepEqual(update.changes[0], {
    characterId: 'film-red-shanks', kind: 'rise', fromTier: 'A', toTier: 'S',
  });
  assert.deepEqual(update.changes.slice(1), previous.changes.filter(({ characterId }) => characterId !== 'film-red-shanks'));
  assert.equal(result.currentTiers['film-red-shanks'], 'S');
  assert.equal(result.badges['film-red-shanks'].kind, 'rise');
  assert.equal(result.badges['genius-scientist-vegapunk'], undefined);
  assert.equal(Object.keys(result.badges).length, 15);
});

test('the Lucci follow-up replaces his Up marker with Down and preserves all fourteen other markers', () => {
  const update = importantTierUpdates.find(({ id }) => id === '2026-11-14-awakened-lucci-s-tier');
  const start = Date.parse(update.publishedAt);
  const before = state(importantTierUpdates, start - 1, rankingsBeforeLucciMove);
  const after = state(importantTierUpdates, start, tierList);
  const lucci = 'awakened-form-rob-lucci';
  assert.equal(before.badges[lucci].kind, 'rise');
  assert.equal(after.update, update);
  assert.deepEqual(update.changes[0], {
    characterId: lucci, kind: 'fall', fromTier: 'SS', toTier: 'S',
  });
  assert.equal(after.currentTiers[lucci], 'S');
  assert.deepEqual(
    Object.fromEntries(Object.entries(after.badges).map(([id, badge]) => [id, badge.kind])),
    { ...Object.fromEntries(Object.entries(before.badges).map(([id, badge]) => [id, badge.kind])), [lucci]: 'fall' },
  );
  assert.deepEqual(state(importantTierUpdates, start + 14 * day, tierList).badges, {});
});

test('dated public summary preserves history and distinguishes it from current tiers and ordering', () => {
  const fs = require('node:fs');
  const ts = require('typescript');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  require.extensions['.tsx'] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
  require.extensions['.css'] = module => { module.exports = {}; };
  const ImportantTierUpdate = require('../src/components/tier-list/ImportantTierUpdate.tsx').default;
  const update = importantTierUpdates.find((event) => event.id === '2026-10-21-warcury-ju-peter-meta');
  const current = state(october22Events, Date.parse(update.publishedAt), tierListOctober22);
  for (const compact of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(ImportantTierUpdate, {update, currentTiers: current.currentTiers, compact}));
    assert.match(html, /assessment at publication, including order within tiers/);
    assert.match(html, /Current placements and order are shown in the Tier List above/);
    assert.match(html, /October 21, 2026/);
    assert.match(html, /At publication: S. Current tier: A/);
    assert.match(html, /At publication: C. Current tier: B/);
    assert.match(html, /At publication: B. Current tier: C/);
    assert.match(html, /Show 14 more characters/);
    if (compact) assert.match(html, /8 Up · 7 Down · 2 New/);
    else assert.match(html, /Zoro &amp; Sanji move to the end of B Tier/);
  }
  const followUp = importantTierUpdates.find((event) => event.id === '2026-10-22-tier-assessment-follow-up');
  const latest = state(october22Events, Date.parse(followUp.publishedAt), tierListOctober22);
  for (const compact of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(ImportantTierUpdate, {update: followUp, currentTiers: latest.currentTiers, compact}));
    assert.match(html, /October 22, 2026/);
    assert.match(html, /current tiers and positions are unchanged/);
    assert.match(html, /12 other active markers are carried forward/);
    assert.match(html, /Show 14 more characters/);
    assert.equal((html.match(/Higher within tier/g) || []).length, 2);
    assert.equal((html.match(/Lower within tier/g) || []).length, 3);
    assert.match(html, /At publication: A. Current tier: B/);
    if (compact) assert.match(html, /8 Up · 7 Down · 2 New/);
  }
});
