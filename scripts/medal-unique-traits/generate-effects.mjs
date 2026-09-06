import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { medals } from "../../src/data/medals/medals.ts";
import {
  renderUniqueTraitEffectData,
  summarizeUniqueTraitEffects,
} from "./extract-unique-trait-effects.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "../..");
const outputPath = path.join(
  projectDir,
  "src/data/medals/unique-trait-effects.generated.ts",
);

await writeFile(outputPath, renderUniqueTraitEffectData(medals), "utf8");
const summary = summarizeUniqueTraitEffects(medals);
console.log(JSON.stringify({
  productionUniqueTraits: summary.productionUniqueTraits,
  extractedMedals: summary.extractedMedals,
  extractionCount: summary.extractionCount,
  multipleEffectMedals: summary.multipleEffectMedals,
  needsReviewCount: summary.needsReviewCount,
  unclassifiedCount: summary.unclassifiedCount,
  output: path.relative(projectDir, outputPath),
}, null, 2));
