const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const assert = require('node:assert/strict');
// Lightweight final-source hook regression; no Next build or disk bundle output.
const runtime = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = require(runtime);
const { expect } = require(runtime + '/test');
const root = path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
require(root + '/tests/register.cjs');
const { createShareUrl, emptyDocument, STORAGE_KEY } = require(root + '/src/lib/tier-list-document.ts');
const ids = ['one', 'two'];
const modules = new Map();
function bundleFile(filename) {
  if (modules.has(filename)) return;
  modules.set(filename, '');
  let source = fs.readFileSync(filename, 'utf8');
  if (filename.endsWith('.ts')) source = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const resolve = Module.createRequire(filename);
  source = source.replace(/require\(["']([^"']+)["']\)/g, (_, name) => {
    const resolved = name.startsWith('@/') ? root + '/src/' + name.slice(2) + '.ts' : resolve.resolve(name);
    bundleFile(resolved);
    return `require(${JSON.stringify(resolved)})`;
  });
  modules.set(filename, source);
}
const hook = root + '/src/components/create-tier-list/useTierListPersistence.ts';
const react = require.resolve(root + '/node_modules/react');
const client = require.resolve(root + '/node_modules/react-dom/client');
[hook, react, client].forEach(bundleFile);
const factories = [...modules].map(([name, source]) => `${JSON.stringify(name)}:function(module,exports,require){${source}\n}`).join(',');
const bundle = `(function(){const process={env:{NODE_ENV:'production'}};const factories={${factories}};const cache={};function require(name){if(cache[name])return cache[name].exports;const module={exports:{}};cache[name]=module;factories[name](module,module.exports,require);return module.exports;}const React=require(${JSON.stringify(react)});const {createRoot}=require(${JSON.stringify(client)});const {useTierListPersistence}=require(${JSON.stringify(hook)});const ids=['one','two'];function Harness(){const p=useTierListPersistence(ids);return React.createElement('div',null,React.createElement('input',{ 'aria-label':'Title',value:p.session.document.title,readOnly:p.session.shared,onChange:e=>p.setTitle(e.target.value)}),React.createElement('div',{id:'ready'},String(p.session.ready)),React.createElement('div',{id:'pending'},String(Boolean(p.session.pending))),React.createElement('button',{onClick:p.loadPending},'Load'),React.createElement('button',{onClick:p.keepEditing},'Keep'));}createRoot(document.getElementById('root')).render(React.createElement(Harness));})();`;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('http://127.0.0.1:3202/hook-qa', route => route.fulfill({ contentType:'text/html', body:'<div id="root"></div>' }));
    await page.goto('http://127.0.0.1:3202/hook-qa');
    const own = emptyDocument(ids); own.title = 'Own saved';
    const shared = emptyDocument(ids); shared.title = 'Shared delayed';
    const link = await createShareUrl(shared, 'http://127.0.0.1:3202/create-tier-list');
    await page.evaluate(({key, own}) => {
      localStorage.setItem(key, JSON.stringify(own));
      const Original = DecompressionStream;
      window.DecompressionStream = class {
        constructor(format) {
          const native = new Original(format);
          this.writable = native.writable;
          this.readable = native.readable.pipeThrough(new TransformStream({async transform(value, controller) { await new Promise(resolve => setTimeout(resolve, 300)); controller.enqueue(value); }}));
        }
      };
    }, {key: STORAGE_KEY, own});
    await page.addScriptTag({ content: bundle });
    const input = page.getByRole('textbox', { name:'Title' });
    await expect(page.locator('#ready')).toHaveText('true');
    await expect(input).toHaveValue('Own saved');
    await page.evaluate(hash => { location.hash = hash; }, new URL(link).hash);
    await input.fill('Typed while decoding');
    await expect(page.locator('#pending')).toHaveText('true');
    assert.equal(new URL(page.url()).hash, new URL(link).hash);
    await expect(input).toHaveValue('Typed while decoding');
    await page.getByRole('button',{name:'Load',exact:true}).click();
    await expect(input).toHaveValue('Shared delayed');
    await expect(input).toHaveAttribute('readonly','');
    assert.equal(new URL(page.url()).hash, new URL(link).hash);
    assert.equal(JSON.parse(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).title, 'Own saved');
    assert.deepEqual(errors, []);
    console.log('PASS final-source hook: editing during delayed share decode preserves URL, prompts before replacing edits, loads read-only snapshot, leaves save intact');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
