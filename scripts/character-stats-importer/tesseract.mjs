import { createWorker, PSM } from 'tesseract.js';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';

/** Local fallback; only the English model is downloaded, never screenshots. */
export async function recognizeCrops(paths) {
  const cachePath = fileURLToPath(new URL('./.cache/', import.meta.url));
  await mkdir(cachePath, { recursive: true });
  const worker = await createWorker('eng', 1, { cachePath });
  try {
    const results = [];
    for (const path of paths) {
      const field = basename(path).replace(/\.png$/, '');
      await worker.setParameters({ tessedit_pageseg_mode: field === 'identity' ? PSM.SINGLE_BLOCK : PSM.SINGLE_LINE });
      const { data } = await worker.recognize(path);
      results.push({ file: basename(path), lines: data.text.trim().split(/\n/).map(line => line.trim()).filter(Boolean), observations: [], confidence: data.confidence });
    }
    return results;
  } finally { await worker.terminate(); }
}
