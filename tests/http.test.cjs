const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scouts } = require('../src/data/scouts');
const { characterGuides } = require('../src/data/character-guides');
const { SITE_URL } = require('../src/lib/site');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const pages = ['/', '/tier-list', '/character-usage', '/create-tier-list', '/scout-simulator', '/about', '/contact', '/privacy-policy', ...scouts.map(s => `/scout-simulator/${s.id}`), ...Object.keys(characterGuides).map(id => `/characters/${id}`)];

test('all 22 published pages return 200, one main and h1, and their own canonical', async () => {
  const titles = new Set();
  for (const route of pages) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.equal((html.match(/<main\b/g) || []).length, 1, route);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical && new URL(canonical).href, new URL(route, SITE_URL).href, `canonical: ${route}`);
    assert.ok(!html.includes('content="http://localhost'), `OG URL: ${route}`);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert.ok(title && !titles.has(title), `unique title: ${route}`);
    titles.add(title);
  }
});

test('unfinished pages are explicitly noindex and have a main heading', async () => {
  for (const route of ['/beginner-guide', '/new-characters', '/new-scout', '/medal-sets']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.match(html, /<main\b/);
    assert.match(html, /<h1\b/);
  }
});

test('unknown pages and inherited object keys return a recoverable 404', async () => {
  for (const route of ['/does-not-exist', '/characters/does-not-exist', '/characters/__proto__', '/characters/constructor', '/scout-simulator/does-not-exist']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 404, route);
    assert.match(await response.text(), /Return home/);
  }
});

test('sitemap includes exactly the published pages and robots points to it', async () => {
  const response = await fetch(base + '/sitemap.xml');
  assert.equal(response.status, 200);
  const sitemap = await response.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(urls.sort(), pages.map(p => SITE_URL + p).sort());
  const robots = await fetch(base + '/robots.txt');
  assert.equal(robots.status, 200);
  assert.ok((await robots.text()).includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
});
