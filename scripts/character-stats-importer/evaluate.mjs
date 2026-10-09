import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { characters } from '../../src/data/characters/index.ts';
import { recognizeScreenshot } from './ocr.mjs';
import { buildDraft, statFields } from './draft.mjs';
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--input-dir')) throw new Error('Usage: characters:stats-evaluate [--input-dir /path/to/local/screenshots]');
const inputDir = args.length ? resolve(args[1]) : null;
const fixtures = JSON.parse(await readFile(new URL('./fixtures/expected.json', import.meta.url), 'utf8'));
const captured = inputDir ? null : JSON.parse(await readFile(new URL('./fixtures/ocr-results.json', import.meta.url), 'utf8'));
if (inputDir) {
  for (const fixture of fixtures) await access(join(inputDir, fixture.file)).catch(() => { throw new Error(`Missing local screenshot: ${fixture.file}. Originals are deliberately not in Git; provide them via --input-dir.`); });
}
const rows = [];
for (const fixture of fixtures) {
  const evidence = inputDir
    ? await recognizeScreenshot(join(inputDir, fixture.file))
    : captured.rows.find(row => row.file === fixture.file)?.draft;
  if (!evidence) throw new Error(`Missing structured OCR evidence: ${fixture.file}`);
  const draft = buildDraft(evidence, characters);
  const comparisons = Object.fromEntries(['characterId', ...statFields].map(field => {
    const expected = field === 'characterId' ? fixture.characterId : fixture.maxStats[field];
    const actual = field === 'characterId' ? draft.characterId : draft.maxStats[field];
    return [field, { expected, actual, pass: expected === actual }];
  }));
  for (const field of ['screen', 'level', 'levelMaximum', 'characterBoost', 'characterBoostMaximum']) {
    comparisons[field] = { expected: fixture.conditions[field], actual: draft.conditions[field], pass: draft.conditions[field] === fixture.conditions[field] };
  }
  rows.push({ file: fixture.file, comparisons, draft });
  console.log(`${fixture.file}: ${Object.values(comparisons).filter(item => item.pass).length}/${Object.keys(comparisons).length} matched`);
}
const pass = rows.every(row => Object.values(row.comparisons).every(item => item.pass));
if (inputDir) await writeFile(new URL('./fixtures/ocr-results.json', import.meta.url), JSON.stringify({ templateId: rows[0].draft.templateId, pass, rows }, null, 2) + '\n');
console.log(inputDir ? 'Measured local images; saved structured OCR only.' : 'Replayed stored OCR evidence; no source images read.');
if (!pass) process.exitCode = 1;
