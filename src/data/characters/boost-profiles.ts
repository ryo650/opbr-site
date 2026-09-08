import type { Character } from "./type.ts";

export type CharacterBoostStageId = "base" | "boost-1" | "boost-2" | "boost-3" | "boost-max";
export type CharacterBoostRole = Exclude<Character["role"], "unknown">;

export type CharacterBoostValues = {
  readonly hp: number;
  readonly atk: number;
  readonly def: number;
};

export type CharacterBoostStage = {
  readonly id: CharacterBoostStageId;
  readonly label: string;
};

export type CharacterBoostProfile = {
  readonly role: CharacterBoostRole;
  readonly stageId: CharacterBoostStageId;
  readonly label: string;
  readonly values: CharacterBoostValues;
};

export const characterBoostStages: readonly CharacterBoostStage[] = [
  { id: "base", label: "Base" },
  { id: "boost-1", label: "1" },
  { id: "boost-2", label: "2" },
  { id: "boost-3", label: "3" },
  { id: "boost-max", label: "Max" },
];

const base = { hp: 0, atk: 0, def: 0 } as const;
const boostMax = { hp: 2_580, atk: 640, def: 640 } as const;

export const characterBoostProfiles: Readonly<
  Record<CharacterBoostRole, Readonly<Record<CharacterBoostStageId, CharacterBoostValues>>>
> = {
  attacker: {
    base,
    "boost-1": { hp: 1_120, atk: 390, def: 280 },
    "boost-2": { hp: 1_920, atk: 540, def: 480 },
    "boost-3": { hp: 2_300, atk: 600, def: 575 },
    "boost-max": boostMax,
  },
  runner: {
    base,
    "boost-1": { hp: 1_560, atk: 280, def: 280 },
    "boost-2": { hp: 2_160, atk: 480, def: 480 },
    "boost-3": { hp: 2_410, atk: 575, def: 575 },
    "boost-max": boostMax,
  },
  defender: {
    base,
    "boost-1": { hp: 1_120, atk: 280, def: 390 },
    "boost-2": { hp: 1_920, atk: 480, def: 540 },
    "boost-3": { hp: 2_300, atk: 575, def: 600 },
    "boost-max": boostMax,
  },
};

const stageLabelById = new Map(characterBoostStages.map((stage) => [stage.id, stage.label]));

export function isCharacterBoostRole(role: Character["role"]): role is CharacterBoostRole {
  return role === "attacker" || role === "runner" || role === "defender";
}

export function getCharacterBoostProfile(
  role: CharacterBoostRole,
  stageId: CharacterBoostStageId,
): CharacterBoostProfile {
  return {
    role,
    stageId,
    label: stageLabelById.get(stageId) ?? stageId,
    values: characterBoostProfiles[role][stageId],
  };
}

export function getCharacterBoostValues(
  role: CharacterBoostRole,
  stageId: CharacterBoostStageId,
): CharacterBoostValues {
  return characterBoostProfiles[role][stageId];
}

export function deriveBaseStatsFromDisplayedStats(
  displayed: CharacterBoostValues,
  role: CharacterBoostRole,
  stageId: CharacterBoostStageId,
) {
  const boost = getCharacterBoostValues(role, stageId);
  return {
    baseHp: displayed.hp - boost.hp,
    baseAtk: displayed.atk - boost.atk,
    baseDef: displayed.def - boost.def,
  } as const;
}
