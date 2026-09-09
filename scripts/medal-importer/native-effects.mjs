import { readFile } from "node:fs/promises";
import { writeFileAtomic } from "./status-effects.mjs";

export const NATIVE_EFFECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeNativeEffectName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function suggestNativeEffectId(name) {
  const id = normalizeNativeEffectName(name)
    .replace(/\bskill\s+(\d+)\b/g, "skill$1")
    .replace(/\s+/g, "-");
  if (!id) throw new Error("Native Effect name must not be empty");
  return id;
}

export function assertNativeEffectId(id) {
  if (typeof id !== "string" || !NATIVE_EFFECT_ID_PATTERN.test(id)) {
    throw new Error(
      `Invalid Native Effect ID: ${JSON.stringify(id)}; expected lowercase kebab-case`,
    );
  }
}

export function validateNativeEffectCatalog(value) {
  if (!Array.isArray(value)) {
    throw new Error("Native Effect catalog must be a JSON array");
  }

  const ids = new Set();
  const names = new Map();
  for (const [index, entry] of value.entries()) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Native Effect catalog entry ${index} must be an object`);
    }
    assertNativeEffectId(entry.id);
    if (
      typeof entry.name !== "string" ||
      !entry.name.trim() ||
      entry.name !== entry.name.trim()
    ) {
      throw new Error(`Native Effect catalog entry ${index} has an invalid name`);
    }
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate Native Effect ID: ${entry.id}`);
    }
    ids.add(entry.id);

    const normalizedName = normalizeNativeEffectName(entry.name);
    const duplicateName = names.get(normalizedName);
    if (duplicateName) {
      throw new Error(
        `Duplicate Native Effect name: ${entry.name} (${duplicateName.id} and ${entry.id})`,
      );
    }
    names.set(normalizedName, entry);
  }
  return value;
}

export async function loadNativeEffectCatalog(catalogPath) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read Native Effect catalog: ${error.message}`);
  }
  return validateNativeEffectCatalog(parsed);
}

export function createNativeEffectIndex(catalog) {
  validateNativeEffectCatalog(catalog);
  return new Map(
    catalog.map((entry) => [normalizeNativeEffectName(entry.name), entry]),
  );
}

export function resolveNativeEffect(index, displayName) {
  return index.get(normalizeNativeEffectName(displayName)) ?? null;
}

function titleCaseTarget(target) {
  const normalized = target.trim().replace(/\s+/g, " ");
  const skill = normalized.match(/^skill\s+(\d+)$/i);
  if (skill) return `Skill ${skill[1]}`;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

export function extractCooldownNativeEffectCandidate(text) {
  const match = text.match(
    /\bboost\s+(?:the\s+)?cooldown\s+reduction\s+speed\s+of\s+(.+?)\s+by\s+\d+(?:[.,]\d+)?%/i,
  );
  if (!match) return null;
  return `${titleCaseTarget(match[1])} cooldown reduction speed`;
}

export function extractDamageNativeEffectCandidate(text) {
  if (/\bincrease\s+damage\s+dealt\s+by\s+\d+(?:[.,]\d+)?%/i.test(text)) {
    return "Damage dealt";
  }
  if (/\breduce\s+damage\s+received\s+by\s+\d+(?:[.,]\d+)?%/i.test(text)) {
    return "Damage received";
  }
  return null;
}

export function createUnknownNativeEffectIssue({
  medalName,
  displayNameCandidate,
  ocrText,
  screenshot,
}) {
  let suggestedId = null;
  try {
    suggestedId = suggestNativeEffectId(displayNameCandidate);
  } catch {
    // Preserve the OCR diagnosis even if no safe slug can be suggested.
  }
  return {
    code: "unknown-native-effect",
    message: `Unknown Native Effect: ${displayNameCandidate}`,
    screenshot,
    ocrText,
    medalName,
    displayNameCandidate,
    unknownNativeEffectText: ocrText,
    suggestedId,
    rateScreen: screenshot,
  };
}

export function validateProductionNativeEffects(medals, catalog) {
  const approvedIds = new Set(
    validateNativeEffectCatalog(catalog).map(({ id }) => id),
  );
  for (const medal of medals) {
    const nativeEffects = medal.nativeEffects ?? [];
    if (new Set(nativeEffects).size !== nativeEffects.length) {
      throw new Error(`Production medal ${medal.id} has duplicate nativeEffects`);
    }
    for (const nativeEffectId of nativeEffects) {
      if (!approvedIds.has(nativeEffectId)) {
        throw new Error(
          `Production medal ${medal.id} uses unknown Native Effect ID: ${nativeEffectId}`,
        );
      }
    }
  }
}

export function renderNativeEffectTypes(catalog) {
  validateNativeEffectCatalog(catalog);
  const ids = catalog.map(({ id }) => `  ${JSON.stringify(id)},`).join("\n");
  return `// Generated from scripts/medal-importer/native-effects.json. Do not edit.\nexport const NATIVE_EFFECT_IDS = [\n${ids}\n] as const;\n\nexport type NativeEffectType = (typeof NATIVE_EFFECT_IDS)[number];\n`;
}

export { writeFileAtomic };
