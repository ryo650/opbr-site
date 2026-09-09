import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertStatusEffectId,
  createStatusEffectIndex,
  loadStatusEffectCatalog,
  normalizeStatusEffectName,
  renderStatusEffectTypes,
  suggestStatusEffectId,
  validateStatusEffectCatalog,
  writeFileAtomic,
} from "./status-effects.mjs";
import {
  defaultCatalogPath,
  defaultGeneratedTypesPath,
} from "./generate-status-types.mjs";

export function parseApprovalArguments(args) {
  let name = null;
  let id = null;
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--name" || argument === "--id") {
      if (index + 1 >= args.length) {
        throw new Error(`${argument} requires a value`);
      }
      const value = args[index + 1];
      if (argument === "--name") name = value;
      else id = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    positional.push(argument);
  }

  if (positional.length > 1 || (name !== null && positional.length > 0)) {
    throw new Error("Provide the Status Effect name once, positionally or with --name");
  }
  name ??= positional[0] ?? null;
  if (name === null || !name.trim()) {
    throw new Error("Status Effect name must not be empty");
  }
  return { name: name.trim().replace(/\s+/g, " "), id };
}

export async function approveStatusEffect({
  name,
  id,
  catalogPath = defaultCatalogPath,
  generatedTypesPath = defaultGeneratedTypesPath,
}) {
  const displayName = name.trim().replace(/\s+/g, " ");
  if (!displayName) throw new Error("Status Effect name must not be empty");
  const approvedId = id === undefined || id === null
    ? suggestStatusEffectId(displayName)
    : id;
  assertStatusEffectId(approvedId);

  const catalog = await loadStatusEffectCatalog(catalogPath);
  const byName = createStatusEffectIndex(catalog);
  const existingName = byName.get(normalizeStatusEffectName(displayName));
  const existingId = catalog.find((entry) => entry.id === approvedId);

  if (existingName && existingName.id !== approvedId) {
    throw new Error(
      `Status Effect name ${JSON.stringify(displayName)} already uses ID ${existingName.id}`,
    );
  }
  if (
    existingId &&
    normalizeStatusEffectName(existingId.name) !==
      normalizeStatusEffectName(displayName)
  ) {
    throw new Error(
      `Status Effect ID ${approvedId} already uses name ${JSON.stringify(existingId.name)}`,
    );
  }
  if (existingName) {
    return { entry: existingName, changed: false, catalog };
  }

  const entry = { id: approvedId, name: displayName };
  const nextCatalog = validateStatusEffectCatalog([...catalog, entry]);
  const catalogJson = `${JSON.stringify(nextCatalog, null, 2)}\n`;
  const generatedTypes = renderStatusEffectTypes(nextCatalog);

  // Publish the derived file first. If interrupted, validation reports that it
  // is ahead of the catalog; production data is never involved in this update.
  await writeFileAtomic(generatedTypesPath, generatedTypes);
  await writeFileAtomic(catalogPath, catalogJson);
  return { entry, changed: true, catalog: nextCatalog };
}

async function main() {
  const options = parseApprovalArguments(process.argv.slice(2));
  const result = await approveStatusEffect(options);
  console.log(result.changed ? "Approved Status Effect" : "Status Effect already approved");
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
