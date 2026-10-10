import { deriveBaseStatsFromDisplayedStats, getCharacterBoostValues, isCharacterBoostRole } from '../../src/data/characters/boost-profiles.ts';
export const baseFields = ['baseHp', 'baseAtk', 'baseDef'];
const displayFields = ['hp', 'atk', 'def'];

/** Always derive on the server from corrected display values, never client-provided base values. */
export function previewBaseStats(row, records, characters) {
  const issues = [];
  const character = Object.hasOwn(characters, row.characterId ?? '') ? characters[row.characterId] : null;
  const c = row.conditions ?? {};
  if (!character || character.id !== row.characterId || !isCharacterBoostRole(character.role)) issues.push('基礎値を計算できる既存キャラクターIDを選択してください。');
  if (c.screen !== 'stats-of-max-level' || c.level !== 100 || c.levelMaximum !== 100 || c.characterBoost !== 52 || c.characterBoostMaximum !== 52) issues.push('変換には最大画面・Lv100/100・Boost52/52が必要です。');
  for (const field of displayFields) {
    const value = row.maxStats?.[field];
    if (value !== null && (!Number.isSafeInteger(value) || value <= 0 || value > 999999)) issues.push(`${field}: 最大値を修正してください。`);
  }
  const existing = records.find(record => record.characterId === row.characterId) ?? null;
  if (issues.length) return { baseStats: null, boost: null, existing, diff: [], conflict: false, issues };
  const boost = getCharacterBoostValues(character.role, 'boost-max');
  const derived = deriveBaseStatsFromDisplayedStats(Object.fromEntries(displayFields.map(field => [field, row.maxStats[field] ?? 0])), character.role, 'boost-max');
  const baseStats = Object.fromEntries(baseFields.map((field, index) => [field, row.maxStats[displayFields[index]] === null ? null : derived[field]]));
  for (const field of baseFields) if (baseStats[field] !== null && baseStats[field] <= 0) issues.push(`${field}: Boost Maxを差し引いた基礎値が正の整数になりません。最大値を確認してください。`);
  if (baseFields.every(field => baseStats[field] === null)) issues.push('変換にはHP・ATK・DEFのうち最低1項目が必要です。');
  const diff = baseFields.map(field => ({ field, previous: existing?.[field] ?? null, derived: baseStats[field], next: baseStats[field] ?? existing?.[field] ?? null }));
  return { baseStats, boost, existing, diff, conflict: diff.some(item => item.previous !== null && item.derived !== null && item.previous !== item.derived), issues };
}
