import { pathToFileURL } from "node:url";
import { effectCaps } from "../../src/data/medals/effect-caps.ts";
import {
  medalEffectCapGroups,
  medalEffectCatalog,
  medalEffectFilterCategories,
} from "../../src/data/medals/medal-effect-catalog.ts";
import { medals } from "../../src/data/medals/medals.ts";
import { tagSetEffectGroups } from "../../src/data/medals/tag-set-effects.ts";

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isPositiveFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;
const numericUnits = new Set(["percent", "points", "seconds", "flat", "count"]);

function isValidValueSchema(schema) {
  if (!schema || typeof schema !== "object") return false;
  if (!["scalar", "timed", "toggle", "text"].includes(schema.kind)) return false;
  return !["scalar", "timed"].includes(schema.kind) || numericUnits.has(schema.unit);
}

function areValueSchemasCompatible(left, right) {
  if (!isValidValueSchema(left) || !isValidValueSchema(right) || left.kind !== right.kind) return false;
  if (["scalar", "timed"].includes(left.kind)) return left.unit === right.unit;
  return true;
}

function validateCondition(condition, location, errors) {
  if (!condition || typeof condition !== "object" || Array.isArray(condition)) {
    errors.push(`${location}: expected an object`);
    return;
  }
  if (condition.kind === "text") {
    if (typeof condition.description !== "string" || !condition.description.trim()) {
      errors.push(`${location}: text condition requires a description`);
    }
    return;
  }
  if (condition.kind === "all" || condition.kind === "any") {
    if (!Array.isArray(condition.conditions) || !condition.conditions.length) {
      errors.push(`${location}: ${condition.kind} condition requires nested conditions`);
      return;
    }
    condition.conditions.forEach((nested, index) => {
      validateCondition(nested, `${location}.conditions[${index}]`, errors);
    });
    return;
  }
  errors.push(`${location}: unknown condition kind "${condition.kind}"`);
}

function validateEffectValue(value, schema) {
  if (schema.kind === "scalar") return isPositiveFiniteNumber(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (schema.kind === "timed") {
    return value.kind === "timed"
      && isPositiveFiniteNumber(value.value)
      && isPositiveFiniteNumber(value.durationSeconds);
  }
  if (schema.kind === "toggle") return value.kind === "toggle" && typeof value.enabled === "boolean";
  if (schema.kind === "text") return value.kind === "text" && typeof value.text === "string" && value.text.trim().length > 0;
  return false;
}

export function validateTagEffectData({
  productionMedals,
  effects,
  capGroups,
  filterCategories,
  tagEffectGroups,
  caps,
}) {
  const errors = [];
  const knownTagIds = new Set(
    productionMedals.flatMap((medal) => medal.tags.map((tag) => tag.id)),
  );
  const knownFilterCategories = new Set(filterCategories);
  const capGroupById = new Map();
  const effectById = new Map();

  for (const [index, capGroup] of capGroups.entries()) {
    const location = `medalEffectCapGroups[${index}]`;
    if (!capGroup || typeof capGroup !== "object") {
      errors.push(`${location}: expected an object`);
      continue;
    }
    if (typeof capGroup.id !== "string" || !capGroup.id.trim()) {
      errors.push(`${location}: invalid capGroup id`);
    } else if (capGroupById.has(capGroup.id)) {
      errors.push(`${location}: duplicate capGroup definition "${capGroup.id}"`);
    } else {
      capGroupById.set(capGroup.id, capGroup);
    }
    if (typeof capGroup.label !== "string" || !capGroup.label.trim()) {
      errors.push(`${location}: missing capGroup label`);
    }
    if (!isValidValueSchema(capGroup.valueSchema)) {
      errors.push(`${location}: invalid capGroup value schema`);
    }
  }

  for (const [index, effect] of effects.entries()) {
    const location = `medalEffectCatalog[${index}]`;
    if (!effect || typeof effect !== "object") {
      errors.push(`${location}: expected an object`);
      continue;
    }
    if (typeof effect.id !== "string" || !effect.id.trim()) errors.push(`${location}: invalid effect id`);
    if (effectById.has(effect.id)) errors.push(`${location}: duplicate effect id "${effect.id}"`);
    else effectById.set(effect.id, effect);
    if (typeof effect.label !== "string" || !effect.label.trim()) errors.push(`${location}: missing UI label`);
    if (!Array.isArray(effect.filterCategories) || !effect.filterCategories.length) {
      errors.push(`${location}: at least one filter category is required`);
    } else {
      const seenCategories = new Set();
      for (const category of effect.filterCategories) {
        if (!knownFilterCategories.has(category)) errors.push(`${location}: unknown filter category "${category}"`);
        if (seenCategories.has(category)) errors.push(`${location}: duplicate filter category "${category}"`);
        seenCategories.add(category);
      }
    }
    if (!isValidValueSchema(effect.valueSchema)) {
      errors.push(`${location}: invalid value schema`);
    }
    if (hasOwn(effect, "capGroup")) {
      if (typeof effect.capGroup !== "string" || !effect.capGroup.trim()) {
        errors.push(`${location}: invalid capGroup reference`);
      } else {
        const capGroup = capGroupById.get(effect.capGroup);
        if (!capGroup) {
          errors.push(`${location}: unknown capGroup "${effect.capGroup}"`);
        } else if (!areValueSchemasCompatible(effect.valueSchema, capGroup.valueSchema)) {
          errors.push(`${location}: value schema is incompatible with capGroup "${effect.capGroup}"`);
        }
      }
    }
    if (hasOwn(effect, "condition")) {
      validateCondition(effect.condition, `${location}.condition`, errors);
    }
  }

  const seenGroupIds = new Set();
  const groupByTagId = new Map();
  for (const [index, group] of tagEffectGroups.entries()) {
    const location = `tagSetEffectGroups[${index}]`;
    if (!group || typeof group !== "object") {
      errors.push(`${location}: expected an object`);
      continue;
    }
    if (typeof group.id !== "string" || !group.id.trim()) {
      errors.push(`${location}: invalid group id`);
    } else if (seenGroupIds.has(group.id)) {
      errors.push(`${location}: duplicate group id "${group.id}"`);
    }
    seenGroupIds.add(group.id);
    const effect = effectById.get(group.effectId);
    if (!effect) errors.push(`${location}: unknown effectId "${group.effectId}"`);

    if (!Array.isArray(group.tagIds) || !group.tagIds.length) {
      errors.push(`${location}: at least one tagId is required`);
    } else {
      const seenGroupTagIds = new Set();
      for (const tagId of group.tagIds) {
        if (!knownTagIds.has(tagId)) errors.push(`${location}: unknown production tagId "${tagId}"`);
        if (seenGroupTagIds.has(tagId)) errors.push(`${location}: duplicate tagId "${tagId}" inside group`);
        seenGroupTagIds.add(tagId);

        const owningGroupId = groupByTagId.get(tagId);
        if (owningGroupId && owningGroupId !== group.id) {
          errors.push(`${location}: tagId "${tagId}" already belongs to group "${owningGroupId}"`);
        } else if (!owningGroupId) {
          groupByTagId.set(tagId, group.id);
        }
      }
    }

    for (const tier of ["twoSet", "threeSet"]) {
      if (!hasOwn(group, tier)) {
        errors.push(`${location}: missing ${tier}`);
      } else if (effect && !validateEffectValue(group[tier], effect.valueSchema)) {
        errors.push(`${location}: invalid ${tier} value for effect "${group.effectId}"`);
      }
    }
  }

  for (const [capGroupId, cap] of Object.entries(caps)) {
    const location = `effectCaps["${capGroupId}"]`;
    const capGroup = capGroupById.get(capGroupId);
    if (!capGroup) {
      errors.push(`${location}: unknown capGroup`);
      continue;
    }
    if (!cap || typeof cap !== "object" || !hasOwn(cap, "value")) {
      errors.push(`${location}: missing cap value`);
    } else if (!validateEffectValue(cap.value, capGroup.valueSchema)) {
      errors.push(`${location}: invalid cap value`);
    }
  }

  return {
    errors,
    summary: {
      productionMedals: productionMedals.length,
      productionTagIds: knownTagIds.size,
      capGroupDefinitions: capGroupById.size,
      effectDefinitions: effectById.size,
      tagSetEffectGroups: tagEffectGroups.length,
      groupedTagIds: groupByTagId.size,
      effectCaps: Object.keys(caps).length,
    },
  };
}

function run() {
  const result = validateTagEffectData({
    productionMedals: medals,
    effects: medalEffectCatalog,
    capGroups: medalEffectCapGroups,
    filterCategories: medalEffectFilterCategories,
    tagEffectGroups: tagSetEffectGroups,
    caps: effectCaps,
  });
  if (result.errors.length) {
    throw new Error(`Tag Set Effect validation failed:\n- ${result.errors.join("\n- ")}`);
  }
  console.log(JSON.stringify({ ...result.summary, valid: true }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
