const { test } = require('node:test');
const assert = require('node:assert/strict');
const { characters } = require('../src/data/characters');
const {
  emptyDocument, validateDocument, parseDocument, createShareUrl, readShareHash,
  MAX_SHARE_URL_LENGTH, MAX_DOCUMENT_BYTES, SHARE_PREFIX, snapshotDocument,
} = require('../src/lib/tier-list-document');
const ids = Object.keys(characters);

function rankedDocument() {
  const document = emptyDocument(ids);
  document.title = '私のランキング 🏴‍☠️';
  document.tiers.god = [ids[1], ids[0]];
  document.tiers.d = [ids[2]];
  document.pool = ids.slice(3).reverse();
  return document;
}

test('share round trip preserves Unicode titles and every tier/pool order', async () => {
  const document = rankedDocument();
  const url = await createShareUrl(document, 'https://example.com/create-tier-list#old');
  assert.ok(url.length <= MAX_SHARE_URL_LENGTH);
  assert.deepEqual(await readShareHash(new URL(url).hash, ids), document);
  assert.equal(new URL(url).pathname, '/create-tier-list');
});

test('full 360-character ranked layout fits the conservative URL limit', async () => {
  const document = emptyDocument(ids);
  document.title = 'あ'.repeat(120);
  document.tiers.god = ids.slice().reverse();
  document.pool = [];
  const url = await createShareUrl(document, 'https://example.com/create-tier-list');
  assert.ok(url.length <= MAX_SHARE_URL_LENGTH, `length: ${url.length}`);
  assert.deepEqual(await readShareHash(new URL(url).hash, ids), document);
});

test('catalog additions append to unranked without changing existing placements', () => {
  const document = rankedDocument();
  const result = validateDocument(document, [...ids, 'new-character']);
  assert.deepEqual(result.tiers, document.tiers);
  assert.deepEqual(result.pool, [...document.pool, 'new-character']);
});

test('rejects unknown/prototype IDs, duplicates, versions, missing or extra tiers, and invalid names', () => {
  const variants = [
    (d) => { d.v = 2; },
    (d) => { d.tiers.god = ['__proto__']; },
    (d) => { d.tiers.god = ['constructor']; },
    (d) => { d.tiers.god = ['unknown']; },
    (d) => { d.tiers.god = [ids[0]]; }, // also in pool
    (d) => { d.pool = [ids[0], ids[0]]; },
    (d) => { d.tiers = []; },
    (d) => { delete d.tiers.d; },
    (d) => { d.tiers.extra = []; },
    (d) => { d.tiers.s = null; },
    (d) => { d.title = 'x'.repeat(121); },
    (d) => { d.title = {}; },
    (d) => { d.pool = Array(ids.length + 1).fill(ids[0]); },
  ];
  for (const mutate of variants) {
    const document = emptyDocument(ids);
    mutate(document);
    assert.throws(() => validateDocument(document, ids));
  }
  for (const value of [null, [], {}, 1, 'hello']) assert.throws(() => validateDocument(value, ids));
});

test('invalid JSON, oversized files and malformed/oversized links reject safely', async () => {
  assert.throws(() => parseDocument('{', ids));
  assert.throws(() => parseDocument(' '.repeat(MAX_DOCUMENT_BYTES + 1), ids));
  assert.equal(await readShareHash('#ordinary-anchor', ids), null);
  for (const hash of ['#tier=v2.test', SHARE_PREFIX, `${SHARE_PREFIX}%%%`, `${SHARE_PREFIX}a`, `${SHARE_PREFIX}${'a'.repeat(MAX_SHARE_URL_LENGTH)}`]) {
    await assert.rejects(readShareHash(hash, ids));
  }
});

test('decompression bombs are limited before parsing', async () => {
  const bytes = new TextEncoder().encode('x'.repeat(MAX_DOCUMENT_BYTES + 1));
  const compressed = Buffer.from(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
  await assert.rejects(readShareHash(SHARE_PREFIX + compressed.toString('base64url'), ids), /too large/);
});

test('oversized URL and older browser compression failures explain the file fallback', async () => {
  await assert.rejects(createShareUrl(emptyDocument(ids), `https://example.com/${'a'.repeat(MAX_SHARE_URL_LENGTH)}`), /Download/);
  const original = globalThis.CompressionStream;
  try {
    globalThis.CompressionStream = undefined;
    await assert.rejects(createShareUrl(emptyDocument(ids), 'https://example.com'), /Download/);
  } finally { globalThis.CompressionStream = original; }
});

test('snapshot excludes ranked characters from pool without mutating input', () => {
  const document = emptyDocument(ids);
  document.tiers.god = [ids[0]];
  const snapshot = snapshotDocument(document.title, document.tiers, document.pool);
  assert.equal(document.pool.length, ids.length);
  assert.deepEqual(snapshot.pool, ids.slice(1));
  assert.doesNotThrow(() => validateDocument(snapshot, ids));
});
