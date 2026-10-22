const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getImportantTierUpdateState } = require('../src/lib/tier-important-updates');
const { importantTierUpdates } = require('../src/data/tier-important-updates');
const { tierList, visibleTierList } = require('../src/data/tierList');
const { tierListOctober10, tierListBeforeOctober22Reorder } = require('../src/data/tier-list-archive');
const { characters } = require('../src/data/characters');
const { demoUpdate, demoNow, getDemoScenario } = require('./fixtures/tier-important-updates');
const day = 24 * 60 * 60 * 1000;
const october21Events = importantTierUpdates.filter((event) => event.id !== '2026-10-22-tier-assessment-follow-up');
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
  assert.deepEqual(tierList.find(({ tier }) => tier === 'SS').characterIds, [
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

test('October 22 placements satisfy the Whitebeard, Kuzan, Garp and Blackbeard follow-ups', () => {
  const row = (tier) => tierList.find((row) => row.tier === tier);
  assert.deepEqual(row('B').characterIds.slice(0, 3), [
    'ama-no-murakumo-sword-kizaru', 'awakened-form-rob-lucci', 'the-wings-zoro-sanji',
  ]);
  const whiteNika = row('B').characterIds.indexOf('the-four-emperors-monkey-d-luffy');
  assert.ok(whiteNika >= 0);
  assert.deepEqual(row('B').characterIds.slice(whiteNika, whiteNika + 3), [
    'the-four-emperors-monkey-d-luffy', 'great-pirate-edward-newgate', 'egghead-tony-tony-chopper',
  ]);
  assert.deepEqual(row('B').characterIds.slice(3, 5), [
    'the-four-emperors-marshall-d-teach', 'king-of-the-pirates-gol-d-roger',
  ]);
  assert.deepEqual(row('C').characterIds.slice(0, 3), [
    'blackbeard-pirates-kuzan', 'legendary-hero-monkey-d-garp', 'daimyo-of-kuri-kozuki-oden',
  ]);
  assert.equal(row('A').characterIds.at(-1), 'unexpected-collaboration-rob-lucci');
  assert.notEqual(row('C').hidden, true);
  assert.deepEqual(tierList.filter((row) => row.hidden).map((row) => row.tier), ['god', 'D']);
  assert.deepEqual(visibleTierList.map((row) => row.tier), ['SS', 'S', 'A', 'B', 'C']);
});

test('October 22 reorder preserves the roster and all other characters’ relative tier order', () => {
  const moved = new Set([
    'ama-no-murakumo-sword-kizaru', 'awakened-form-rob-lucci', 'the-wings-zoro-sanji',
    'the-four-emperors-monkey-d-luffy', 'great-pirate-edward-newgate', 'blackbeard-pirates-kuzan',
    'daimyo-of-kuri-kozuki-oden', 'unexpected-collaboration-rob-lucci',
    'legendary-hero-monkey-d-garp', 'the-four-emperors-marshall-d-teach',
  ]);
  const placements = tierList.flatMap((row) => row.characterIds);
  assert.equal(new Set(placements).size, placements.length);
  assert.deepEqual([...placements].sort(), tierListBeforeOctober22Reorder.flatMap((row) => row.characterIds).sort());
  for (const row of tierList) {
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
  const current = state(october21Events, start, tierList);
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
  assert.deepEqual(state(october21Events, start + 14 * day - 1, tierList).badges, expected);
  const expired = state(october21Events, start + 14 * day, tierList);
  assert.deepEqual(expired.badges, {});
  assert.equal(expired.update, update);
});

test('October 22 explicit assessments mark the five requested characters and retain the other 12 markers', () => {
  const followUp = importantTierUpdates.find((event) => event.id === '2026-10-22-tier-assessment-follow-up');
  const start = Date.parse(followUp.publishedAt);
  const before = state(importantTierUpdates, start - 1, tierList);
  const current = state(importantTierUpdates, start, tierList);
  assert.equal(before.update.id, '2026-10-21-warcury-ju-peter-meta');
  assert.equal(Object.keys(before.badges).length, 12);
  assert.ok(Object.values(before.badges).every((badge) => badge.expiresAt === start));
  assert.equal(current.update, followUp);
  assert.equal(importantTierUpdates.length, 5);
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
  for (const [id, badge] of Object.entries(before.badges)) {
    assert.equal(current.badges[id].kind, badge.kind, id);
    assert.match(followUp.changes.find((change) => change.characterId === id).reason, /carried forward from the October 21 review/);
  }
  assert.deepEqual(Object.keys(current.badges).sort(), [...Object.keys(before.badges), ...Object.keys(requested)].sort());
  assert.deepEqual(['rise', 'fall', 'new'].map((kind) => Object.values(current.badges).filter((badge) => badge.kind === kind).length), [8, 7, 2]);
  for (const id of ['unexpected-collaboration-rob-lucci', 'daimyo-of-kuri-kozuki-oden', 'awakened-form-rob-lucci', 'great-pirate-edward-newgate', 'egghead-tony-tony-chopper']) {
    assert.equal(current.badges[id], undefined, id);
  }
  assert.equal(followUp.officialAdjustment, undefined);
  assert.match(followUp.summary, /not character buffs or nerfs/);
  assert.equal(Object.keys(state(importantTierUpdates, start + 14 * day - 1, tierList).badges).length, 17);
  const expired = state(importantTierUpdates, start + 14 * day, tierList);
  assert.deepEqual(expired.badges, {});
  assert.equal(expired.update, followUp);
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
  const current = state(importantTierUpdates, Date.parse(update.publishedAt), tierList);
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
  const latest = state(importantTierUpdates, Date.parse(followUp.publishedAt), tierList);
  for (const compact of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(ImportantTierUpdate, {update: followUp, currentTiers: latest.currentTiers, compact}));
    assert.match(html, /October 22, 2026/);
    assert.match(html, /current tiers and positions are unchanged/);
    assert.match(html, /12 other active markers are carried forward/);
    assert.match(html, /Show 14 more characters/);
    assert.equal((html.match(/Higher within tier/g) || []).length, 2);
    assert.equal((html.match(/Lower within tier/g) || []).length, 3);
    assert.doesNotMatch(html, /At publication:/);
    if (compact) assert.match(html, /8 Up · 7 Down · 2 New/);
  }
});
