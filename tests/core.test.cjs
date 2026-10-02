const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { characters } = require('../src/data/characters');
const { scouts } = require('../src/data/scouts');
const {
  characterGuides,
  hasCharacterGuide,
} = require('../src/data/character-guides');
const {
  getActiveNewCharacterReleases,
  getNewCharacterExpiry,
  newCharacterReleases,
} = require('../src/data/new-characters');
const { tierList } = require('../src/data/tierList');
const {
  createScoutRoller,
  rollScoutMany,
} = require('../src/lib/scout');
const { getScoutStatus } = require('../src/lib/scout-status');
const {
  characterUsageSnapshots,
  processCharacterUsageSnapshots,
  filterSnapshotsByRange,
  buildChartData,
} = require('../src/data/character-usage');

function withRandom(values, run) {
  const original = Math.random;
  let index = 0;

  Math.random = () => values[index++ % values.length];

  try {
    return run();
  } finally {
    Math.random = original;
  }
}

test('every character is addressable by its own ID', () => {
  for (const [id, character] of Object.entries(characters)) {
    assert.equal(character.id, id);
  }

  assert.ok(characters['buggy-pirates-chief-of-staff-cabaji']);

  const kumaEntries = Object.values(characters).filter(
    (character) =>
      character.image ===
      '/characters/red/father-and-daughter-kuma-bonney.webp',
  );

  assert.equal(
    kumaEntries.length,
    1,
    'Kuma/Bonney must not receive double weight in normal pools',
  );
});

test('all local catalog images and guide videos exist', () => {
  const check = (value) => {
    if (
      typeof value === 'string' &&
      /^\/.*\.(webp|png|jpg|mp4)$/i.test(value)
    ) {
      assert.ok(
        fs.existsSync(path.join(__dirname, '../public', value)),
        value,
      );
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(check);
    }
  };

  check({
    characters,
    scouts,
    characterGuides,
  });
});

test('tier list and guide matchups resolve, with no duplicate placements', () => {
  const placements = tierList.flatMap((row) => row.characterIds);

  assert.equal(new Set(placements).size, placements.length);

  for (const id of placements) {
    assert.ok(characters[id], id);
  }

  for (const [id, guide] of Object.entries(characterGuides)) {
    assert.equal(id, guide.characterId);
    assert.ok(characters[id], id);

    for (const item of [
      ...(guide.counters ?? []),
      ...(guide.strongAgainst ?? []),
    ]) {
      assert.ok(
        characters[item.characterId],
        item.characterId,
      );
    }
  }
});

test('character guide availability follows the guide registry', () => {
  assert.equal(
    hasCharacterGuide('seraphim-s-snake'),
    true,
  );

  assert.equal(
    hasCharacterGuide('the-five-elders-st-marcus-mars'),
    true,
  );

  assert.equal(
    hasCharacterGuide('navy-hq-fleet-admiral-akainu'),
    false,
  );
});

test('new characters resolve to guides and remain listed for exactly two calendar months', () => {
  for (const release of newCharacterReleases) {
    assert.ok(
      characters[release.characterId],
      release.characterId,
    );

    assert.ok(
      characterGuides[release.characterId],
      release.characterId,
    );

    assert.match(
      release.releaseDate,
      /^\d{4}-\d{2}-\d{2}$/,
    );
  }

  assert.equal(
    getNewCharacterExpiry('2026-07-29').toISOString(),
    '2026-09-29T00:00:00.000Z',
  );

  assert.equal(
    getNewCharacterExpiry('2026-12-31').toISOString(),
    '2027-02-28T00:00:00.000Z',
  );

  assert.deepEqual(
    getActiveNewCharacterReleases(
      new Date('2026-09-21T00:00:00.000Z'),
    ).map((item) => item.characterId),
    [
      'future-where-i-m-the-most-free-jewelry-bonney',
      'the-five-elders-st-marcus-mars',
    ],
  );

  assert.deepEqual(
    getActiveNewCharacterReleases(
      new Date('2026-09-29T00:00:00.000Z'),
    ).map((item) => item.characterId),
    [
      'future-where-i-m-the-most-free-jewelry-bonney',
    ],
  );
});

test('all scout pickups exist and can actually be drawn at their weighted interval', () => {
  assert.equal(
    new Set(scouts.map((scout) => scout.id)).size,
    scouts.length,
  );

  for (const scout of scouts) {
    assert.ok(
      Date.parse(scout.startAt) < Date.parse(scout.endAt),
    );

    assert.equal(
      new Set(
        scout.pickups.map((pickup) => pickup.characterId),
      ).size,
      scout.pickups.length,
    );

    assert.ok(
      scout.pickups.some(
        (pickup) =>
          pickup.characterId === scout.featuredCharacterId,
      ),
    );

    const total = Object.values(scout.rates).reduce(
      (a, b) => a + b,
      0,
    );

    const pickupTotal = scout.pickups.reduce(
      (a, pickup) => a + pickup.rate,
      0,
    );

    assert.ok(
      Math.abs(
        scout.rates.pickup - pickupTotal,
      ) <= 0.001,
      `${scout.id} pickup total exceeds the importer display-precision tolerance`,
    );

    let offset = 0;

    for (const pickup of scout.pickups) {
      assert.ok(
        characters[pickup.characterId],
        pickup.characterId,
      );

      const result = withRandom(
        [
          scout.rates.pickup / total / 2,
          (offset + pickup.rate / 2) / pickupTotal,
        ],
        createScoutRoller(scout, characters),
      );

      assert.equal(
        result.id,
        pickup.characterId,
      );

      offset += pickup.rate;
    }
  }
});

test('every configured category returns a character and excludes pickups from normal pools', () => {
  for (const scout of scouts) {
    const total = Object.values(scout.rates).reduce(
      (a, b) => a + b,
      0,
    );

    let offset = 0;

    for (const [category, rate] of Object.entries(scout.rates)) {
      assert.ok(
        Number.isFinite(rate) && rate >= 0,
      );

      if (!rate) {
        continue;
      }

      const result = withRandom(
        [
          (offset + rate / 2) / total,
          0.99,
        ],
        createScoutRoller(scout, characters),
      );

      assert.ok(
        result,
        `${scout.id}: ${category}`,
      );

      if (category !== 'pickup') {
        assert.equal(
          result.grade,
          category,
        );

        assert.ok(
          !scout.pickups.some(
            (pickup) =>
              pickup.characterId === result.id,
          ),
        );
      }

      offset += rate;
    }
  }
});

test('existing non-100 totals remain relative weights as requested', () => {
  const scout = {
    ...scouts[0],
    rates: {
      pickup: 0.2,
      bf: 1.75,
      'star-4': 5.05,
      'star-3': 28,
      'star-2': 58,
    },
  };

  const result = withRandom(
    [
      0.2 / 93 - 0.000001,
      0,
    ],
    createScoutRoller(scout, characters),
  );

  assert.equal(
    result.id,
    scout.featuredCharacterId,
  );

  assert.equal(
    withRandom(
      [0.5],
      () =>
        rollScoutMany(
          scout,
          characters,
          11,
        ),
    ).length,
    11,
  );
});

test('scout classification respects both boundaries and explicit JST offsets', () => {
  const scout = scouts[0];
  const start = Date.parse(scout.startAt);
  const end = Date.parse(scout.endAt);

  assert.equal(
    getScoutStatus(
      scout,
      start - 1,
    ),
    'upcoming',
  );

  assert.equal(
    getScoutStatus(
      scout,
      start,
    ),
    'current',
  );

  assert.equal(
    getScoutStatus(
      scout,
      end,
    ),
    'current',
  );

  assert.equal(
    getScoutStatus(
      scout,
      end + 1,
    ),
    'past',
  );
});

test('monthly filters clamp month ends, including leap years', () => {
  assert.deepEqual(
    filterSnapshotsByRange(
      [
        { date: '2026-02-27' },
        { date: '2026-02-28' },
        { date: '2026-03-31' },
      ],
      '1M',
    ).map((snapshot) => snapshot.date),
    [
      '2026-02-28',
      '2026-03-31',
    ],
  );

  assert.deepEqual(
    filterSnapshotsByRange(
      [
        { date: '2024-02-28' },
        { date: '2024-02-29' },
        { date: '2024-03-31' },
      ],
      '1M',
    ).map((snapshot) => snapshot.date),
    [
      '2024-02-29',
      '2024-03-31',
    ],
  );

  assert.deepEqual(
    filterSnapshotsByRange(
      [],
      '1M',
    ),
    [],
  );
});

test('usage processing computes coverage and changes without mutating input', () => {
  const id = Object.keys(characters)[0];

  const input = [
    {
      date: '2026-09-02',
      targetPlayers: 10,
      usage: {
        [id]: 8,
      },
    },
    {
      date: '2026-08-26',
      targetPlayers: 10,
      usage: {
        [id]: 4,
      },
    },
  ];

  const original = structuredClone(input);
  const processed = processCharacterUsageSnapshots(input);

  assert.deepEqual(
    input,
    original,
  );

  assert.equal(
    processed[1].coverage,
    40,
  );

  assert.equal(
    processed[1].effectivePlayerCount,
    4,
  );

  assert.equal(
    processed[1].ranking[0].usageRate,
    200,
  );

  assert.equal(
    processed[1].ranking[0].changePoints,
    0,
  );

  assert.equal(
    buildChartData(
      processed,
      ['not-recorded'],
    )[0].values['not-recorded'].count,
    0,
  );

  assert.throws(
    () =>
      processCharacterUsageSnapshots([
        {
          ...input[0],
          usage: {
            bad: 1,
          },
        },
      ]),
    /Unknown character/,
  );

  assert.throws(
    () =>
      processCharacterUsageSnapshots([
        {
          ...input[0],
          usage: {
            [id]: -1,
          },
        },
      ]),
    /Invalid usage/,
  );

  assert.equal(
    processCharacterUsageSnapshots(
      characterUsageSnapshots,
    ).length,
    characterUsageSnapshots.length,
  );
});

const {
  createCharacterGuideEntries,
  filterCharacterGuideEntries,
} = require('../src/lib/character-guide-directory');

test('permanent guide directory includes exactly the registry, even after New Characters expires', () => {
  const entries = createCharacterGuideEntries(characterGuides, characters);
  assert.deepEqual(entries.map(entry => entry.id).sort(), Object.keys(characterGuides).sort());
  assert.ok(Object.keys(characters).length > entries.length);
  assert.deepEqual(getActiveNewCharacterReleases(new Date('2100-01-01T00:00:00Z')), []);
  assert.equal(createCharacterGuideEntries(characterGuides, characters).length, entries.length);
  for (const entry of entries) {
    const guide = characterGuides[entry.id];
    assert.equal(entry.name, characters[entry.id].name);
    assert.equal(entry.image, characters[entry.id].image);
    assert.equal(entry.grade, characters[entry.id].grade);
    assert.equal(entry.summary, guide.guideOverview?.description?.trim() || guide.quickStrengths[0] || '');
    assert.equal(entry.notice, guide.notice?.title);
    assert.ok(!Object.hasOwn(entry, 'skillGroups'), 'guide bodies stay off the client');
  }
  assert.deepEqual(createCharacterGuideEntries({}, characters), []);
  assert.throws(() => createCharacterGuideEntries(characterGuides, {}), /cannot resolve/);
});

test('directory searches full version names, tolerates punctuation, and combines filters', () => {
  const entries = createCharacterGuideEntries(characterGuides, characters);
  const bonney = entries.find(entry => entry.id.includes('jewelry-bonney'));
  assert.ok(bonney);
  assert.deepEqual(filterCharacterGuideEntries(entries, "  JEWELRY I'm FREE  ", '', '').map(e => e.id), [bonney.id]);
  const snake = entries.find(entry => entry.id === 'seraphim-s-snake');
  assert.ok(snake);
  assert.deepEqual(filterCharacterGuideEntries(entries, 'S Snake', snake.element, snake.role), [snake]);
  assert.deepEqual(filterCharacterGuideEntries(entries, 'S Snake', snake.element, 'attacker'), []);
  assert.deepEqual(filterCharacterGuideEntries(entries, 'no-such-character', '', ''), []);
  assert.deepEqual(filterCharacterGuideEntries(entries, '', '', ''), entries);
  assert.deepEqual(filterCharacterGuideEntries([], '', '', ''), []);
  assert.deepEqual(filterCharacterGuideEntries(entries, '', bonney.element, bonney.role), entries.filter(e => e.element === bonney.element && e.role === bonney.role));
});

test('newly registered versions appear once without touching the directory or release list', () => {
  const name = "Another Version Jewelry Bonney";
  const id = 'fixture-another-version-bonney';
  const expandedCharacters = { ...characters, [id]: { ...characters['future-where-i-m-the-most-free-jewelry-bonney'], id, name } };
  const expandedGuides = { ...characterGuides, [id]: { characterId: id, quickStrengths: ['Fixture strength'], quickWeaknesses: [] } };
  const entries = createCharacterGuideEntries(expandedGuides, expandedCharacters);
  assert.equal(entries.length, Object.keys(characterGuides).length + 1);
  assert.equal(entries.filter(e => e.id === id).length, 1);
  assert.equal(entries.find(e => e.id === id).summary, 'Fixture strength');
  assert.equal(filterCharacterGuideEntries(entries, 'Jewelry Bonney', '', '').length, 2);
  assert.deepEqual(filterCharacterGuideEntries(entries, 'Another Version', '', '').map(e => e.id), [id]);
  assert.throws(() => createCharacterGuideEntries({ wrong: expandedGuides[id] }, expandedCharacters), /cannot resolve/);
});

const { characterGradeLabels, normalizeCharacterGrade } = require('../src/data/characters/grades');

test('Simulator result rarity labels retain the existing catalog grade mapping', () => {
  assert.deepEqual(characterGradeLabels, {
    ex: 'EX', bf: 'BF', sp: 'SP', 'star-4': '4★', 'star-3': '3★', 'star-2': '2★',
    free: 'FREE', exchange: 'EXCH', cola: 'COLA', unknown: '?',
  });
  for (const character of Object.values(characters)) {
    assert.equal(normalizeCharacterGrade(character.grade), character.grade);
    assert.ok(characterGradeLabels[character.grade]);
  }
  for (const grade of [undefined, null, '', 'EX', 'constructor', '__proto__', 'not-a-grade']) {
    assert.equal(normalizeCharacterGrade(grade), 'unknown');
  }
});

test('directory filters catalog rarity together with name, element and role', () => {
  const entries = createCharacterGuideEntries(characterGuides, characters);
  assert.deepEqual(filterCharacterGuideEntries(entries, '', '', '', 'ex'), entries.filter(e => e.grade === 'ex'));
  assert.deepEqual(filterCharacterGuideEntries(entries, 's snake', 'blue', 'defender', 'ex').map(e => e.id), ['seraphim-s-snake']);
  assert.deepEqual(filterCharacterGuideEntries(entries, 's snake', 'blue', 'defender', 'bf'), []);
  assert.deepEqual(filterCharacterGuideEntries(entries, '', '', '', ''), entries);
  assert.deepEqual(filterCharacterGuideEntries([], '', '', '', 'ex'), []);
});

test('rarity uses real IDs and preserves unclassified data rather than guessing from names', () => {
  const template = characters['seraphim-s-snake'];
  const catalog = {};
  const guides = {};
  for (const [index, grade] of [...Object.keys(characterGradeLabels), undefined].entries()) {
    const id = `rarity-fixture-${index}`;
    catalog[id] = { ...template, id, name: 'EX BF Special 4 Star Named Character', grade };
    guides[id] = { characterId: id, quickStrengths: [], quickWeaknesses: [] };
  }
  catalog['not-published'] = { ...template, id:'not-published', grade:'bf' };
  const entries = createCharacterGuideEntries(guides, catalog);
  assert.equal(entries.length, 11);
  for (const grade of Object.keys(characterGradeLabels)) {
    assert.equal(filterCharacterGuideEntries(entries, '', 'blue', 'defender', grade).length, grade === 'unknown' ? 2 : 1);
  }
  assert.ok(!entries.some(entry => entry.id === 'not-published'));
  assert.equal(entries.find(entry => entry.id === 'rarity-fixture-10').grade, 'unknown');
});
