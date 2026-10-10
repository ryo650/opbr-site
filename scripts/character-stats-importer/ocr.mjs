import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { recognizeCrops } from './tesseract.mjs';
import { resolveTemplateCrops } from '../character-level-100-stats/screenshot-template.mjs';
const execute = promisify(execFile);
export const template = {
  id: 'stats-of-max-level-v01', referenceSize: { width: 2048, height: 946 },
  regions: Object.fromEntries(Object.entries({
    identityTitle: [205, 802, 575, 40], identityName: [205, 844, 510, 46], level: [1160, 163, 260, 40],
    hp: [1335, 250, 155, 40], atk: [1335, 290, 155, 40], def: [1335, 330, 155, 40],
    crit: [1330, 369, 160, 34], totalPower: [1680, 204, 160, 42],
    boost: [1665, 325, 140, 42], preview: [635, 702, 270, 32],
  }).map(([field, [x, y, width, height]]) => [field, { x: x / 2048, y: y / 946, width: width / 2048, height: height / 946 }])),
};
const helper = fileURLToPath(new URL('../medal-importer/ocr.swift', import.meta.url));
async function run(command, args) {
  const { stdout } = await execute(command, args, { maxBuffer: 16 * 1024 * 1024, timeout: 120000 });
  return stdout.trim();
}
export async function recognizeScreenshot(imagePath) {
  const magick = process.env.OPBR_MAGICK ?? '/opt/homebrew/bin/magick';
  const [width, height] = (await run(magick, ['identify', '-ping', '-format', '%w %h', imagePath])).split(/\s+/).map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1000 || width > 6000 || height < 400 || height > 3000 || Math.abs(width / height - 2048 / 946) > 0.025) throw new Error('Unsupported screenshot layout/size. Use the landscape Stats of max level screen.');
  const crops = resolveTemplateCrops(template, { width, height });
  const workDir = await mkdtemp(join(tmpdir(), 'opbr-stats-ocr-'));
  try {
    const paths = [];
    for (const [field, crop] of Object.entries(crops)) {
      const path = join(workDir, `${field}.png`);
      await run(magick, [imagePath, '-crop', `${crop.width}x${crop.height}+${crop.x}+${crop.y}`, '+repage', '-resize', '300%', '-unsharp', '0x1', ...(field.startsWith('identity') ? ['-colorspace', 'Gray', '-threshold', '90%', '-negate', '-type', 'TrueColor', '-depth', '8'] : []), path]);
      paths.push(path);
    }
    let results;
    let engine = process.env.OPBR_STATS_OCR ?? 'auto';
    if (!['auto', 'vision', 'tesseract'].includes(engine)) throw new Error('OPBR_STATS_OCR must be auto, vision, or tesseract');
    let visionError = null;
    if (engine !== 'tesseract') {
      try {
        results = JSON.parse(await run('/usr/bin/swift', ['-module-cache-path', join(workDir, 'module-cache'), helper, ...paths]));
        engine = 'vision';
      } catch (error) {
        if (engine === 'vision') throw error;
        visionError = error.stderr?.trim() ?? error.message;
      }
    }
    if (!results) { results = await recognizeCrops(paths); engine = 'tesseract'; }
    return {
      sourceImage: basename(imagePath), sourceSha256: createHash('sha256').update(await readFile(imagePath)).digest('hex'),
      templateId: template.id, engine, visionError, imageSize: { width, height }, crops,
      ocr: Object.fromEntries(results.map(result => [result.file.replace(/\.png$/, ''), result])),
    };
  } finally { await rm(workDir, { recursive: true, force: true }); }
}
