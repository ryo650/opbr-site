import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadStatusEffectCatalog,
  renderStatusEffectTypes,
  writeFileAtomic,
} from "./status-effects.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultCatalogPath = path.join(importerDir, "status-effects.json");
export const defaultGeneratedTypesPath = path.resolve(
  importerDir,
  "../../src/data/medals/status-effects.generated.ts",
);

export async function generateStatusEffectTypes({
  catalogPath = defaultCatalogPath,
  generatedTypesPath = defaultGeneratedTypesPath,
} = {}) {
  const catalog = await loadStatusEffectCatalog(catalogPath);
  await writeFileAtomic(generatedTypesPath, renderStatusEffectTypes(catalog));
  return catalog;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const catalog = await generateStatusEffectTypes();
  console.log(`Generated StatusEffectType from ${catalog.length} catalog entries`);
}
