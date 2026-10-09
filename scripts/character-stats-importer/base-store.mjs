import { createHash } from 'node:crypto';
import { readFile, open, rename, rm, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { validateCharacterLevel100BaseStats } from '../character-level-100-stats/validate.mjs';
import { applyCorrection, reviewIssues } from './draft.mjs';
import { baseFields, previewBaseStats } from './base-conversion.mjs';
const revisionOf = text => createHash('sha256').update(text).digest('hex');

/** Parse literals rather than executing the editable catalog. Unsupported schema changes stop saves. */
export function parseBaseCatalog(text, characters) {
  const source = ts.createSourceFile('level-100-base-stats.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (source.parseDiagnostics.length) throw new Error('Base Stats source contains syntax errors');
  const declarations = source.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations]).filter(node => node.name.getText(source) === 'characterLevel100BaseStatsCatalog');
  const array = declarations.length === 1 ? declarations[0].initializer : null;
  if (!array || !ts.isArrayLiteralExpression(array)) throw new Error('Unsupported Base Stats catalog declaration');
  const nodes = new Map();
  const records = array.elements.map(entry => {
    if (!ts.isObjectLiteralExpression(entry)) throw new Error('Base Stats catalog must contain object literals');
    const fields = new Map();
    const record = {};
    for (const property of entry.properties) {
      if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) throw new Error('Unsupported Base Stats property');
      const name = property.name.text;
      if (!['characterId', ...baseFields].includes(name) || fields.has(name)) throw new Error('Unexpected Base Stats property');
      const value = property.initializer;
      if (name === 'characterId' && ts.isStringLiteral(value)) record[name] = value.text;
      else if (name !== 'characterId' && value.kind === ts.SyntaxKind.NullKeyword) record[name] = null;
      else if (name !== 'characterId' && ts.isNumericLiteral(value)) record[name] = Number(value.text);
      else throw new Error('Base Stats values must be literal IDs, positive integers or null');
      fields.set(name, value);
    }
    if (fields.size !== 4) throw new Error('Base Stats record is missing fields');
    nodes.set(record.characterId, fields);
    return record;
  });
  const audit = validateCharacterLevel100BaseStats(records, characters);
  if (audit.errors.length) throw new Error(`Invalid Base Stats catalog: ${audit.errors.join('; ')}`);
  return { records, source, array, nodes };
}
export async function readBaseCatalog(path, characters) {
  const text = await readFile(path, 'utf8');
  return { ...parseBaseCatalog(text, characters), text, revision: revisionOf(text) };
}
export function prepareBaseSave({ records, drafts, selections, characters }) {
  if (!Array.isArray(selections) || !selections.length) throw new Error('Select at least one reviewed row');
  const next = new Map(records.map(record => [record.characterId, record]));
  const byId = new Map(drafts.map(row => [row.id, row]));
  const seen = new Set();
  const savedIds = [];
  const changes = [];
  for (const input of selections) {
    const draft = byId.get(input.draftId);
    if (!draft || draft.baseSaved) throw new Error('Unknown or already saved Base Stats draft');
    if (input.reviewed !== true || input.baseReviewed !== true) throw new Error('Confirm the screenshot AND the derived Base Stats / existing diff before saving');
    const corrected = applyCorrection(draft, input);
    const preview = previewBaseStats(corrected, records, characters);
    const issues = [...reviewIssues(corrected, characters), ...preview.issues];
    if (issues.length) throw new Error(issues.join(' '));
    if (seen.has(corrected.characterId)) throw new Error(`Duplicate character in Base Stats approval batch: ${corrected.characterId}`);
    seen.add(corrected.characterId);
    if (preview.conflict && input.allowBaseOverwrite !== true) throw new Error('Existing Base Stats differ. Review the diff and explicitly allow Base Stats overwrite.');
    const record = { characterId: corrected.characterId, ...Object.fromEntries(preview.diff.map(item => [item.field, item.next])) };
    next.set(record.characterId, record);
    changes.push({ characterId: record.characterId, previous: preview.existing, derived: preview.baseStats, next: record });
    savedIds.push(draft.id);
  }
  return { records: [...next.values()], savedIds, changes };
}
function renderBaseSource(snapshot, plan) {
  const edits = [];
  const additions = [];
  for (const change of plan.changes) {
    const nodes = snapshot.nodes.get(change.characterId);
    if (!nodes) { additions.push(change.next); continue; }
    for (const field of baseFields) if (change.previous[field] !== change.next[field]) {
      const node = nodes.get(field);
      edits.push({ start: node.getStart(snapshot.source), end: node.end, text: String(change.next[field]) });
    }
  }
  if (additions.length) {
    if (snapshot.array.elements.length && !snapshot.array.elements.hasTrailingComma) {
      const end = snapshot.array.elements.at(-1).end;
      edits.push({ start: end, end, text: ',' });
    }
    const position = snapshot.array.end - 1;
    const prefix = snapshot.text[position - 1] === '\n' ? '' : '\n';
    edits.push({ start: position, end: position, text: prefix + additions.map(record => `  { characterId: ${JSON.stringify(record.characterId)}, ${baseFields.map(field => `${field}: ${record[field]}`).join(', ')} },\n`).join('') });
  }
  let text = snapshot.text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
  return text;
}

/** One file per transaction: preserve surrounding TypeScript, lock, revision check, backup, atomic replacement. */
export async function saveBaseApproved({ path, expectedRevision, drafts, selections, characters }) {
  const lockPath = `${path}.lock`;
  const tempPath = `${path}.${process.pid}.tmp`;
  const lock = await open(lockPath, 'wx').catch(() => { throw new Error('Base Stats catalog is being saved by another process'); });
  try {
    const snapshot = await readBaseCatalog(path, characters);
    if (snapshot.revision !== expectedRevision) throw new Error('Base Stats catalog changed since preview. Reload and review the new diff.');
    const plan = prepareBaseSave({ ...snapshot, drafts, selections, characters });
    const text = renderBaseSource(snapshot, plan);
    parseBaseCatalog(text, characters);
    if (text !== snapshot.text) {
      const file = await open(tempPath, 'wx');
      try { await file.writeFile(text); await file.sync(); } finally { await file.close(); }
      const backupDir = join(dirname(path), '.character-stats-backups');
      await mkdir(backupDir, { recursive: true });
      const backup = await open(join(backupDir, `${snapshot.revision}.ts`), 'wx').catch(error => { if (error.code !== 'EEXIST') throw error; return null; });
      if (backup) { try { await backup.writeFile(snapshot.text); await backup.sync(); } finally { await backup.close(); } }
      if (revisionOf(await readFile(path, 'utf8')) !== expectedRevision) throw new Error('Base Stats catalog changed during save; nothing replaced');
      await rename(tempPath, path);
    }
    return { ...plan, revision: revisionOf(text) };
  } finally { await lock.close(); await rm(lockPath, { force: true }); await rm(tempPath, { force: true }); }
}
