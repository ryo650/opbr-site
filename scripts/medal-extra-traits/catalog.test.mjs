import assert from "node:assert/strict";
import test from "node:test";
import { createExtraTraitCatalog, parseExtraTraitText } from "./catalog.mjs";
import {
  clearEquippedExtraTraitsForSlot,
  createEmptyEquippedExtraTraits,
  prepareExtraTraitsForMedalPlacement,
  searchRawExtraTraitCatalog,
  searchSelectableExtraTraits,
  setEquippedExtraTrait,
} from "../../src/data/medals/extra-traits.ts";
import { effectCaps } from "../../src/data/medals/effect-caps.ts";
import { medalEffectCapGroups, medalEffectCatalog } from "../../src/data/medals/medal-effect-catalog.ts";
import { extraTraitCatalog, extraTraitCatalogNeedsReview } from "../../src/data/medals/extra-traits.generated.ts";

test("verified caps keep percent and flat buckets separate", () => {
  assert.equal(effectCaps["hp-increase-percent"]?.value, 70);
  assert.equal(effectCaps["hp-increase-points"]?.value, 1200);
  assert.equal(effectCaps["crit-increase-percent"]?.value, 70);
  assert.equal(effectCaps["crit-increase-value"]?.value, 2);
  assert.equal(effectCaps["spd-increase-percent"]?.value, 70);
  assert.equal(effectCaps["stun-duration-reduction"]?.value, 70);
  assert.equal(effectCaps["status-effect-time-reduction"], undefined);
  assert.equal(
    medalEffectCatalog.find((effect) => effect.id === "spd-increase-when-spawning")?.capGroup,
    undefined,
  );
});

test("Stun duration reduction uses an independent verified cap group", () => {
  const parsedStun = parseExtraTraitText("Reduces duration of Stun by 36%.", "stun-evidence").definition;
  const rawStun = extraTraitCatalog.find(({ effectId }) => effectId === "stun-duration-reduction");
  assert.equal(parsedStun?.capGroup, "stun-duration-reduction");
  assert.equal(rawStun?.value, 36);
  assert.equal(rawStun?.capGroup, "stun-duration-reduction");
  assert.ok(!extraTraitCatalog.some(({ capGroup }) => capGroup === "status-effect-time-reduction"));
});

test("generated catalog IDs and cap links are internally valid", () => {
  assert.equal(extraTraitCatalog.length, 96);
  assert.equal(new Set(extraTraitCatalog.map((definition) => definition.id)).size, extraTraitCatalog.length);
  const capGroupIds = new Set(medalEffectCapGroups.map((group) => group.id));
  assert.ok(extraTraitCatalog.every((definition) => !definition.capGroup || capGroupIds.has(definition.capGroup)));
  assert.equal(extraTraitCatalog.filter((definition) => definition.condition).length, 80);
  assert.equal(extraTraitCatalogNeedsReview.length, 3);
});

test("stable IDs include effect, value, unit, and condition", () => {
  const unconditional = parseExtraTraitText("Increase HP by 18%.", "one").definition;
  const conditional = parseExtraTraitText(
    'When the equipped character is character type "Roger Pirates": Increase HP by 18%.',
    "two",
  ).definition;
  assert.ok(unconditional);
  assert.ok(conditional);
  assert.notEqual(unconditional.id, conditional.id);
  assert.equal(
    conditional.id,
    parseExtraTraitText(
      'When the equipped character is character type "Roger Pirates": Increase HP by 18%.',
      "another-source",
    ).definition.id,
  );
});

test("catalog deduplicates identical definitions while retaining provenance", () => {
  const draft = {
    medals: [{
      id: "test-medal",
      validationPassed: true,
      needsReview: false,
      ocr: { rates: [{ file: "rate.png", lines: ["Increase HP by 14%.", "4.00%", "Increase HP by 14%."] }] },
    }],
  };
  const result = createExtraTraitCatalog(draft);
  assert.equal(
    result.definitions.filter((definition) => definition.id === "hp-increase-14-percent-unconditional").length,
    1,
  );
});

test("equipped traits are independent per medal slot and clear with their slot", () => {
  const first = searchSelectableExtraTraits("HP")[0];
  const second = searchSelectableExtraTraits("damage")[0];
  assert.ok(first);
  assert.ok(second);
  let equipped = createEmptyEquippedExtraTraits();
  equipped = setEquippedExtraTrait(equipped, 0, 0, first.id);
  equipped = setEquippedExtraTrait(equipped, 1, 0, second.id);
  equipped = setEquippedExtraTrait(equipped, 0, 1, second.id);
  assert.deepEqual(equipped[0], [first.id, second.id, null]);
  assert.deepEqual(equipped[1], [second.id, null, null]);
  const cleared = clearEquippedExtraTraitsForSlot(equipped, 0);
  assert.deepEqual(cleared[0], [null, null, null]);
  assert.deepEqual(cleared[1], [second.id, null, null]);
});

test("replacing a medal clears its three traits without touching other slots", () => {
  const trait = searchSelectableExtraTraits("damage")[0];
  let equipped = createEmptyEquippedExtraTraits();
  equipped = setEquippedExtraTrait(equipped, 0, 0, trait.id);
  equipped = setEquippedExtraTrait(equipped, 1, 2, trait.id);
  const replaced = prepareExtraTraitsForMedalPlacement(equipped, 0, "old-medal", "new-medal");
  assert.deepEqual(replaced[0], [null, null, null]);
  assert.deepEqual(replaced[1], [null, null, trait.id]);
  assert.equal(prepareExtraTraitsForMedalPlacement(equipped, 0, "old-medal", "old-medal"), equipped);
});

test("Raw search includes condition text while Builder search is conditionless", () => {
  assert.ok(searchSelectableExtraTraits("HP").every((definition) => definition.label.includes("HP")));
  assert.ok(searchSelectableExtraTraits("damage").length > 0);
  assert.equal(searchSelectableExtraTraits("Roger").length, 0);
  assert.ok(searchRawExtraTraitCatalog("Roger").some((definition) =>
    definition.condition?.kind === "text" && definition.condition.description.includes("Roger"),
  ));
});
