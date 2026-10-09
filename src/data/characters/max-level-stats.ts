import catalog from './max-level-stats.json' with { type: 'json' };

/** Observed display values. These are never silently treated as unboosted Base Stats. */
export type CharacterMaxLevelStats = {
  readonly characterId: string;
  readonly maxStats: {
    readonly hp: number | null;
    readonly atk: number | null;
    readonly def: number | null;
    readonly crit: number | null;
    readonly totalPower: number | null;
  };
  readonly conditions: {
    readonly screen: 'stats-of-max-level';
    readonly level: 100;
    readonly levelMaximum: 100;
    readonly characterBoost: 52;
    readonly characterBoostMaximum: 52;
    readonly medalsEquipped: false;
    readonly supportEffects: 'not-verified';
  };
  readonly reviews: readonly {
    readonly sourceImage: string;
    readonly sourceSha256: string;
    readonly templateId: string;
    readonly approvedAt: string;
    readonly previous: CharacterMaxLevelStats['maxStats'] | null;
    readonly corrected: CharacterMaxLevelStats['maxStats'];
    readonly ocr: Readonly<Record<string, unknown>>;
  }[];
};
// The local importer's validator checks the serialized catalog before every save.
export const characterMaxLevelStatsCatalog = catalog as readonly CharacterMaxLevelStats[];
export const characterMaxLevelStatsByCharacterId = new Map(
  characterMaxLevelStatsCatalog.map(record => [record.characterId, record]),
);
