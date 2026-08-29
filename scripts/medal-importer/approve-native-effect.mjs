import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertNativeEffectId,
  createNativeEffectIndex,
  loadNativeEffectCatalog,
  normalizeNativeEffectName,
  renderNativeEffectTypes,
  suggestNativeEffectId,
  validateNativeEffectCatalog,
  writeFileAtomic,
} from "./native-effects.mjs";
import {
  defaultGeneratedNativeEffectTypesPath,
  defaultNativeEffectCatalogPath,
} from "./generate-native-effect-types.mjs";

export function parseNativeEffectApprovalArguments(args) {
  let name = null;
  let id = null;
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--name" || argument === "--id") {
      if (index + 1 >= args.length) {
        throw new Error(`${argument} requires a value`);
      }
      if (argument === "--name") name = args[index + 1];
      else id = args[index + 1];
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    positional.push(argument);
  }
  if (positional.length > 1 || (name !== null && positional.length > 0)) {
    throw new Error("Provide the Native Effect name once, positionally or with --name");
  }
  name ??= positional[0] ?? null;
  if (name === null || !name.trim()) {
    throw new Error("Native Effect name must not be empty");
  }
  return { name: name.trim().replace(/\s+/g, " "), id };
}

export async function approveNativeEffect({
  name,
  id,
  catalogPath = defaultNativeEffectCatalogPath,
  generatedTypesPath = defaultGeneratedNativeEffectTypesPath,
}) {
  const displayName = name.trim().replace(/\s+/g, " ");
  if (!displayName) throw new Error("Native Effect name must not be empty");
  const catalog = await loadNativeEffectCatalog(catalogPath);
  const existingName = createNativeEffectIndex(catalog).get(
    normalizeNativeEffectName(displayName),
  );
  if (existingName && (id === undefined || id === null)) {
    return { entry: existingName, changed: false, catalog };
  }

  const approvedId =
    id === undefined || id === null
      ? suggestNativeEffectId(displayName)
      : id;
  assertNativeEffectId(approvedId);

  const existingId = catalog.find((entry) => entry.id === approvedId);
  if (existingName && existingName.id !== approvedId) {
    throw new Error(
      `Native Effect name ${JSON.stringify(displayName)} already uses ID ${existingName.id}`,
    );
  }
  if (
    existingId &&
    normalizeNativeEffectName(existingId.name) !==
      normalizeNativeEffectName(displayName)
  ) {
    throw new Error(
      `Native Effect ID ${approvedId} already uses name ${JSON.stringify(existingId.name)}`,
    );
  }
  if (existingName) {
    return { entry: existingName, changed: false, catalog };
  }

  const entry = { id: approvedId, name: displayName };
  const nextCatalog = validateNativeEffectCatalog([...catalog, entry]);
  await writeFileAtomic(
    generatedTypesPath,
    renderNativeEffectTypes(nextCatalog),
  );
  await writeFileAtomic(
    catalogPath,
    `${JSON.stringify(nextCatalog, null, 2)}\n`,
  );
  return { entry, changed: true, catalog: nextCatalog };
}

async function main() {
  const options = parseNativeEffectApprovalArguments(process.argv.slice(2));
  const result = await approveNativeEffect(options);
  console.log(
    result.changed
      ? "Approved Native Effect"
      : "Native Effect already approved",
  );
  console.log(`name: ${result.entry.name}`);
  console.log(`id: ${result.entry.id}`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}
