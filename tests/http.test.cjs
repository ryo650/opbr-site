const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scouts } = require('../src/data/scouts');
const { characterGuides } = require('../src/data/character-guides');
const { recommendedMedalSets } = require('../src/data/medal-sets');
const { SITE_URL } = require('../src/lib/site');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100';
const pages = ['/', '/tier-list', '/character-usage', '/new-characters', '/character-guides', '/create-tier-list', '/medal-builder', '/medal-sets', '/scout-simulator', '/about', '/contact', '/privacy-policy', ...scouts.map(s => `/scout-simulator/${s.id}`), ...Object.keys(characterGuides).map(id => `/characters/${id}`), ...recommendedMedalSets.map(set => `/medal-sets/${set.id}`)];

test('all published pages return 200, one main and h1, and their own canonical', async () => {
  const titles = new Set();
  for (const route of pages) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.equal((html.match(/<main\b/g) || []).length, 1, route);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    assert.doesNotMatch(html, /name="robots" content="noindex/);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical && new URL(canonical).href, new URL(route, SITE_URL).href, `canonical: ${route}`);
    assert.ok(!html.includes('content="http://localhost'), `OG URL: ${route}`);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert.ok(title && !titles.has(title), `unique title: ${route}`);
    titles.add(title);
  }
});

test('unfinished pages are explicitly noindex and have a main heading', async () => {
  for (const route of ['/beginner-guide', '/new-scout']) {
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

test('permanent directory renders every published guide and its real summary', async () => {
  const response = await fetch(base + '/character-guides');
  assert.equal(response.status, 200);
  const html = await response.text();
  const links = [...html.matchAll(/<a[^>]*href="(\/characters\/[^"?#]+)"/g)].map(match => match[1]);
  assert.deepEqual(links.sort(), Object.keys(characterGuides).map(id => `/characters/${id}`).sort());
  const { characters } = require('../src/data/characters');
  for (const [id, guide] of Object.entries(characterGuides)) {
    assert.ok(html.includes(characters[id].image.replace(/'/g, '&#x27;')) || html.includes(encodeURIComponent(characters[id].image)));
    const escapeHtml = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#x27;'}[char]));
    assert.ok(html.includes(escapeHtml(characters[id].name)), `full version name: ${id}`);
    const summary = guide.guideOverview?.description?.trim() || guide.quickStrengths[0] || '';
    if (summary) assert.ok(html.includes(escapeHtml(summary)), `real summary: ${id}`);
    if (guide.notice) assert.ok(html.includes(guide.notice.title));
  }
  assert.match(html, /Search characters/);
  assert.match(html, /All elements/);
  assert.match(html, /All roles/);
  assert.match(html, /All rarities/);
  const { characterGradeLabels } = require('../src/data/characters/grades');
  for (const [grade, label] of Object.entries(characterGradeLabels)) {
    if (grade !== 'unknown') assert.ok(html.includes(`<option value="${grade}">${label}</option>`));
  }
  assert.doesNotMatch(html, /<option value="unknown">/, 'no fake unclassified entries in published data');
});

test('Home and New Characters both link to the permanent directory; Home uses the supplied Character Guides artwork', async () => {
  const home = await (await fetch(base + '/')).text();
  const card = home.match(/<a[^>]*href="\/character-guides"[^>]*>(.*?)<\/a>/s)?.[1];
  assert.ok(card, 'Home entry');
  assert.match(card, /Character Guides/);
  assert.match(card, /<img/);
  assert.ok(card.includes(encodeURIComponent("/home/character-guides.png")));
  const image = await fetch(base + "/home/character-guides.png");
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type"), /image\/png/);
  assert.equal((await image.arrayBuffer()).byteLength, 1268161);
  const recent = await (await fetch(base + '/new-characters')).text();
  assert.match(recent, /href="\/character-guides"/);
});
