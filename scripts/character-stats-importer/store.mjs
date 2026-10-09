import { createHash } from 'node:crypto';
import { readFile, open, rename, rm } from 'node:fs/promises';
import { applyCorrection, reviewIssues, statFields } from './draft.mjs';
const revisionOf = text => createHash('sha256').update(text).digest('hex');
export async function readCatalog(path, characters) {
  const text = await readFile(path, 'utf8');
  const records = JSON.parse(text);
  if (!Array.isArray(records)) throw new Error('Catalog must be an array');
  const seen = new Set();
  for (const row of records) {
    if (reviewIssues(row, characters).length || seen.has(row.characterId) || !Array.isArray(row.reviews) || !row.reviews.length) throw new Error(`Invalid existing catalog record: ${row.characterId}`);
    seen.add(row.characterId);
  }
  return { records, revision: revisionOf(text) };
}
export function prepareSave({ records, drafts, selections, characters, approvedAt = new Date().toISOString() }) {
  if (!Array.isArray(selections) || !selections.length) throw new Error('Select at least one reviewed row');
  const byId = new Map(drafts.map(draft => [draft.id, draft]));
  const seen = new Set();
  const next = new Map(records.map(row => [row.characterId, row]));
  const savedIds = [];
  for (const input of selections) {
    const draft = byId.get(input.draftId);
    if (!draft || draft.status === 'saved') throw new Error('Unknown or already saved draft');
    if (input.reviewed !== true) throw new Error('Confirm the screenshot, character identity and all values before saving');
    const corrected = applyCorrection(draft, input);
    const issues = reviewIssues(corrected, characters);
    if (issues.length) throw new Error(issues.join(' '));
    if (seen.has(corrected.characterId)) throw new Error(`Duplicate character in approval batch: ${corrected.characterId}`);
    seen.add(corrected.characterId);
    const existing = next.get(corrected.characterId);
    const differing = statFields.filter(field => existing?.maxStats[field] != null && corrected.maxStats[field] != null && existing.maxStats[field] !== corrected.maxStats[field]);
    if (differing.length && input.allowOverwrite !== true) throw new Error(`Existing values differ (${differing.join(', ')}). Review the diff and explicitly allow overwrite.`);
    const maxStats = Object.fromEntries(statFields.map(field => [field, corrected.maxStats[field] ?? existing?.maxStats[field] ?? null]));
    const record = {
      characterId: corrected.characterId, maxStats, conditions: corrected.conditions,
      reviews: [...(existing?.reviews ?? []), {
        sourceImage: draft.sourceImage, sourceSha256: draft.sourceSha256,
        templateId: draft.templateId, engine: draft.engine ?? 'test', approvedAt,
        previous: existing?.maxStats ?? null, corrected: corrected.maxStats,
        originalIdentity: draft.identityText, originalMatch: draft.match,
        originalStats: draft.maxStats, originalConditions: draft.conditions,
        confirmedConditions: corrected.conditions, ocr: draft.ocr,
      }],
    };
    next.set(record.characterId, record);
    savedIds.push(draft.id);
  }
  return { records: [...next.values()], savedIds };
}
/** All selected rows validate before a single atomic catalog replacement. */
export async function saveApproved({ path, expectedRevision, drafts, selections, characters }) {
  const lockPath = `${path}.lock`;
  const tempPath = `${path}.${process.pid}.tmp`;
  const lock = await open(lockPath, 'wx').catch(() => { throw new Error('Catalog is being saved by another process; retry after it completes'); });
  try {
    const snapshot = await readCatalog(path, characters);
    if (snapshot.revision !== expectedRevision) throw new Error('Catalog changed since preview. Reload and review the new diff.');
    const plan = prepareSave({ ...snapshot, drafts, selections, characters });
    const file = await open(tempPath, 'wx');
    try { await file.writeFile(JSON.stringify(plan.records, null, 2) + '\n'); await file.sync(); }
    finally { await file.close(); }
    if (revisionOf(await readFile(path, 'utf8')) !== expectedRevision) throw new Error('Catalog changed during save; nothing replaced');
    await rename(tempPath, path);
    return { ...plan, revision: revisionOf(await readFile(path, 'utf8')) };
  } finally { await lock.close(); await rm(lockPath, { force: true }); await rm(tempPath, { force: true }); }
}
