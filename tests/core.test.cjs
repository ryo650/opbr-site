const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { characters } = require('../src/data/characters');
const { scouts } = require('../src/data/scouts');
const { characterGuides } = require('../src/data/character-guides');
const { tierList } = require('../src/data/tierList');
const { createScoutRoller, rollScoutMany } = require('../src/lib/scout');
const { getScoutStatus } = require('../src/lib/scout-status');
const { characterUsageSnapshots, processCharacterUsageSnapshots, filterSnapshotsByRange, buildChartData } = require('../src/data/character-usage');

function withRandom(values, run) {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[index++ % values.length];
  try { return run(); } finally { Math.random = original; }
}

test('every character is addressable by its own ID', () => {
  for (const [id, character] of Object.entries(characters)) assert.equal(character.id, id);
  assert.ok(characters['buggy-pirates-chief-of-staff-cabaji']);
  const kumaEntries = Object.values(characters).filter(c => c.image === '/characters/red/father-and-daughter-kuma-bonney.webp');
  assert.equal(kumaEntries.length, 1, 'Kuma/Bonney must not receive double weight in normal pools');
});

test('all local catalog images and guide videos exist', () => {
  const check = (value) => {
    if (typeof value === 'string' && /^\/.*\.(webp|png|jpg|mp4)$/i.test(value)) {
      assert.ok(fs.existsSync(path.join(__dirname, '../public', value)), value);
    } else if (value && typeof value === 'object') Object.values(value).forEach(check);
  };
  check({ characters, scouts, characterGuides });
});

test('tier list and guide matchups resolve, with no duplicate placements', () => {
  const placements = tierList.flatMap(row => row.characterIds);
  assert.equal(new Set(placements).size, placements.length);
  for (const id of placements) assert.ok(characters[id], id);
  for (const [id, guide] of Object.entries(characterGuides)) {
    assert.equal(id, guide.characterId);
    assert.ok(characters[id], id);
    for (const item of [...(guide.counters ?? []), ...(guide.strongAgainst ?? [])]) assert.ok(characters[item.characterId], item.characterId);
  }
});

test('all scout pickups exist and can actually be drawn at their weighted interval', () => {
  assert.equal(new Set(scouts.map(s => s.id)).size, scouts.length);
  for (const scout of scouts) {
    assert.ok(Date.parse(scout.startAt) < Date.parse(scout.endAt));
    assert.equal(new Set(scout.pickups.map(p => p.characterId)).size, scout.pickups.length);
    assert.ok(scout.pickups.some(p => p.characterId === scout.featuredCharacterId));
    const total = Object.values(scout.rates).reduce((a,b) => a+b, 0);
    const pickupTotal = scout.pickups.reduce((a,p) => a+p.rate, 0);
    assert.ok(Math.abs(scout.rates.pickup - pickupTotal) < 1e-9);
    let offset = 0;
    for (const pickup of scout.pickups) {
      assert.ok(characters[pickup.characterId], pickup.characterId);
      const result = withRandom([scout.rates.pickup / total / 2, (offset + pickup.rate / 2) / pickupTotal], createScoutRoller(scout, characters));
      assert.equal(result.id, pickup.characterId);
      offset += pickup.rate;
    }
  }
});

test('every configured category returns a character and excludes pickups from normal pools', () => {
  for (const scout of scouts) {
    const total = Object.values(scout.rates).reduce((a,b) => a+b, 0);
    let offset = 0;
    for (const [category, rate] of Object.entries(scout.rates)) {
      assert.ok(Number.isFinite(rate) && rate >= 0);
      if (!rate) continue;
      const result = withRandom([(offset + rate / 2) / total, 0.99], createScoutRoller(scout, characters));
      assert.ok(result, `${scout.id}: ${category}`);
      if (category !== 'pickup') {
        assert.equal(result.grade, category);
        assert.ok(!scout.pickups.some(p => p.characterId === result.id));
      }
      offset += rate;
    }
  }
});

test('existing non-100 totals remain relative weights as requested', () => {
  const scout = { ...scouts[0], rates: { pickup: 0.2, bf: 1.75, "star-4": 5.05, "star-3": 28, "star-2": 58 } };
  const result = withRandom([0.2 / 93 - 0.000001, 0], createScoutRoller(scout, characters));
  assert.equal(result.id, scout.featuredCharacterId);
  assert.equal(withRandom([0.5], () => rollScoutMany(scout, characters, 11)).length, 11);
});

test('scout classification respects both boundaries and explicit JST offsets', () => {
  const scout = scouts[0];
  const start = Date.parse(scout.startAt), end = Date.parse(scout.endAt);
  assert.equal(getScoutStatus(scout, start - 1), 'upcoming');
  assert.equal(getScoutStatus(scout, start), 'current');
  assert.equal(getScoutStatus(scout, end), 'current');
  assert.equal(getScoutStatus(scout, end + 1), 'past');
});

test('monthly filters clamp month ends, including leap years', () => {
  assert.deepEqual(filterSnapshotsByRange([{date:'2026-02-27'}, {date:'2026-02-28'}, {date:'2026-03-31'}], '1M').map(s => s.date), ['2026-02-28', '2026-03-31']);
  assert.deepEqual(filterSnapshotsByRange([{date:'2024-02-28'}, {date:'2024-02-29'}, {date:'2024-03-31'}], '1M').map(s => s.date), ['2024-02-29', '2024-03-31']);
  assert.deepEqual(filterSnapshotsByRange([], '1M'), []);
});

test('usage processing computes coverage and changes without mutating input', () => {
  const id = Object.keys(characters)[0];
  const input = [{date:'2026-09-02',targetPlayers:10,usage:{[id]:8}}, {date:'2026-08-26',targetPlayers:10,usage:{[id]:4}}];
  const original = structuredClone(input);
  const processed = processCharacterUsageSnapshots(input);
  assert.deepEqual(input, original);
  assert.equal(processed[1].coverage, 40);
  assert.equal(processed[1].effectivePlayerCount, 4);
  assert.equal(processed[1].ranking[0].usageRate, 200);
  assert.equal(processed[1].ranking[0].changePoints, 0);
  assert.equal(buildChartData(processed, ['not-recorded'])[0].values['not-recorded'].count, 0);
  assert.throws(() => processCharacterUsageSnapshots([{...input[0], usage:{bad:1}}]), /Unknown character/);
  assert.throws(() => processCharacterUsageSnapshots([{...input[0], usage:{[id]:-1}}]), /Invalid usage/);
  assert.equal(processCharacterUsageSnapshots(characterUsageSnapshots).length, 4);
});
