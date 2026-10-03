const { test } = require('node:test');
const assert = require('node:assert/strict');
const { stepUpDemo, demoCharacters } = require('../src/data/scouts/fixtures/step-up-demo');
const { compileStepUp, createStepUpState, drawStep, commitStep, createStepUpSession } = require('../src/lib/scout-step-up');
const { simulatorScouts, validateScoutRegistry, createPublishedScoutRegistry, adaptNormalScout } = require('../src/data/scouts/simulator-registry');
const { getScoutSummary } = require('../src/data/scouts/simulator-type');
const { scouts } = require('../src/data/scouts');
const { characters } = require('../src/data/characters');
const clone = () => structuredClone(stepUpDemo);
const compile = definition => compileStepUp(definition ?? clone(), demoCharacters);
function complete(session) { while (session.getState().status === 'active') session.run(session.getState().revision); return session.getState(); }
function seedRng(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }; }

test('24 published normal adapters preserve raw identity, summaries and fixture boundary', () => {
  assert.equal(scouts.length, 24);
  assert.equal(simulatorScouts.length, 24);
  scouts.forEach((scout, i) => {
    assert.equal(simulatorScouts[i].kind, 'normal');
    assert.equal(simulatorScouts[i].legacy, scout);
    assert.equal(getScoutSummary(simulatorScouts[i]).id, scout.id);
    assert.deepEqual(getScoutSummary(simulatorScouts[i]).displayPickupIds, scout.pickups.map(p => p.characterId));
  });
  assert.ok(!simulatorScouts.some(s => getScoutSummary(s).id === stepUpDemo.meta.id));
  assert.deepEqual(getScoutSummary(stepUpDemo), stepUpDemo.meta);
  assert.throws(() => getScoutSummary({ kind: 'unknown' }), /Unsupported/);
  assert.throws(() => validateScoutRegistry([{ kind: 'unknown' }], characters), /Unsupported/);
  assert.throws(() => validateScoutRegistry([adaptNormalScout(scouts[0]), adaptNormalScout(scouts[0])], characters), /Duplicate/);
  assert.throws(() => validateScoutRegistry([{ kind: 'normal', legacy: null }], characters), /Invalid/);
  validateScoutRegistry([stepUpDemo], demoCharacters);
});

test('three-Step fixture completes exactly 19 draws / 40 RD / one display reward', () => {
  const session = createStepUpSession(compile(), () => 0);
  let s = session.run(0);
  assert.equal(s.currentStepIndex, 1); assert.equal(s.characterDraws, 3); assert.equal(s.diamondsSpent, 10);
  s = session.run(1);
  assert.equal(s.currentStepIndex, 2); assert.equal(s.characterDraws, 14); assert.equal(s.diamondsSpent, 10);
  assert.equal(s.lastOutcome.results.length, 11);
  assert.ok(s.lastOutcome.results.slice(0, 10).every(r => r.characterId === 'D' && r.role === 'normal'));
  assert.deepEqual(s.lastOutcome.results[10], { characterId: 'B', rarity: 4, featured: false, poolId: 'G4', role: 'guarantee', slot: 11 });
  s = session.run(2);
  assert.equal(s.status, 'completed'); assert.equal(s.currentStepIndex, null);
  assert.equal(s.currentRound, 1); assert.equal(s.completedRounds, 1); assert.equal(s.stepExecutions, 3);
  assert.equal(s.characterDraws, 19); assert.equal(s.diamondsSpent, 40); assert.deepEqual(s.rewardTotals, { 'demo-bonus': 1 });
  assert.equal(s.lastOutcome.results[4].characterId, 'A'); assert.equal(s.lastOutcome.results[4].role, 'guarantee');
  assert.throws(() => session.run(s.revision), /completed/);
  assert.equal(session.getState(), s);
});

test('finite maxRounds counts the first round and wraps only while rounds remain', () => {
  const d = clone(); d.repeat.maxRounds = 2;
  const session = createStepUpSession(compile(d), () => 0.999999);
  for (let i = 0; i < 3; i++) session.run(i);
  const midway = session.getState();
  assert.equal(midway.currentRound, 2); assert.equal(midway.currentStepIndex, 0); assert.equal(midway.completedRounds, 1);
  assert.equal(midway.rewardTotals['demo-bonus'], 1);
  const done = complete(session);
  assert.equal(done.status, 'completed'); assert.equal(done.currentRound, 2); assert.equal(done.completedRounds, 2);
  assert.equal(done.characterDraws, 38); assert.equal(done.diamondsSpent, 80); assert.equal(done.stepExecutions, 6); assert.equal(done.rewardTotals['demo-bonus'], 2);
});

test('sampler preserves ordered weight intervals, zero weights, duplicate draws and injected seed', () => {
  const c = compile(); const initial = createStepUpState(c);
  for (const [u, expected] of [[0, 'D'], [.6 - 1e-12, 'D'], [.6, 'C'], [.89 - 1e-12, 'C'], [.89, 'B'], [.97, 'A'], [.99, 'E'], [1 - Number.EPSILON, 'E']]) {
    assert.ok(drawStep(c, initial, () => u).results.every(r => r.characterId === expected), `${u}`);
  }
  const d = clone(); d.pools.N1.entries.unshift({ characterId: 'E', weight: 0, rarity: 4, featured: true });
  d.pools.N1.entries = d.pools.N1.entries.filter((e, i) => e.characterId !== 'E' || i === 0);
  assert.equal(drawStep(compile(d), initial, () => 1 - Number.EPSILON).results[0].characterId, 'A');
  const second = commitStep(c, initial, drawStep(c, initial, () => 0));
  for (const [u, expected] of [[0, 'B'], [8 / 11 - 1e-12, 'B'], [8 / 11, 'A'], [10 / 11, 'E'], [1 - Number.EPSILON, 'E']]) {
    assert.equal(drawStep(c, second, () => u).results[10].characterId, expected);
  }
  const third = commitStep(c, second, drawStep(c, second, () => 0));
  assert.equal(drawStep(c, third, () => .85).results[0].characterId, 'B');
  assert.equal(drawStep(c, third, () => 2 / 3 - 1e-12).results[4].characterId, 'A');
  assert.equal(drawStep(c, third, () => 2 / 3).results[4].characterId, 'E');
  const a = createStepUpSession(c, seedRng(42)); const b = createStepUpSession(c, seedRng(42));
  assert.deepEqual(complete(a), complete(b));
  for (const bad of [-.1, 1, NaN, Infinity]) assert.throws(() => drawStep(c, initial, () => bad), /RNG/);
});

test('guarantee pool distribution is independent of normal pool rates', () => {
  const d = clone(); d.pools.G4.entries = [{ characterId: 'B', weight: 1, rarity: 4, featured: false }, { characterId: 'A', weight: 9, rarity: 4, featured: true }];
  const session = createStepUpSession(compile(d), () => .5);
  session.run(0); const s = session.run(1);
  assert.ok(s.lastOutcome.results.slice(0, 10).every(r => r.characterId === 'D'));
  assert.equal(s.lastOutcome.results[10].characterId, 'A');
});

test('included 11-slot and additional 12-slot guarantee plans remain distinct', () => {
  const d = clone(); d.steps[1].pullCount = 12; d.steps[1].drawPlan.groups[0].count = 11;
  const session = createStepUpSession(compile(d), () => 0); session.run(0);
  assert.equal(session.run(1).lastOutcome.results.length, 12);
});

test('reward-only Steps advance without consuming RNG', () => {
  const d = clone(); d.steps = [d.steps[2]]; d.steps[0].pullCount = 0; d.steps[0].drawPlan.groups = [];
  const s = complete(createStepUpSession(compile(d), () => { throw new Error('RNG must not run'); }));
  assert.equal(s.characterDraws, 0); assert.equal(s.stepExecutions, 1); assert.equal(s.diamondsSpent, 30); assert.equal(s.rewardTotals['demo-bonus'], 1);
});

test('failed draw, stale/double commit, altered slots and reset preserve atomic accounting', () => {
  const c = compile(); const initial = createStepUpState(c); const outcome = drawStep(c, initial, () => .9);
  const next = commitStep(c, initial, outcome);
  assert.throws(() => commitStep(c, next, outcome), /stale/);
  for (const alter of [o => o.expectedRevision++, o => o.round++, o => o.definitionId = 'other', o => o.results.pop(), o => o.results[0].role = 'guarantee', o => o.results[0].characterId = 'missing', o => o.results[0].rarity = 2, o => o.results[0].slot = 3]) {
    const changed = structuredClone(outcome); alter(changed); assert.throws(() => commitStep(c, initial, changed), /Invalid/);
    assert.equal(initial.diamondsSpent, 0);
  }
  let rngCalls = 0;
  const session = createStepUpSession(c, () => { rngCalls++; return rngCalls === 2 ? NaN : 0; });
  assert.throws(() => session.run(0), /RNG/); assert.equal(session.getState().stepExecutions, 0);
  session.run(0); assert.throws(() => session.run(0), /stale/); assert.equal(session.getState().stepExecutions, 1);
  const reset = session.reset(); assert.equal(reset.currentStepIndex, 0); assert.equal(reset.currentRound, 1); assert.equal(reset.characterDraws, 0); assert.equal(reset.diamondsSpent, 0); assert.deepEqual(reset.rewardTotals, {});
  assert.throws(() => session.run(1), /stale/); assert.throws(() => commitStep(c, reset, outcome), /stale/);
  complete(session); const afterCompletionReset = session.reset();
  assert.equal(afterCompletionReset.status, 'active'); assert.equal(afterCompletionReset.lastOutcome, null);
  assert.equal(afterCompletionReset.completedRounds, 0); assert.deepEqual(afterCompletionReset.rewardTotals, {});
});

test('re-entrant run or reset during RNG cannot execute the Step twice', () => {
  let session;
  session = createStepUpSession(compile(), () => {
    assert.throws(() => session.run(0), /busy/);
    assert.throws(() => session.reset(), /during draw/);
    return 0;
  });
  assert.equal(session.run(0).stepExecutions, 1);
});

test('compiled definition is a frozen snapshot; external mutation cannot change displayed/executed Step', () => {
  const d = clone(); const c = compile(d); d.steps[0].cost.amount = 999;
  assert.equal(c.definition.steps[0].cost.amount, 10); assert.ok(Object.isFrozen(c.definition.steps[0]));
  const s = createStepUpSession(c, () => 0).run(0); assert.equal(s.diamondsSpent, 10); assert.ok(Object.isFrozen(s.lastOutcome.results));
});

const invalid = [
  ['unknown kind', d => d.kind = 'mystery'], ['schema', d => d.schemaVersion = 2],
  ['minimum-match replacement', d => d.steps[1].drawPlan = { kind: 'minimumMatchRepair' }],
  ['conditional draw', d => d.steps[1].drawPlan = { kind: 'conditionalBatch' }],
  ['unknown draw', d => d.steps[1].drawPlan = { kind: 'unknown', groups: [] }],
  ['paid eligibility', d => d.steps[1].eligibility.kind = 'paidDiamondsOnly'],
  ['unlimited', d => d.repeat = { kind: 'unlimited' }], ['override', d => d.roundOverrides = []],
  ['unknown reward', d => d.steps[2].rewards[0].kind = 'ticket'], ['choice', d => d.steps[2].choice = {}],
  ['unknown source', d => d.source.kind = 'unknown'], ['missing source', d => delete d.pools.N1.source],
  ['unknown pool kind', d => d.pools.N1.kind = 'categoryRates'], ['unknown currency', d => d.steps[0].cost.kind = 'paidRD'],
  ['negative cost', d => d.steps[0].cost.amount = -1], ['fractional count', d => d.steps[0].pullCount = 1.5],
  ['count mismatch', d => d.steps[0].pullCount++], ['zero group', d => d.steps[0].drawPlan.groups[0].count = 0],
  ['missing character', d => d.pools.N1.entries[0].characterId = 'missing'],
  ['duplicate entry', d => d.pools.N1.entries.push(d.pools.N1.entries[0])],
  ['negative weight', d => d.pools.N1.entries[0].weight = -1], ['NaN', d => d.pools.N1.entries[0].weight = NaN], ['Infinity', d => d.pools.N1.entries[0].weight = Infinity],
  ['zero pool', d => d.pools.N1.entries.forEach(e => e.weight = 0)], ['empty pool', d => d.pools.N1.entries = []],
  ['bad percent total', d => d.pools.G4.unit = 'percent'], ['unknown pool', d => d.steps[0].drawPlan.groups[0].poolId = 'missing'],
  ['rarity guarantee', d => d.pools.G4.entries[0].rarity = 3], ['featured guarantee', d => d.pools.GF.entries.push({ characterId: 'B', weight: 1, rarity: 4, featured: false })],
  ['unknown criterion', d => d.steps[1].drawPlan.groups[1].criterion.kind = 'unknown'],
  ['invalid round count', d => d.repeat.maxRounds = 0], ['empty steps', d => d.steps = []], ['duplicate step', d => d.steps.push(d.steps[0])],
  ['invalid period', d => d.meta.endAt = 'bad'], ['bad display IDs', d => d.meta.displayPickupIds = ['missing']],
  ['bad reward', d => d.steps[2].rewards[0].quantity = -1], ['overflow totals', d => d.repeat.maxRounds = Number.MAX_SAFE_INTEGER],
];
for (const [name, mutate] of invalid) test(`reject invalid definition: ${name}`, () => { const d = clone(); mutate(d); assert.throws(() => compile(d), /Invalid Step-Up/); });

test('display reward IDs cannot collide with Object prototype names', () => {
  const d = clone(); d.repeat.maxRounds = 2;
  d.steps[2].rewards = ['__proto__', 'constructor'].map(rewardId => ({ ...d.steps[2].rewards[0], rewardId }));
  const s = complete(createStepUpSession(compile(d), () => 0));
  assert.equal(Object.getPrototypeOf(s.rewardTotals), Object.prototype);
  assert.equal(s.rewardTotals['__proto__'], 2); assert.equal(s.rewardTotals.constructor, 2);
});

test('normal registration rejects malformed data without changing legacy relative weights', () => {
  for (const mutate of [s => s.rates.pickup = NaN, s => s.pullOptions.single.diamondCost = -1, s => s.pickups[0].characterId = 'missing']) {
    const scout = structuredClone(scouts[0]); mutate(scout);
    assert.throws(() => validateScoutRegistry([adaptNormalScout(scout)], characters), /Invalid normal/);
  }
});

test('publication boundary rejects fixture definitions and fixture pools', () => {
  assert.throws(() => createPublishedScoutRegistry([stepUpDemo], demoCharacters), /Development fixtures/);
  const d = clone(); d.source.kind = 'gameScreenshots';
  assert.throws(() => createPublishedScoutRegistry([d], demoCharacters), /Development fixtures/);
  Object.values(d.pools).forEach(pool => pool.source.kind = 'gameScreenshots');
  assert.equal(createPublishedScoutRegistry([d], demoCharacters)[0], d);
});

test('non-plain inherited definitions are rejected at validation', () => {
  assert.throws(() => compileStepUp(Object.create(stepUpDemo), demoCharacters), /plain object/);
});
