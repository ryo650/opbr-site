const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { siteUpdates, siteUpdateCategoryLabels, getHomeSiteUpdates, getSortedSiteUpdates } = require('../src/data/site-updates');
const { scouts } = require('../src/data/scouts');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Render the server component without requiring a Next server or CSS loader.
require.extensions['.tsx'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
require.extensions['.css'] = module => { module.exports = {}; };
const UpdatesList = require('../src/app/(mainPages)/updates/UpdatesList.tsx').default;
const HomeUpdates = require('../src/components/site-updates/HomeUpdates.tsx').default;
const SiteUpdateCard = require('../src/components/site-updates/SiteUpdateCard.tsx').default;

test('site update data has valid dates, unique IDs, and existing local links', () => {
  const ids = new Set();
  for (const update of siteUpdates) {
    assert.match(update.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(update.id), `Duplicate update ID: ${update.id}`);
    ids.add(update.id);
    assert.match(update.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${update.date}T00:00:00Z`).toISOString().slice(0, 10), update.date);
    assert.ok(Object.hasOwn(siteUpdateCategoryLabels, update.category));
    assert.ok(update.title.trim() && update.description.trim());
    assert.ok(update.links.length > 0);
    if (update.featuredRank !== undefined) {
      assert.ok(Number.isInteger(update.featuredRank) && update.featuredRank > 0);
    }
    if (update.image) {
      assert.match(update.image.src, /^\/(?!\/)/);
      assert.ok(fs.existsSync(path.join(__dirname, '../public', update.image.src)));
      assert.ok(update.image.alt.trim());
      assert.ok(update.image.width > 0 && update.image.height > 0);
      assert.ok(['medal', 'banner'].includes(update.image.kind));
    }
    for (const link of update.links) {
      assert.ok(link.label.trim());
      assert.match(link.href, /^\/(?!\/)/);
      const scoutId = link.href.match(/^\/scout-simulator\/([^/]+)$/)?.[1];
      if (scoutId) {
        assert.ok(scouts.some(scout => scout.id === scoutId), link.href);
      } else {
        assert.ok(fs.existsSync(path.join(__dirname, '../src/app/(mainPages)', link.href, 'page.tsx')), link.href);
      }
    }
  }
});

test('Home prioritizes featured rank, fills with newest items, limits to three, and deduplicates', () => {
  const item = (id, date, featuredRank) => ({ ...siteUpdates[0], id, date, featuredRank });
  const updates = [
    item('old-featured', '2026-09-01', 2),
    item('recent', '2026-10-01'),
    item('first-featured', '2026-09-02', 1),
    item('other', '2026-09-30'),
    item('first-featured', '2026-09-02', 1),
  ];
  const before = updates.map(update => update.id);
  assert.deepEqual(getHomeSiteUpdates(updates).map(update => update.id), ['first-featured', 'old-featured', 'recent']);
  assert.deepEqual(getHomeSiteUpdates(updates.filter(update => update.featuredRank === undefined)).map(update => update.id), ['recent', 'other']);
  assert.equal(getSortedSiteUpdates(updates).length, 4);
  assert.deepEqual(getHomeSiteUpdates([]), []);
  assert.deepEqual(getHomeSiteUpdates(updates, 0), []);
  assert.deepEqual(updates.map(update => update.id), before);
});

test('equal featured ranks use newest dates and source order for date ties', () => {
  const updates = [
    { ...siteUpdates[0], id: 'older', date: '2026-09-01', featuredRank: 1 },
    { ...siteUpdates[0], id: 'newer-a', date: '2026-10-01', featuredRank: 1 },
    { ...siteUpdates[0], id: 'newer-b', date: '2026-10-01', featuredRank: 1 },
  ];
  assert.deepEqual(getHomeSiteUpdates(updates).map(update => update.id), ['newer-a', 'newer-b', 'older']);
});

test('Home uses h2/h3 hierarchy, always links to all updates, and handles empty data', () => {
  const html = renderToStaticMarkup(React.createElement(HomeUpdates, { updates: siteUpdates }));
  assert.match(html, /<h2 id="home-updates-heading">/);
  assert.equal((html.match(/<h3\b/g) || []).length, Math.min(3, siteUpdates.length));
  assert.doesNotMatch(html, /<h1\b/);
  assert.match(html, /href="\/updates"/);
  const empty = renderToStaticMarkup(React.createElement(HomeUpdates, { updates: [] }));
  assert.match(empty, /New additions to OPBR Guide will appear here/);
  assert.match(empty, /href="\/updates"/);
  assert.doesNotMatch(empty, /<article\b/);
});

test('cards reserve image dimensions, supply alt text, and render without optional images', () => {
  const medalUpdate = siteUpdates.find(update => update.id === 'halloween-perona-and-uta-medals');
  const html = renderToStaticMarkup(React.createElement(SiteUpdateCard, { update: medalUpdate }));
  assert.match(html, /width="200"/);
  assert.match(html, /height="200"/);
  assert.match(html, /alt="Pink Halloween Perona medal artwork"/);
  assert.match(html, /aspect-ratio:200 \/ 200/);
  const withoutImage = { ...medalUpdate, image: undefined };
  const fallback = renderToStaticMarkup(React.createElement(SiteUpdateCard, { update: withoutImage }));
  assert.doesNotMatch(fallback, /<img\b/);
  assert.match(fallback, /Halloween Perona and Uta medals added/);
  assert.match(fallback, /href="\/medal-builder"/);
});

test('empty updates render an explanation and a working home link', () => {
  const html = renderToStaticMarkup(React.createElement(UpdatesList, { updates: [] }));
  assert.match(html, /No updates yet/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /<article/);
});

test('long titles render safely, dates sort newest first, and input order is preserved', () => {
  const longTitle = `${'A long title for newly added guide content '.repeat(8)}<script>alert(1)</script>`;
  const updates = [
    { ...siteUpdates[0], id: 'older', date: '2026-09-01', title: longTitle },
    { ...siteUpdates[1], id: 'newer', date: '2026-10-01' },
  ];
  const html = renderToStaticMarkup(React.createElement(UpdatesList, { updates }));
  assert.ok(html.indexOf('id="update-newer"') < html.indexOf('id="update-older"'));
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /<time dateTime="2026-10-01">Oct 1, 2026<\/time>/);
  assert.deepEqual(updates.map(update => update.id), ['older', 'newer']);
});
