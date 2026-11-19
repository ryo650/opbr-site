import { scouts } from ".";
import { characters } from "@/data/characters";
import type { Character } from "@/data/characters/type";
import type { ScoutBanner } from "./type";
import type { ScoutDefinition } from "./simulator-type";
import { getScoutSummary } from "./simulator-type";
import { validateStepUpDefinition } from "@/lib/scout-step-up";

export function adaptNormalScout(legacy: ScoutBanner): ScoutDefinition { return { kind: "normal", legacy }; }

function validateNormalScout(scout: ScoutBanner, characterRecord: Record<string, Character>) {
  for (const key of ["id", "name", "bannerImg", "startAt", "endAt", "featuredCharacterId"] as const) {
    if (typeof scout[key] !== "string" || !scout[key].trim()) throw new Error(`Invalid normal ${key}`);
  }
  if (!(Date.parse(scout.startAt) < Date.parse(scout.endAt))) throw new Error("Invalid normal period");
  if (!scout.pullOptions) throw new Error("Invalid normal pull options");
  for (const option of [scout.pullOptions.single, scout.pullOptions.multi]) {
    if (!option || !Number.isSafeInteger(option.pullCount) || option.pullCount < 1 || !Number.isSafeInteger(option.diamondCost) || option.diamondCost < 0) throw new Error("Invalid normal pull option");
  }
  const categories = ["pickup", "ex", "bf", "star-4", "star-3", "star-2", "sp", "free", "exchange", "cola"];
  if (!scout.rates || Object.entries(scout.rates).some(([key, rate]) => !categories.includes(key) || !Number.isFinite(rate) || rate < 0) || !(Object.values(scout.rates).reduce((sum, rate) => sum + rate, 0) > 0)) throw new Error("Invalid normal rates");
  if (!Array.isArray(scout.pickups)) throw new Error("Invalid normal pickups");
  const seen = new Set();
  for (const pickup of scout.pickups) {
    if (!Object.hasOwn(characterRecord, pickup.characterId) || seen.has(pickup.characterId) || !Number.isFinite(pickup.rate) || pickup.rate < 0) throw new Error("Invalid normal pickup");
    seen.add(pickup.characterId);
  }
  if (!seen.has(scout.featuredCharacterId)) throw new Error("Invalid normal featured character");
}

export function validateScoutRegistry(definitions: readonly ScoutDefinition[], characterRecord: Record<string, Character>): void {
  const seen = new Set<string>();
  for (const definition of definitions) {
    switch (definition.kind) {
      case "normal":
        // Preserve the legacy rates (including relative totals) and roller semantics.
        if (!definition.legacy || typeof definition.legacy.id !== "string" || !definition.legacy.id.trim()) throw new Error("Invalid normal definition");
        validateNormalScout(definition.legacy, characterRecord);
        break;
      case "stepUp": validateStepUpDefinition(definition, characterRecord); break;
      default: throw new Error("Unsupported scout kind");
    }
    const summary = getScoutSummary(definition);
    if (seen.has(summary.id)) throw new Error(`Duplicate scout id: ${summary.id}`);
    seen.add(summary.id);
  }
}

// Keep fixtures out of the public route/list/sitemap boundary even if imported by mistake.
export function createPublishedScoutRegistry(definitions: readonly ScoutDefinition[], characterRecord: Record<string, Character>): readonly ScoutDefinition[] {
  validateScoutRegistry(definitions, characterRecord);
  for (const definition of definitions) {
    if (definition.kind === "stepUp" && (definition.source.kind === "fixture" || Object.values(definition.pools).some(pool => pool.source.kind === "fixture"))) {
      throw new Error("Development fixtures cannot be registered as published Scouts");
    }
  }
  return definitions;
}

// Reviewed real Scouts only. Development fixtures must never be added here.
export const simulatorScouts = createPublishedScoutRegistry(scouts.map(adaptNormalScout), characters);
export const simulatorScoutSummaries = simulatorScouts.map(getScoutSummary);
