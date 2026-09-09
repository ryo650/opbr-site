import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExtraTraitCatalog, renderExtraTraitCatalog } from "./catalog.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, "../..");
const draftArgument = process.argv.indexOf("--draft");
const draftPath = draftArgument === -1
  ? path.join(repositoryRoot, "scripts/medal-importer/draft-medals.json")
  : path.resolve(process.argv[draftArgument + 1]);
const outputPath = path.join(repositoryRoot, "src/data/medals/extra-traits.generated.ts");

const draft = JSON.parse(await readFile(draftPath, "utf8"));
const result = createExtraTraitCatalog(draft);
await writeFile(outputPath, renderExtraTraitCatalog(result));

const byEffect = Object.fromEntries(
  [...new Set(result.definitions.map((definition) => definition.effectId))]
    .sort()
    .map((effectId) => [effectId, result.definitions.filter((definition) => definition.effectId === effectId).length]),
);
console.log(JSON.stringify({
  definitions: result.definitions.length,
  byEffect,
  conditional: result.definitions.filter((definition) => definition.condition).length,
  capGroupLinked: result.definitions.filter((definition) => definition.capGroup).length,
  capGroupUnresolved: result.definitions.filter((definition) => !definition.capGroup).length,
  needsReview: result.needsReview.length,
}, null, 2));
