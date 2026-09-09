import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const STATUS_EFFECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeStatusEffectName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function suggestStatusEffectId(name) {
  const id = normalizeStatusEffectName(name).replace(/\s+/g, "-");
  if (!id) throw new Error("Status Effect name must not be empty");
  return id;
}

export function assertStatusEffectId(id) {
  if (typeof id !== "string" || !STATUS_EFFECT_ID_PATTERN.test(id)) {
    throw new Error(
      `Invalid Status Effect ID: ${JSON.stringify(id)}; expected lowercase kebab-case`,
    );
  }
}

export function validateStatusEffectCatalog(value) {
  if (!Array.isArray(value)) {
    throw new Error("Status Effect catalog must be a JSON array");
  }

  const ids = new Set();
  const names = new Map();
  for (const [index, entry] of value.entries()) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Status Effect catalog entry ${index} must be an object`);
    }
    assertStatusEffectId(entry.id);
    if (
      typeof entry.name !== "string" ||
      !entry.name.trim() ||
      entry.name !== entry.name.trim()
    ) {
      throw new Error(`Status Effect catalog entry ${index} has an invalid name`);
    }

    if (ids.has(entry.id)) {
      throw new Error(`Duplicate Status Effect ID: ${entry.id}`);
    }
    ids.add(entry.id);

    const normalizedName = normalizeStatusEffectName(entry.name);
    if (!normalizedName) {
      throw new Error(`Status Effect catalog entry ${index} has an empty name`);
    }
    const duplicateName = names.get(normalizedName);
    if (duplicateName) {
      throw new Error(
        `Duplicate Status Effect name: ${entry.name} (${duplicateName.id} and ${entry.id})`,
      );
    }
    names.set(normalizedName, entry);
  }

  return value;
}

export async function loadStatusEffectCatalog(catalogPath) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read Status Effect catalog: ${error.message}`);
  }
  return validateStatusEffectCatalog(parsed);
}

export function createStatusEffectIndex(catalog) {
  validateStatusEffectCatalog(catalog);
  return new Map(
    catalog.map((entry) => [normalizeStatusEffectName(entry.name), entry]),
  );
}

export function resolveStatusEffect(index, displayName) {
  return index.get(normalizeStatusEffectName(displayName)) ?? null;
}

export function createUnknownStatusEffectIssue({
  medalName,
  displayNameCandidate,
  ocrText,
  screenshot,
}) {
  let suggestedId = null;
  try {
    suggestedId = suggestStatusEffectId(displayNameCandidate);
  } catch {
    // Keep the OCR failure reviewable even when it cannot produce a safe slug.
  }
  return {
    code: "unknown-status-effect",
    message: `Unknown Status Effect: ${displayNameCandidate}`,
    screenshot,
    ocrText,
    medalName,
    displayNameCandidate,
    unknownStatusText: displayNameCandidate,
    suggestedId,
    rateScreen: screenshot,
  };
}

export function validateProductionStatusEffects(medals, catalog) {
  const approvedIds = new Set(
    validateStatusEffectCatalog(catalog).map(({ id }) => id),
  );
  for (const medal of medals) {
    for (const statusEffectId of medal.statusReductions ?? []) {
      if (!approvedIds.has(statusEffectId)) {
        throw new Error(
          `Production medal ${medal.id} uses unknown Status Effect ID: ${statusEffectId}`,
        );
      }
    }
  }
}

export function renderStatusEffectTypes(catalog) {
  validateStatusEffectCatalog(catalog);
  const ids = catalog.map(({ id }) => `  ${JSON.stringify(id)},`).join("\n");
  return `// Generated from scripts/medal-importer/status-effects.json. Do not edit.\nexport const STATUS_EFFECT_IDS = [\n${ids}\n] as const;\n\nexport type StatusEffectType = (typeof STATUS_EFFECT_IDS)[number];\n`;
}

export async function writeFileAtomic(filePath, content) {
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.tmp`,
  );
  await writeFile(temporaryPath, content);
  await rename(temporaryPath, filePath);
}
