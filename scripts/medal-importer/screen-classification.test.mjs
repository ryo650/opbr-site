import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyScreen,
  inspectDetailsBody,
} from "./screen-classification.mjs";

function observation(text, overrides = {}) {
  return { text, x: 0.43, y: 0.9, width: 0.14, ...overrides };
}

test("IMG_3640-style Details body is accepted without the Unique Trait label", () => {
  const lines = [
    "Home",
    "Medal Details",
    "Wyper (Young) Medal",
    "Element you are strong against:",
    "Increase damage dealt by 3%.",
    "Tag",
    "Limits",
    "Extra Trait 1",
    "Rate",
    "Unlock with Upgrade 1!",
    "Extra Trait 2",
    "Unlock with Upgrade 2!",
    "Extra Trait 3",
    "Unlock with Upgrade 3!",
    "Close",
  ];
  const body = inspectDetailsBody(lines);
  assert.equal(body.evidence.uniqueTrait, false);
  assert.equal(body.evidence.medalName, true);
  assert.equal(body.evidence.extraTrait, true);
  assert.equal(body.evidence.rate, true);
  assert.equal(body.accepted, true);
  assert.equal(
    classifyScreen(
      { lines, observations: [observation("Medal Details")] },
      "IMG_3640.PNG",
    ),
    "details",
  );
});

test("existing character Details with a Unique Trait label remains valid", () => {
  assert.equal(
    classifyScreen(
      {
        lines: ["Medal Details", "Character Medal", "Unique Trait"],
        observations: [observation("Medal Details")],
      },
      "character.png",
    ),
    "details",
  );
});

test("a game-provided plural Medals name is valid Details evidence", () => {
  const body = inspectDetailsBody([
    "Frostbite Medals",
    "Extra Trait 1",
    "Rate",
    "Tag",
    "Limits",
  ]);
  assert.equal(body.evidence.medalName, true);
  assert.equal(body.accepted, true);
});

test("the legacy Extra Trait + Rate + Craft Details signature remains valid", () => {
  assert.equal(
    classifyScreen(
      {
        lines: ["Medal Details", "Extra Trait 1", "Rate", "Craft"],
        observations: [observation("Medal Details")],
      },
      "legacy-character.png",
    ),
    "details",
  );
});

test("Details title without meaningful body evidence remains fatal", () => {
  assert.throws(
    () =>
      classifyScreen(
        {
          lines: ["Home", "Medal Details", "Close"],
          observations: [observation("Medal Details")],
        },
        "weak.png",
      ),
    /missing Details body structure/,
  );
});

test("missing or competing modal titles remain fatal", () => {
  assert.throws(
    () => classifyScreen({ lines: [], observations: [] }, "missing.png"),
    /found none/,
  );
  assert.throws(
    () =>
      classifyScreen(
        {
          lines: ["Medal Details", "Tag"],
          observations: [
            observation("Medal Details", { x: 0.36, width: 0.12 }),
            observation("Tag", { x: 0.52, width: 0.05 }),
          ],
        },
        "conflict.png",
      ),
    /found details, tag/,
  );
});

test("Rate and Tag modal classifications retain their signatures", () => {
  assert.equal(
    classifyScreen(
      {
        lines: [
          "Rate",
          "The drop rates are rounded off to the nearest thousandth.",
          "Increase ATK by 14%.",
        ],
        observations: [observation("Rate")],
      },
      "rate.png",
    ),
    "rate",
  );
  assert.equal(
    classifyScreen(
      { lines: ["Tag", "Sky Island"], observations: [observation("Tag")] },
      "tag.png",
    ),
    "tag",
  );
});
