import assert from "node:assert/strict";
import test from "node:test";
import {
  formatMedalEffectCondition,
  formatMedalEffectValue,
  getActiveTagSetEffects,
} from "../../src/data/medals/active-tag-set-effects.ts";

function medal(id, tags) {
  return {
    id,
    name: `${id} Medal`,
    category: "character",
    uniqueTrait: "Test trait.",
    tags,
    nativeTraits: [],
  };
}

const wano = { id: "land-of-wano", name: "Land of Wano" };
const worstGeneration = {
  id: "worst-generation",
  name: "Worst Generation",
};

test("the same Medal in three slots does not activate an Effect", () => {
  const sameMedal = medal("same", [wano]);
  assert.deepEqual(
    getActiveTagSetEffects([sameMedal, sameMedal, sameMedal]),
    [],
  );
});

test("two distinct Medals with one Tag activate its 2 Set Effect", () => {
  const effects = getActiveTagSetEffects([
    medal("a", [wano]),
    medal("b", [wano]),
  ]);

  assert.equal(effects.length, 1);
  assert.equal(effects[0].tagName, "Land of Wano");
  assert.equal(effects[0].setSize, 2);
  assert.equal(formatMedalEffectValue(effects[0].value, effects[0].valueSchema), "14%");
});

test("three distinct Medals emit only the 3 Set Effect for that Tag", () => {
  const effects = getActiveTagSetEffects([
    medal("a", [wano]),
    medal("b", [wano]),
    medal("c", [wano]),
  ]);

  assert.equal(effects.length, 1);
  assert.equal(effects[0].setSize, 3);
  assert.equal(formatMedalEffectValue(effects[0].value, effects[0].valueSchema), "20%");
});

test("a Trio and a different Pair remain in separate result sections", () => {
  const effects = getActiveTagSetEffects([
    medal("a", [wano, worstGeneration]),
    medal("b", [wano, worstGeneration]),
    medal("c", [wano]),
  ]);

  assert.deepEqual(
    effects.map(({ tagId, setSize }) => ({ tagId, setSize })),
    [
      { tagId: "land-of-wano", setSize: 3 },
      { tagId: "worst-generation", setSize: 2 },
    ],
  );
});

test("different Tags sharing one Effect remain separate results", () => {
  const mantra = { id: "mantra", name: "Mantra" };
  const zombie = { id: "zombie", name: "Zombie" };
  const effects = getActiveTagSetEffects([
    medal("a", [mantra, zombie]),
    medal("b", [mantra, zombie]),
  ]);

  assert.equal(effects.length, 2);
  assert.equal(effects[0].effectId, effects[1].effectId);
  assert.deepEqual(
    effects.map(({ tagId }) => tagId),
    ["mantra", "zombie"],
  );
});

test("conditional Effects retain user-facing condition text", () => {
  const bloodBrothers = { id: "blood-brothers", name: "Blood Brothers" };
  const [effect] = getActiveTagSetEffects([
    medal("a", [bloodBrothers]),
    medal("b", [bloodBrothers]),
  ]);

  assert.equal(
    formatMedalEffectCondition(effect.condition),
    "When your allies are near the Treasure area where you are at.",
  );
});

test("Fish-Man spawn SPD uses timed value formatting", () => {
  const fishMan = { id: "fish-man", name: "Fish-Man" };
  const [effect] = getActiveTagSetEffects([
    medal("a", [fishMan]),
    medal("b", [fishMan]),
  ]);

  assert.equal(
    formatMedalEffectValue(effect.value, effect.valueSchema),
    "10% for 14s",
  );
});

test("all and any Conditions remain understandable when nested", () => {
  const condition = {
    kind: "all",
    conditions: [
      { kind: "text", description: "Condition A." },
      {
        kind: "any",
        conditions: [
          { kind: "text", description: "Condition B." },
          { kind: "text", description: "Condition C." },
        ],
      },
    ],
  };

  assert.equal(
    formatMedalEffectCondition(condition),
    "All of: Condition A. and (Any of: Condition B. or Condition C.)",
  );
});
