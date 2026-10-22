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
  createCharacterUsageRanking,
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

test('Warcury guide registers the agreed matchups and skill metadata', () => {
  const warcuryId = 'the-five-elders-st-topman-warcury';
  const guide = characterGuides[warcuryId];
  assert.ok(guide);
  assert.equal(hasCharacterGuide(warcuryId), true);
  assert.equal(guide.strengths?.length, 3);
  assert.equal(guide.weaknesses?.length, 3);
  assert.equal(guide.counters?.length, 9);
  assert.equal(guide.strongAgainst?.length, 7);
  assert.equal(guide.traits?.length, 7);
  assert.deepEqual(
    guide.skillGroups?.[0].skills.map(({ slot, cooldown }) => ({ slot, cooldown })),
    [
      { slot: 1, cooldown: 27 },
      { slot: 2, cooldown: 29 },
    ],
  );
  assert.deepEqual(
    guide.counters.map(({ characterId, difficulty }) => [characterId, difficulty]),
    [
      ['flame-emperor-sabo', 4],
      ['future-where-i-m-the-most-free-jewelry-bonney', 3],
      ['happy-halloween-uta', 3],
      ['winner-island-trafalgar-law', 3],
      ['king-of-the-pirates-gol-d-roger', 3],
      ['legendary-hero-monkey-d-garp', 3],
      ['film-red-shanks', 3],
      ['navy-hq-fleet-admiral-akainu', 4],
      ['ama-no-murakumo-sword-kizaru', 3],
    ],
  );
  assert.ok(guide.strongAgainst.every(({ advantage }) => advantage === 5));
  assert.deepEqual(guide.normalAttacks?.map(({ label }) => label), [
    'Normal Attack Combo',
    'Hold Normal Attack: Treasure Response',
  ]);
});

test('Peter and Warcury matchup updates retain counter perspective', () => {
  const peter = characterGuides['the-five-elders-st-shepherd-ju-peter'];
  const warcury = characterGuides['the-five-elders-st-topman-warcury'];
  const addedIds = [
    'king-of-the-pirates-gol-d-roger',
    'legendary-hero-monkey-d-garp',
    'film-red-shanks',
  ];
  assert.ok(peter);
  assert.ok(warcury);
  assert.equal(peter.counters?.find(({ characterId }) => characterId === 'unexpected-collaboration-rob-lucci')?.difficulty, 2);
  assert.deepEqual(peter.counters?.map(({ characterId }) => characterId), [
    'unexpected-collaboration-rob-lucci',
    'flame-emperor-sabo',
    'tontatta-pirates-captain-leo',
    ...addedIds,
    'ama-no-murakumo-sword-kizaru',
    'navy-hq-fleet-admiral-akainu',
  ]);
  for (const guide of [peter, warcury]) {
    assert.equal(new Set(guide.counters.map(({ characterId }) => characterId)).size, guide.counters.length);
    for (const id of addedIds) {
      const matchup = guide.counters.find(({ characterId }) => characterId === id);
      assert.equal(matchup?.difficulty, 3, id);
      assert.match(matchup.whyDifficult.join(' '), /ATK increase/);
      assert.match(matchup.howToRespond.join(' '), /ally with a better matchup/);
      assert.match(matchup.howToRespond.join(' '), /ATK is not increased/);
    }
  }
  for (const id of ['happy-halloween-uta', 'future-where-i-m-the-most-free-jewelry-bonney']) {
    const respond = warcury.counters.find(({ characterId }) => characterId === id)?.howToRespond?.join(' ') ?? '';
    assert.match(respond, /avoid/i);
    assert.match(respond, /ally/i);
    assert.doesNotMatch(respond, /obstacle/i);
  }
  for (const id of ['flame-emperor-sabo', 'winner-island-trafalgar-law']) {
    const matchup = warcury.counters.find(({ characterId }) => characterId === id);
    assert.ok(matchup, id);
    const respond = matchup.howToRespond?.join(' ') ?? '';
    assert.match(respond, /avoid using the held Normal Attack movement/i);
    assert.match(respond, /approach directly/i);
    assert.match(respond, /first or second hit/i);
    assert.match(respond, /third-hit Knockback/i);
    assert.match(respond, /counter/i);
    assert.match(respond, /skill/i);
    assert.doesNotMatch(respond, /obstacle/i);
  }
  const luffy = peter.strongAgainst.find(({ characterId }) => characterId === 'the-four-emperors-monkey-d-luffy');
  assert.equal(luffy?.advantage, 5);
  assert.match(luffy.whyYouWin.join(' '), /Straw Hat Pirates/);
  assert.match(luffy.whyYouWin.join(' '), /50% ATK reduction/);
  assert.doesNotMatch(luffy.whyYouWin.join(' '), /Element-change/);
  const bonney = peter.strongAgainst.find(({ characterId }) => characterId === 'future-where-i-m-the-most-free-jewelry-bonney');
  assert.equal(bonney?.advantage, 2);
  assert.match(bonney.whyYouWin.join(' '), /Royalty \/ Former Royalty/);
  assert.match(bonney.whyYouWin.join(' '), /remove that ATK reduction by using a skill/);
  assert.match(bonney.watchOut.join(' '), /Normal Attacks/);
  assert.match(bonney.watchOut.join(' '), /hit-and-run/);
});

test('Warcury and Peter add Akainu and Kizaru counters with the agreed ratings and guidance', () => {
  const cases = [
    {
      guideId: 'the-five-elders-st-topman-warcury',
      count: 9,
      name: 'Navy HQ Fleet Admiral Akainu',
      matchup: {
        characterId: 'navy-hq-fleet-admiral-akainu',
        difficulty: 4,
        whyDifficult: [
          "Akainu's attacks that increase Dodge cooldown and his attacks in Mag-Mag state can let him keep Warcury under one-sided pressure. While in Mag-Mag state, he can nullify incoming damage and accompanying effects up to 3 times, making it easier for him to KO Warcury.",
        ],
        howToRespond: [
          'There may be an opening to fight when Akainu is not in Mag-Mag state and his Skill 2 (Meteor Volcano), which activates it, is on cooldown. Otherwise, generally avoid fighting him; if forced to respond, try to disengage with skills.',
        ],
      },
    },
    {
      guideId: 'the-five-elders-st-shepherd-ju-peter',
      count: 8,
      name: 'Ama no Murakumo Sword Kizaru',
      matchup: {
        characterId: 'ama-no-murakumo-sword-kizaru',
        difficulty: 4,
        whyDifficult: [
          "Kizaru's skills can damage Peter effectively, and his high mobility makes it difficult for Peter to escape. Peter's limited KO potential can leave him at a one-sided disadvantage.",
        ],
        howToRespond: [
          "Try to Perfect Guard Kizaru's skills whenever possible, and carefully choose when to activate SP Capture and which Treasure to target.",
        ],
      },
    },
  ];

  for (const { guideId, count, name, matchup } of cases) {
    const counters = characterGuides[guideId].counters;
    assert.equal(counters.length, count, guideId);
    assert.equal(new Set(counters.map(({ characterId }) => characterId)).size, count, guideId);
    assert.equal(characters[matchup.characterId].name, name);
    assert.deepEqual(
      counters.filter(({ characterId }) => characterId === matchup.characterId),
      [matchup],
      guideId,
    );
  }
});

test('Warcury and Peter avoid their additional Kizaru and Akainu counters', () => {
  const warcury = characterGuides['the-five-elders-st-topman-warcury'];
  const kizaru = warcury.counters.filter(({ characterId }) => characterId === 'ama-no-murakumo-sword-kizaru');
  assert.equal(kizaru.length, 1);
  assert.equal(kizaru[0].difficulty, 3);
  const kizaruReason = kizaru[0].whyDifficult.join(' ');
  assert.match(kizaruReason, /high-damage Normal Attacks can overwhelm Warcury/);
  assert.match(kizaruReason, /can change Elements/);
  assert.match(kizaruReason, /being hit by his skills can trigger/);
  assert.match(kizaruReason, /removes the attacker's ATK increase/);
  assert.match(kizaruReason, /5% HP and 5% Defensive Shield durability/);
  assert.match(kizaruReason, /does not overcome the disadvantage/);
  assert.match(kizaru[0].howToRespond.join(' '), /avoid direct fights/);
  assert.match(kizaru[0].howToRespond.join(' '), /Do not deliberately take his skills/);

  const peter = characterGuides['the-five-elders-st-shepherd-ju-peter'];
  const akainu = peter.counters.filter(({ characterId }) => characterId === 'navy-hq-fleet-admiral-akainu');
  assert.equal(akainu.length, 1);
  assert.equal(akainu[0].difficulty, 4);
  assert.match(akainu[0].whyDifficult.join(' '), /enhanced Normal Attacks in Mag-Mag state/);
  assert.match(akainu[0].whyDifficult.join(' '), /damage over time from Incinerate/);
  assert.match(akainu[0].howToRespond.join(' '), /Avoid direct fights/);
  assert.match(akainu[0].howToRespond.join(' '), /Target a different Treasure Area/);
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

test('imported Warcury and Peter normal scout replaces the provisional registration', () => {
  const oldId = 'five-elders-warcury-peter-extreme-bounty-festival-20261021';
  const id = 'the-five-elders-st-topman-warcury-20261111';
  const scout = scouts.find((item) => item.id === id);
  assert.ok(scout);
  assert.equal(scouts.some(item => item.id === oldId), false);
  assert.equal(fs.existsSync(path.join(__dirname, '../src/data/scouts', oldId + '.ts')), false);
  const fiveElders = scouts.filter(item => item.pickups.some(pickup => pickup.characterId === 'the-five-elders-st-topman-warcury'));
  assert.equal(fiveElders.length, 1, 'the old and imported scouts must not coexist');
  assert.deepEqual(scout.pickups.map(({ characterId, rate }) => [characterId, rate]), [
    ['the-five-elders-st-topman-warcury', 0.2],
    ['the-five-elders-st-shepherd-ju-peter', 0.2],
  ]);
  assert.deepEqual(scout.rates, { pickup: 0.4, bf: 2.86, 'star-4': 3.74, 'star-3': 35, 'star-2': 58 });
  assert.equal(Object.values(scout.rates).reduce((sum, rate) => sum + rate, 0), 100);
  assert.deepEqual(scout.pullOptions, {
    single: { pullCount: 1, diamondCost: 5 },
    multi: { pullCount: 11, diamondCost: 50 },
  });
  assert.equal(scout.startAt, '2026-10-21T14:00:00+09:00');
  assert.equal(scout.endAt, '2026-11-11T13:59:59+09:00');
  assert.equal(scout.bannerImg, '/scouts/' + id + '.webp');
  assert.equal(scout.provisionalNotice, undefined);
  assert.equal(scout.details, undefined);
  const warcury = characters['the-five-elders-st-topman-warcury'];
  assert.equal(warcury.name, 'The Five Elders St. Topman Warcury');
  assert.equal(warcury.element, 'black');
  assert.equal(warcury.role, 'defender');
  assert.equal(warcury.grade, 'ex');
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

test('usage ranks use character IDs for ties and ignore display-name changes', () => {
  const ids = [
    'the-strongest-creature-alive-kaido',
    'red-rock-monkey-d-luffy',
    'the-four-emperors-marshall-d-teach',
  ];
  const snapshot = {
    date: '2026-09-26',
    targetPlayers: 10,
    usage: { [ids[0]]: 2, [ids[1]]: 4, [ids[2]]: 2 },
  };
  const rankingValues = (ranking) => ranking.map((item) =>
    Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'character')),
  );
  const original = createCharacterUsageRanking(snapshot);
  assert.deepEqual(original.map(({ characterId }) => characterId), [ids[1], ids[2], ids[0]]);
  const names = ids.map((id) => characters[id].name);
  const historical = processCharacterUsageSnapshots(characterUsageSnapshots)
    .map(({ ranking }) => rankingValues(ranking));

  try {
    for (const variants of [
      ['AAA Kaido', 'ZZZ Luffy', 'zzz Teach'],
      ['St. Kaido', "Luffy's - NEW Name", 'AAA Teach'],
      ['kaido', 'LUFFY', 'teach & Partner'],
    ]) {
      ids.forEach((id, index) => { characters[id].name = variants[index]; });
      assert.deepEqual(rankingValues(createCharacterUsageRanking(snapshot)), rankingValues(original));
      assert.deepEqual(
        processCharacterUsageSnapshots(characterUsageSnapshots).map(({ ranking }) => rankingValues(ranking)),
        historical,
      );
    }
  } finally {
    ids.forEach((id, index) => { characters[id].name = names[index]; });
  }
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

test('270M Akainu Step 1 registration matches the source rate table', () => {
  const scout = scouts.find((entry) => entry.id === '270-million-downloads-extreme-bounty-festival-2-20261027');
  assert.ok(scout);
  assert.equal(scout.featuredCharacterId, 'navy-hq-fleet-admiral-akainu');
  assert.equal(scout.pickups.length, 10);
  assert.equal(scout.pullOptions.multi.pullCount, 11);
  assert.equal(scout.pullOptions.multi.diamondCost, 30);
  assert.equal(scout.rates.pickup, 7);
  assert.equal(scout.rates['star-3'], 35);
  assert.equal(scout.rates['star-2'], 58);
  assert.equal(Object.values(scout.rates).reduce((sum, rate) => sum + rate, 0), 100);
  assert.equal(scout.pickups[0].rate, 0.2);
  for (const pickup of scout.pickups.slice(1)) {
    assert.equal(pickup.rate, 0.7555555);
  }
  assert.equal(scout.endAt, '2026-10-27T13:59:59+09:00');
  assert.ok(fs.existsSync(path.join(__dirname, '../public', scout.bannerImg)));
});
