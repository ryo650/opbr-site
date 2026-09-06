import { getUniqueTraitReviewReason } from "./classify-unique-traits.mjs";

const percentRule = (effectId, pattern) => ({ effectId, pattern, unit: "percent" });

// These rules intentionally match only reviewed production wording. Conditions and
// durations remain in originalText until a later condition parser is introduced.
const EXTRACTION_RULES = [
  percentRule("normal-attack-damage-dealt-increase", /\bincrease\s+normal attack\s+damage dealt by\s+(\d+(?:\.\d+)?)%/gi),
  percentRule("damage-dealt-increase", /\bincrease\s+damage dealt by\s+(\d+(?:\.\d+)?)%/gi),
  percentRule("damage-dealt-increase", /\bincrease\s+damage to\s+[^.:%]+?\s+by\s+(\d+(?:\.\d+)?)%/gi),
  percentRule("damage-received-reduction", /\breduce\s+(?:tale\s+)?damage received by\s+(\d+(?:\.\d+)?)%/gi),
  percentRule("skill1-cooldown-reduction-speed", /\bboost\s+(?:tale\s+)?the cooldown reduction speed of skill\s*1 by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("skill2-cooldown-reduction-speed", /\bboost\s+(?:tale\s+)?the cooldown reduction speed of skill\s*2 by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("dodge-cooldown-reduction-speed", /\bboost\s+(?:tale\s+)?the cooldown reduction speed of dodge by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("skill1-cooldown-reduction-speed", /\breduce the cooldown time of skill\s*1 by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("skill2-cooldown-reduction-speed", /\breduce the cooldown time of skill\s*2 by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("capture-speed-increase", /\b(?:boost|increase)(?:\s+(?:tale|tae))?\s+capture speed by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("hp-increase", /\bincrease hp by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("atk-increase", /\bincrease atk by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("crit-increase", /\bincrease crit by\s*(\d+(?:\.\d+)?)%/gi),
  percentRule("crit-increase-timed-cannot-stack", /\bcrit:\s*boosted by\s*(\d+(?:\.\d+)?)%\s+for\s+\d+(?:\.\d+)?\s+second/gi),
  percentRule("spd-increase-timed-cannot-stack", /\bspd:\s*boosted by\s*(\d+(?:\.\d+)?)%\s+for\s+\d+(?:\.\d+)?\s+second/gi),
];

// Production currently has no unconditional DEF/SPD Increase or Status Effect
// Duration Reduction wording. Their catalog entries are not treated as evidence;
// a future matching candidate is sent to review until its exact wording is reviewed.

const SUPPORTED_EFFECT_CANDIDATE = /\b(?:cooldown|increase\s+(?:normal attack\s+)?damage|reduce\s+(?:tale\s+)?damage received|(?:boost|increase)(?:\s+(?:tale|tae))?\s+capture speed|increase\s+(?:hp|atk|def|crit|spd)\s+by|(?:crit|spd):\s*boosted)\b/i;

export function extractUniqueTraitEffects(uniqueTrait) {
  const indexedExtractions = [];

  for (const rule of EXTRACTION_RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of uniqueTrait.matchAll(rule.pattern)) {
      const value = Number(match[1]);
      if (!Number.isFinite(value)) continue;
      indexedExtractions.push({
        index: match.index,
        extraction: {
          effectId: rule.effectId,
          value,
          unit: rule.unit,
          originalText: uniqueTrait,
        },
      });
    }
  }

  indexedExtractions.sort((left, right) => left.index - right.index);
  return indexedExtractions.map(({ extraction }) => extraction);
}

export function getUniqueTraitEffectReviewReason(uniqueTrait, extractions = extractUniqueTraitEffects(uniqueTrait)) {
  const missingEffectReason = getUniqueTraitReviewReason(uniqueTrait);
  if (missingEffectReason) return missingEffectReason;
  if (extractions.length) return null;
  if (/\breduce\s+(?:tale\s+)?damage received by\s*$/i.test(uniqueTrait)) {
    return "Damage Received Reduction is missing its numeric value.";
  }
  if (/\b(?:increase|reduce|recover|boost)\b[^.]*\bby\s*$/i.test(uniqueTrait)) {
    return "The Effect is missing its numeric value.";
  }
  if (/\bcooldown\b/i.test(uniqueTrait)) {
    return "The cooldown Effect target or numeric value is ambiguous or OCR-corrupted.";
  }
  if (SUPPORTED_EFFECT_CANDIDATE.test(uniqueTrait)) {
    return "A supported Effect is present, but its Effect or numeric value could not be extracted safely.";
  }
  return null;
}

export function buildUniqueTraitEffectData(medals) {
  const effectsByMedalId = {};
  const needsReview = [];
  const unclassified = [];

  for (const medal of medals) {
    const extractions = extractUniqueTraitEffects(medal.uniqueTrait);
    effectsByMedalId[medal.id] = extractions;
    const reason = getUniqueTraitEffectReviewReason(medal.uniqueTrait, extractions);
    if (reason) {
      needsReview.push({
        medalId: medal.id,
        medalName: medal.name,
        originalText: medal.uniqueTrait,
        reason,
      });
    } else if (!extractions.length) {
      unclassified.push({
        medalId: medal.id,
        medalName: medal.name,
        originalText: medal.uniqueTrait,
      });
    }
  }

  return { effectsByMedalId, needsReview, unclassified };
}

export function summarizeUniqueTraitEffects(medals) {
  const { effectsByMedalId, needsReview, unclassified } = buildUniqueTraitEffectData(medals);
  const extractedEntries = Object.entries(effectsByMedalId).filter(([, effects]) => effects.length);
  const effectCounts = {};
  const valueCounts = {};

  for (const effects of Object.values(effectsByMedalId)) {
    for (const effect of effects) {
      effectCounts[effect.effectId] = (effectCounts[effect.effectId] ?? 0) + 1;
      const valueKey = `${effect.value}${effect.unit === "percent" ? "%" : ` ${effect.unit}`}`;
      valueCounts[effect.effectId] ??= {};
      valueCounts[effect.effectId][valueKey] = (valueCounts[effect.effectId][valueKey] ?? 0) + 1;
    }
  }

  return {
    productionUniqueTraits: medals.length,
    extractedMedals: extractedEntries.length,
    extractionCount: extractedEntries.reduce((total, [, effects]) => total + effects.length, 0),
    multipleEffectMedals: extractedEntries.filter(([, effects]) => effects.length > 1).length,
    effectCounts,
    valueCounts,
    needsReviewCount: needsReview.length,
    unclassifiedCount: unclassified.length,
    noExtractionCount: medals.length - extractedEntries.length,
    needsReview,
    unclassified,
  };
}

export function renderUniqueTraitEffectData(medals) {
  const { effectsByMedalId, needsReview } = buildUniqueTraitEffectData(medals);
  return `/* This file is generated by scripts/medal-unique-traits/generate-effects.mjs. */

import type { MedalEffectId, MedalEffectValueUnit } from "./medal-effect-catalog";

export type UniqueTraitEffectExtraction = {
  readonly effectId: MedalEffectId;
  readonly value: number;
  readonly unit: MedalEffectValueUnit;
  readonly originalText: string;
};

export type UniqueTraitEffectNeedsReview = {
  readonly medalId: string;
  readonly medalName: string;
  readonly originalText: string;
  readonly reason: string;
};

export const uniqueTraitEffectsByMedalId: Readonly<Record<string, readonly UniqueTraitEffectExtraction[]>> = ${JSON.stringify(effectsByMedalId, null, 2)};

export const uniqueTraitEffectNeedsReview = ${JSON.stringify(needsReview, null, 2)} as const satisfies readonly UniqueTraitEffectNeedsReview[];
`;
}
