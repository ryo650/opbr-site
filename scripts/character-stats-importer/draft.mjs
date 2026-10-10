import { randomUUID } from 'node:crypto';
import { createCharacterNameMatcher, normalizeCharacterName } from '../character-level-100-stats/screenshot-importer.mjs';
export const statFields = ['hp', 'atk', 'def', 'crit', 'totalPower'];
// Ambiguous tokens and glyph substitutions must be corrected by the reviewer.
export function readNumber(region, decimal = false) {
  const texts = region?.lines ?? [];
  if (texts.length !== 1) return null;
  const value = texts[0].trim().replace(/^\+/, '').replace(/%$/, '').replace(/,/g, '');
  if (!(decimal ? /^\d+(?:\.\d+)?$/ : /^\d+$/).test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function readPair(region, prefix = '') {
  const text = (region?.lines ?? []).join(' ');
  const match = text.match(prefix ? /\bLv\.?\s*(\d+)\s*\/\s*(\d+)\b/i : /^(\d+)\s*\/\s*(\d+)$/);
  return match ? [Number(match[1]), Number(match[2])] : [null, null];
}
export function buildDraft(evidence, characters, aliases = {}) {
  const identityLines = evidence.ocr.identity?.lines ?? [...(evidence.ocr.identityTitle?.lines ?? []), ...(evidence.ocr.identityName?.lines ?? [])];
  const identityText = identityLines.join(' ');
  // Title + personal name must match together; fuzzy names are suggestions only.
  const match = createCharacterNameMatcher(characters, aliases)({ characterName: identityText, identityLines });
  const [level, levelMaximum] = readPair(evidence.ocr.level, 'Lv');
  const [characterBoost, characterBoostMaximum] = readPair(evidence.ocr.boost);
  const preview = normalizeCharacterName((evidence.ocr.preview?.lines ?? []).join(' ')).includes('stats of max level');
  return {
    ...evidence, id: randomUUID(), identityText, match,
    characterId: match.status === 'matched' ? match.characterId : null,
    maxStats: Object.fromEntries(statFields.map(field => [field, readNumber(evidence.ocr[field], field === 'crit')])),
    conditions: { screen: preview ? 'stats-of-max-level' : null, level, levelMaximum, characterBoost, characterBoostMaximum,
      // Equipment icons cannot reliably establish this with OCR.
      medalsEquipped: null, supportEffects: 'not-verified' },
    status: 'pending',
  };
}
export function reviewIssues(row, characters) {
  const issues = [];
  if (!row.characterId || !Object.hasOwn(characters, row.characterId) || characters[row.characterId].id !== row.characterId) issues.push('既存のキャラクターIDを選択してください。');
  for (const field of statFields) {
    const value = row.maxStats?.[field];
    if (value === null) continue;
    const maximum = field === 'crit' ? 100 : 999999;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > maximum || (field !== 'crit' && !Number.isSafeInteger(value))) issues.push(`${field}: 正の数値を入力するか空欄にしてください。`);
  }
  if (!['hp', 'atk', 'def'].some(field => typeof row.maxStats?.[field] === 'number')) issues.push('HP・ATK・DEFのうち少なくとも1項目が必要です。');
  const c = row.conditions ?? {};
  if (c.screen !== 'stats-of-max-level' || c.level !== 100 || c.levelMaximum !== 100 || c.characterBoost !== 52 || c.characterBoostMaximum !== 52) issues.push('最大ステータス画面・Lv100/100・Boost52/52を確認してください。');
  if (c.supportEffects !== 'not-verified') issues.push('サポート効果の状態が不明です。');
  if (c.medalsEquipped !== false) issues.push('メダル未装備を画像で確認してください。');
  return issues;
}
export function applyCorrection(draft, input) {
  return {
    ...draft, characterId: input.characterId,
    maxStats: Object.fromEntries(statFields.map(field => [field, input.maxStats?.[field] ?? null])),
    conditions: { ...draft.conditions, ...Object.fromEntries(['screen', 'level', 'levelMaximum', 'characterBoost', 'characterBoostMaximum', 'medalsEquipped'].map(field => [field, input.conditions?.[field] ?? null])) },
  };
}
