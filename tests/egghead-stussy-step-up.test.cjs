const { test } = require("node:test");
const assert = require("node:assert/strict");
const { scoutEggheadStussy20261202: scout } = require("../src/data/scouts/egghead-stussy-20261202");
const { characters, characterLevel100BaseStatsByCharacterId } = require("../src/data/characters");
const { compileStepUp, createStepUpSession } = require("../src/lib/scout-step-up");
test("Stussy roster exactly matches official 116/14/19 candidate pools", () => {
  const compiled=compileStepUp(scout, characters);
  const n=compiled.definition.pools.normal.entries, g=compiled.definition.pools.guaranteedFour.entries;
  assert.equal(n.length,149); assert.equal(g.length,116);
  assert.equal(n.filter(x=>x.rarity===4).length,116);
  assert.equal(n.filter(x=>x.rarity===3).length,14);
  assert.equal(n.filter(x=>x.rarity===2).length,19);
  for (const pool of [n,g]) {
    assert.equal(new Set(pool.map(x=>x.characterId)).size,pool.length);
    assert.ok(Math.abs(pool.reduce((s,x)=>s+x.weight,0)-100)<1e-7);
  }
  assert.equal(n.find(x=>x.characterId==="egghead-stussy").weight,1);
  assert.equal(g.find(x=>x.characterId==="egghead-stussy").weight,2);
  assert.equal(n.find(x=>x.characterId==="fish-man-karate-assistant-master-koala").rarity,4);
});
test("two finite loops give 88 pulls, 280 RD, 4 guaranteed 4-star slots", () => {
  const compiled=compileStepUp(scout,characters);
  const session=createStepUpSession(compiled,()=>0);
  const cost=scout.steps.map(x=>x.cost.amount);
  assert.deepEqual(cost,[40,0,50,50]);
  assert.equal(scout.steps[2].drawPlan.groups[1].role,"guarantee");
  assert.equal(scout.steps[3].drawPlan.groups[1].role,"guarantee");
  for(let i=0;i<8;i++)session.run(session.getState().revision);
  const s=session.getState();
  assert.equal(s.status,"completed"); assert.equal(s.completedRounds,2);
  assert.equal(s.characterDraws,88); assert.equal(s.diamondsSpent,280);
  assert.equal(s.rewardTotals["step-gift"],24);
  assert.equal(characterLevel100BaseStatsByCharacterId.get("egghead-stussy").baseHp,6523);
  assert.equal(characterLevel100BaseStatsByCharacterId.get("egghead-stussy").baseAtk,1476);
  assert.equal(characterLevel100BaseStatsByCharacterId.get("egghead-stussy").baseDef,1707);
});
