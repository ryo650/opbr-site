const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { siteUpdates, siteUpdateCategoryLabels } = require('../src/data/site-updates');
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
