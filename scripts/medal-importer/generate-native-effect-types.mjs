import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadNativeEffectCatalog,
  renderNativeEffectTypes,
  writeFileAtomic,
} from "./native-effects.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultNativeEffectCatalogPath = path.join(
  importerDir,
  "native-effects.json",
);
export const defaultGeneratedNativeEffectTypesPath = path.resolve(
  importerDir,
  "../../src/data/medals/native-effects.generated.ts",
);

export async function generateNativeEffectTypes({
  catalogPath = defaultNativeEffectCatalogPath,
  generatedTypesPath = defaultGeneratedNativeEffectTypesPath,
} = {}) {
  const catalog = await loadNativeEffectCatalog(catalogPath);
  await writeFileAtomic(generatedTypesPath, renderNativeEffectTypes(catalog));
  return catalog;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const catalog = await generateNativeEffectTypes();
  console.log(`Generated NativeEffectType from ${catalog.length} catalog entries`);
}
