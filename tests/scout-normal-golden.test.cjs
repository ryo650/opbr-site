const {createHash} = require('node:crypto');
const {scouts} = require('../src/data/scouts');
const {characters} = require('../src/data/characters');
const {createScoutRoller,rollScoutMany} = require('../src/lib/scout');
function capture(scout) {
  let seed = 20261003, calls = 0;
  const original = Math.random;
  Math.random = () => { calls++; seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 2 ** 32; };
  try {
    const roller = createScoutRoller(scout, characters);
    const single = roller()?.id;
    const multi = rollScoutMany(scout, characters, 11).map(c => c.id);
    const bulk = Array.from({length:3000}, () => roller()?.id ?? null);
    let stoppedAt=0; const until=[];
    for(let i=0;i<3000;i++){const c=roller(); if(c)until.push(c.id); if(c?.id===scout.featuredCharacterId){stoppedAt=i+1;break;}}
    return {id:scout.id,single,multi,bulkSHA256:createHash('sha256').update(JSON.stringify(bulk)).digest('hex'),untilSHA256:createHash('sha256').update(JSON.stringify(until)).digest('hex'),stoppedAt,untilCount:until.length,rngCalls:calls};
  } finally { Math.random=original; }
}
const {test} = require('node:test');
const assert = require('node:assert/strict');
const golden = require('./fixtures/scout-normal-main-golden.json');
test('all 24 normal Scouts match latest-main golden single/multi/3000 bulk/target stop and RNG consumption', () => {
  assert.equal(scouts.length, 24);
  assert.deepEqual(scouts.map(capture), golden.scouts);
});
