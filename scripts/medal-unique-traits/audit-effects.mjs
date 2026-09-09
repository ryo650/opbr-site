import { medals } from "../../src/data/medals/medals.ts";
import { summarizeUniqueTraitEffects } from "./extract-unique-trait-effects.mjs";

const summary = summarizeUniqueTraitEffects(medals);

console.log("=== UNIQUE TRAIT EFFECT EXTRACTION ===");
console.log(`Production Unique Traits: ${summary.productionUniqueTraits}`);
console.log(`Effect extraction success Medals: ${summary.extractedMedals}`);
console.log(`Extractions: ${summary.extractionCount}`);
console.log(`Multiple-Effect Medals: ${summary.multipleEffectMedals}`);
console.log(`Needs review: ${summary.needsReviewCount}`);
console.log(`Unclassified (no extraction, no review issue): ${summary.unclassifiedCount}`);
console.log(`No extraction total: ${summary.noExtractionCount}`);

console.log("\n=== EFFECT / VALUE COUNTS ===");
for (const [effectId, count] of Object.entries(summary.effectCounts)) {
  console.log(`\n${effectId}: ${count}`);
  for (const [value, valueCount] of Object.entries(summary.valueCounts[effectId])) {
    console.log(`- ${value}: ${valueCount}`);
  }
}

console.log("\n=== NEEDS REVIEW ===");
if (!summary.needsReview.length) console.log("none");
for (const issue of summary.needsReview) {
  console.log(`\n- medalId: ${issue.medalId}`);
  console.log(`  medalName: ${issue.medalName}`);
  console.log(`  originalText: ${issue.originalText}`);
  console.log(`  reason: ${issue.reason}`);
}

console.log("\n=== UNCLASSIFIED ===");
if (!summary.unclassified.length) console.log("none");
for (const item of summary.unclassified) {
  console.log(`- ${item.medalId} | ${item.medalName} | ${item.originalText}`);
}
