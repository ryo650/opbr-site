import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { characters as canonicalCharacters } from '../../src/data/characters/index.ts';
import { applyCorrection, buildDraft, reviewIssues } from './draft.mjs';
import { recognizeScreenshot } from './ocr.mjs';
import { readCatalog, saveApproved } from './store.mjs';
import { readBaseCatalog, saveBaseApproved } from './base-store.mjs';
import { previewBaseStats } from './base-conversion.mjs';

const defaultCatalog = fileURLToPath(new URL('../../src/data/characters/max-level-stats.json', import.meta.url));
const defaultBaseCatalog = fileURLToPath(new URL('../../src/data/characters/level-100-base-stats.ts', import.meta.url));
async function body(request) {
  if (request.headers['content-type'] !== 'application/json') throw new Error('JSON request required');
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 15 * 1024 * 1024) throw new Error('Image/request too large (10 MB image maximum)');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function startReviewServer({ catalogPath = defaultCatalog, baseCatalogPath = defaultBaseCatalog, imagePaths = [], port = 4319, characters = canonicalCharacters, recognize = recognizeScreenshot } = {}) {
  if (resolve(catalogPath) === resolve(baseCatalogPath)) throw new Error('Display and Base Stats catalogs must be separate files');
  const token = randomBytes(32).toString('hex');
  const workDir = await mkdtemp(join(tmpdir(), 'opbr-stats-review-'));
  const drafts = [];
  const imageById = new Map();
  let busy = false;
  async function addImage(path, name) {
    const draft = buildDraft(await recognize(path), characters);
    draft.sourceImage = name;
    drafts.push(draft);
    imageById.set(draft.id, path);
  }
  try {
    await readCatalog(catalogPath, characters);
    await readBaseCatalog(baseCatalogPath, characters);
    if (imagePaths.length > 20) throw new Error('Maximum 20 screenshots per initial batch');
    for (const path of imagePaths) {
      const source = resolve(path);
      // Keep the reviewed image immutable for this session, even if the input changes.
      const copy = join(workDir, `${randomUUID()}.png`);
      await writeFile(copy, await readFile(source));
      await addImage(copy, source.split(/[\\/]/).at(-1));
    }
  } catch (error) { await rm(workDir, { recursive: true, force: true }); throw error; }
  const server = createServer(async (request, response) => {
    const send = (code, data) => {
      response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(data));
    };
    let ownsBusy = false;
    try {
      const expectedHost = `127.0.0.1:${server.address().port}`;
      if (request.headers.host !== expectedHost) return send(403, { error: 'Local host required' });
      const path = new URL(request.url, `http://${expectedHost}`).pathname;
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' blob:; script-src 'self'; style-src 'self'; frame-ancestors 'none'");
      if (request.method === 'GET' && ['/', '/review.js', '/review.css'].includes(path)) {
        const file = path === '/' ? 'review.html' : path.slice(1);
        const text = (await readFile(new URL(`./${file}`, import.meta.url), 'utf8')).replace('__TOKEN__', token);
        response.writeHead(200, { 'Content-Type': path === '/' ? 'text/html; charset=utf-8' : path.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8' });
        return response.end(text);
      }
      if (request.method === 'GET' && path.startsWith('/image/')) {
        const file = imageById.get(path.slice('/image/'.length));
        if (!file) return send(404, { error: 'Image not found' });
        response.writeHead(200, { 'Content-Type': file.endsWith('.jpg') ? 'image/jpeg' : 'image/png' });
        return response.end(await readFile(file));
      }
      if (request.headers['x-review-token'] !== token) return send(403, { error: 'Review token required' });
      if (request.method === 'GET' && path === '/api/state') {
        const catalog = await readCatalog(catalogPath, characters);
        const base = await readBaseCatalog(baseCatalogPath, characters);
        return send(200, { ...catalog, baseCatalog: { records: base.records, revision: base.revision }, drafts: drafts.map(row => ({ ...row, issues: reviewIssues(row, characters) })), characters: Object.values(characters).map(({ id, name, role, element }) => ({ id, name, role, element })) });
      }
      if (request.method !== 'POST' || !['/api/upload', '/api/save', '/api/base-preview', '/api/base-save'].includes(path)) return send(404, { error: 'Not found' });
      if (request.headers.origin !== `http://${expectedHost}`) return send(403, { error: 'Same-origin review required' });
      if (path === '/api/base-preview') {
        const input = await body(request);
        const draft = drafts.find(row => row.id === input.selection?.draftId);
        if (!draft) throw new Error('Unknown draft');
        const base = await readBaseCatalog(baseCatalogPath, characters);
        if (base.revision !== input.expectedRevision) throw new Error('Base Stats catalog changed. Reload and review the new diff.');
        return send(200, previewBaseStats(applyCorrection(draft, input.selection), base.records, characters));
      }
      if (busy) return send(409, { error: 'A batch is being processed; wait and retry' });
      busy = true; ownsBusy = true;
      const input = await body(request);
      if (path === '/api/upload') {
        if (drafts.length >= 50) throw new Error('Maximum 50 rows per session; start another session');
        if (typeof input.name !== 'string' || !/\.(png|jpe?g)$/i.test(input.name) || typeof input.data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.data)) throw new Error('Upload PNG or JPEG screenshots');
        const bytes = Buffer.from(input.data, 'base64');
        if (bytes.length > 10 * 1024 * 1024 || bytes.length < 8) throw new Error('Image must be less than 10 MB');
        const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
        if (!png && !jpeg) throw new Error('Invalid PNG/JPEG signature');
        const file = join(workDir, `${randomUUID()}.${png ? 'png' : 'jpg'}`);
        await writeFile(file, bytes);
        try { await addImage(file, input.name.split(/[\\/]/).at(-1).slice(0, 200)); }
        catch (error) { await rm(file, { force: true }); throw error; }
        return send(200, { draftId: drafts.at(-1).id });
      }
      const baseSave = path === '/api/base-save';
      const result = await (baseSave ? saveBaseApproved : saveApproved)({ path: baseSave ? baseCatalogPath : catalogPath, expectedRevision: input.expectedRevision, drafts, selections: input.selections, characters });
      for (const id of result.savedIds) {
        const draft = drafts.find(row => row.id === id);
        const inputRow = input.selections.find(row => row.draftId === id);
        draft.lastCorrection = { characterId: inputRow.characterId, maxStats: inputRow.maxStats, conditions: inputRow.conditions };
        if (baseSave) draft.baseSaved = true;
        else draft.status = 'saved';
      }
      return send(200, { saved: result.savedIds.length, revision: result.revision });
    } catch (error) { send(400, { error: error.message }); }
    finally { if (ownsBusy) busy = false; }
  });
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', accept); }).catch(async error => { await rm(workDir, { recursive: true, force: true }); throw error; });
  const url = `http://127.0.0.1:${server.address().port}`;
  return { server, url, token, drafts, close: async () => {
    await new Promise((accept, reject) => server.close(error => error ? reject(error) : accept()));
    await rm(workDir, { recursive: true, force: true });
  } };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let port = 4319;
  let catalogPath = defaultCatalog;
  let baseCatalogPath = defaultBaseCatalog;
  const imagePaths = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') port = Number(args[++i]);
    else if (args[i] === '--catalog') catalogPath = resolve(args[++i]);
    else if (args[i] === '--base-catalog') baseCatalogPath = resolve(args[++i]);
    else if (args[i].startsWith('--')) throw new Error(`Unknown option: ${args[i]}`);
    else imagePaths.push(args[i]);
  }
  const app = await startReviewServer({ imagePaths, port, catalogPath, baseCatalogPath });
  console.log(`Character Stats Importer v0.1: ${app.url}\nPending rows: ${app.drafts.length}. Only individually reviewed rows can be saved.\nCatalog: ${catalogPath}\nCtrl+C stops the server and discards unsaved drafts.`);
  let stopping = false;
  const stop = async () => { if (stopping) return; stopping = true; await app.close(); process.exit(0); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
