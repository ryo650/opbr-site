const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = process.env.OPBR_QA_ROOT || path.resolve(__dirname, '..');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3203';
const output = process.env.OPBR_QA_OUTPUT || path.join(root, 'docs/character-guides-qa');
const playwrightPath = process.env.PLAYWRIGHT_MODULE || path.dirname(require.resolve('playwright'));
const { chromium } = require(playwrightPath);
const { expect } = require(path.join(playwrightPath, 'test'));
require(path.join(root, 'tests/register.cjs'));
const ts = require(path.join(root, 'node_modules/typescript'));
const React = require(path.join(root, 'node_modules/react'));
const { renderToStaticMarkup } = require(path.join(root, 'node_modules/react-dom/server'));
require.extensions['.tsx'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
  });
  module._compile(outputText, filename);
};
require.extensions['.css'] = module => { module.exports = { __esModule: true, default: new Proxy({}, { get: (...args) => String(args[1]) }) }; };
const CharacterFrame = require(path.join(root, "src/components/character-frame/CharacterFrame.tsx")).default;
const Directory = require(path.join(root, 'src/app/(mainPages)/character-guides/CharacterGuideDirectory.tsx')).default;
const { createCharacterGuideEntries } = require(path.join(root, 'src/lib/character-guide-directory'));
const { characterGuides } = require(path.join(root, 'src/data/character-guides'));
const { characterGradeLabels } = require(path.join(root, "src/data/characters/grades"));
const { characters } = require(path.join(root, 'src/data/characters'));
const entries = createCharacterGuideEntries(characterGuides, characters);
const report = [];

async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${page.viewportSize().width}`);
}
async function loadedImages(page, selector = 'main img') {
  const images = page.locator(selector);
  for (let i = 0; i < await images.count(); i++) {
    await images.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => images.nth(i).evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    assert.ok(await images.nth(i).getAttribute('alt') !== null);
    const isFill = await images.nth(i).getAttribute('data-nimg') === 'fill';
    assert.ok(isFill || await images.nth(i).getAttribute('width'));
    assert.ok(isFill || await images.nth(i).getAttribute('height'));
    assert.ok(await images.nth(i).evaluate(img => img.clientWidth > 0 && img.clientHeight > 0));
  }
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch();
  let fixtureServer;
  try {
    const errors = [];
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 1080 : 844 } });
      page.on('pageerror', error => errors.push({text: String(error), url: 'runtime'}));
      page.on('console', msg => { if (msg.type() === 'error') errors.push({text: msg.text(), url: msg.location().url}); });
      await page.goto(base + '/character-guides');
      await expect(page.getByRole('heading', { name: 'Character Guides', exact: true, level: 1 })).toBeVisible();
      await expect(page.locator('main li')).toHaveCount(entries.length);
      await expect(page.getByRole('status')).toHaveText(`${entries.length} character guides`);
      const displayedLinks = await page.locator('main li a').evaluateAll(links => links.map(link => link.getAttribute('href')));
      assert.deepEqual(displayedLinks.sort(), entries.map(entry => '/characters/' + entry.id).sort());
      assert.deepEqual(await page.getByLabel('Element', {exact: true}).locator('option').evaluateAll(items => items.map(item => item.value)), ['', ...new Set(entries.map(entry => entry.element))].sort());
      assert.deepEqual(await page.getByLabel('Role', {exact: true}).locator('option').evaluateAll(items => items.map(item => item.value)), ['', ...new Set(entries.map(entry => entry.role))].sort());
      const rarity = page.getByLabel('Rarity', {exact:true});
      const expectedGrades = Object.keys(characterGradeLabels).filter(grade => grade !== 'unknown' || entries.some(entry => entry.grade === 'unknown'));
      assert.deepEqual(await rarity.locator('option').evaluateAll(items => items.map(item => item.value)), ['', ...expectedGrades]);
      for (const grade of expectedGrades) {
        await expect(rarity.locator(`option[value="${grade}"]`)).toHaveText(characterGradeLabels[grade]);
      }
      await rarity.selectOption('ex');
      await expect(page.locator('main li')).toHaveCount(entries.length);
      await rarity.selectOption('bf');
      await expect(page.getByRole('heading', {name:'No matching guides'})).toBeVisible();
      await page.getByRole('button', {name:'Show all guides', exact:true}).click();
      await expect(rarity).toHaveValue('');
      await loadedImages(page);
      await noOverflow(page);
      await page.evaluate(() => scrollTo(0, 0));
      await expect.poll(() => page.locator('header').first().evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
      await page.screenshot({ path: path.join(output, `directory-${width}.png`), fullPage: true });

      const search = page.getByRole('searchbox', { name: 'Search characters' });
      await rarity.selectOption('ex');
      await page.getByLabel('Element', {exact:true}).selectOption('blue');
      await search.fill('S Snake');
      await expect(page.locator('main li')).toHaveCount(1);
      await expect(page.locator('main li h2')).toHaveText('Seraphim-S-Snake');
      await page.getByLabel('Role', {exact: true}).selectOption('defender');
      await expect(page.locator('main li')).toHaveCount(1);
      await rarity.selectOption('bf');
      await expect(page.getByRole('heading', { name: 'No matching guides' })).toBeVisible();
      await expect(page.getByRole('status')).toHaveText(`0 of ${entries.length} guides`);
      await noOverflow(page);
      if (width === 320) await page.screenshot({ path: path.join(output, 'no-results-320.png'), fullPage: true });
      await page.getByRole('button', { name: 'Show all guides', exact: true }).click();
      await expect(search).toHaveValue('');
      await expect(page.getByLabel('Role', {exact: true})).toHaveValue('');
      await expect(page.getByLabel('Element', {exact: true})).toHaveValue('');
      await expect(rarity).toHaveValue('');
      await expect(page.locator('main li')).toHaveCount(entries.length);
      await page.getByLabel('Element', {exact: true}).selectOption('blue');
      await expect(page.locator('main li')).toHaveCount(2);
      await rarity.selectOption('ex');
      await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
      await expect(rarity).toHaveValue('');
      await search.fill('bonney');
      await search.focus();
      await page.keyboard.press('ArrowLeft');
      assert.equal(await search.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Element', {exact: true})).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Role', {exact: true})).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(rarity).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Clear filters' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.locator('main li a')).toBeFocused();
      assert.equal(await page.locator('main li a').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(base + '/characters/future-where-i-m-the-most-free-jewelry-bonney');
      await expect(page.getByRole('heading', {level: 1})).toContainText('Jewelry Bonney');
      await page.goBack();
      await expect(page.getByRole('heading', {level: 1})).toHaveText('Character Guides');

      await page.goto(base + '/new-characters');
      await expect(page.locator('main a[href="/characters/the-five-elders-st-marcus-mars"]')).toHaveCount(0);
      await page.getByRole('link', { name: 'Browse all Character Guides' }).click();
      await expect(page.locator('main a[href="/characters/the-five-elders-st-marcus-mars"]')).toBeVisible();
      await page.goto(base + '/');
      const homeCard = page.locator('main a[href="/character-guides"]');
      await expect(homeCard).toBeVisible();
      await expect(homeCard.locator('img')).toHaveCount(0);
      for (const href of ['/new-characters','/medal-sets','/beginner-guide','/create-tier-list','/medal-builder','/character-usage','/tier-list','/scout-simulator']) {
        await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
      }
      await noOverflow(page);
      await loadedImages(page);
      await homeCard.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo(0, 0));
      await expect.poll(() => page.locator('header').first().evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
      if (width !== 390) await page.screenshot({path: path.join(output, `home-${width}.png`), fullPage: true});
      await homeCard.click();
      await expect(page).toHaveURL(base + '/character-guides');
      await page.getByRole('button', {name: 'Open navigation menu'}).click();
      await expect(page.getByRole('menuitem', {name:'Character Guides', exact:true})).toBeVisible();
      await page.keyboard.press('Escape');
      for (const entry of entries) {
        await page.goto(base + '/character-guides');
        await page.locator(`main a[href="/characters/${entry.id}"]`).click();
        await expect(page).toHaveURL(base + '/characters/' + entry.id);
        await expect(page.getByRole('heading', {level:1})).toHaveText(entry.name);
      }
      report.push(`PASS ${width}px: registry coverage, real rarity options and labels, combined name/element/role/rarity filters, zero results/reset, image loads/dimensions/alt, keyboard/focus, every guide navigation, expired Mars, Home links, Menu, no overflow`);
      await page.close();
    }

    // Render the actual component/CSS against fixtures without altering the registry.
    const css = fs.readFileSync(path.join(root, 'src/app/(mainPages)/character-guides/page.module.css'), 'utf8');
    const fixtureEntries = Array.from({length:24}, (_, index) => ({...entries[index % entries.length], id:`fixture-${index}`, name:index === 0 ? 'LongCharacterVersionNameWithoutSpaces'.repeat(6) : `Version ${index + 1} ${entries[index % entries.length].name}`}));
    fixtureServer = http.createServer((req,res) => {
      const items = req.url === '/empty' ? [] : fixtureEntries;
      let markup = renderToStaticMarkup(React.createElement(Directory, {entries:items}));
      if (req.url === '/rarities') {
        const rarityEntries = Object.keys(characterGradeLabels).map((grade, index) => ({...entries[0], id:`grade-fixture-${index}`, grade}));
        markup = renderToStaticMarkup(React.createElement(Directory, {entries:rarityEntries}));
        markup += rarityEntries.map(entry => renderToStaticMarkup(React.createElement(CharacterFrame, {character:entry}))).join('');
      }
      markup = markup.replaceAll('/_next/image?', base + '/_next/image?');
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
      res.end(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unpublished directory QA fixture</title><style>*{box-sizing:border-box}body{margin:0;background:#202020;color:#f8fafc;font-family:Arial,sans-serif}a{text-decoration:none;color:inherit}${css}</style></head><body><main class="content"><h1>Unpublished QA fixture</h1>${markup}</main></body></html>`);
    });
    await new Promise(resolve => fixtureServer.listen(0, '127.0.0.1', resolve));
    const fixtureBase = 'http://127.0.0.1:' + fixtureServer.address().port;
    const fixturePage = await browser.newPage({viewport:{width:320,height:844}});
    await fixturePage.goto(fixtureBase + '/empty');
    await expect(fixturePage.getByRole('heading',{name:'No character guides yet'})).toBeVisible();
    await expect(fixturePage.getByRole('searchbox')).toHaveCount(0);
    await noOverflow(fixturePage);
    await fixturePage.screenshot({path:path.join(output,'fixture-empty-320.png'),fullPage:true});
    await fixturePage.goto(fixtureBase + '/long');
    await expect(fixturePage.locator('main li')).toHaveCount(24);
    assert.equal(await fixturePage.locator('main li img[loading="lazy"]').count(),21);
    await loadedImages(fixturePage, 'main li:nth-child(-n+3) img');
    await noOverflow(fixturePage);
    await fixturePage.evaluate(()=>scrollTo(0,0));
    await fixturePage.screenshot({path:path.join(output,'fixture-long-many-320.png'),fullPage:false});
    await fixturePage.goto(fixtureBase + '/rarities');
    await expect(fixturePage.getByLabel('Rarity', {exact:true}).locator('option[value=unknown]')).toHaveText('Unclassified (?)');
    await expect(fixturePage.locator('main li')).toHaveCount(10);
    for (const [index, label] of Object.values(characterGradeLabels).entries()) {
      await expect(fixturePage.locator('main > .frame .badge').nth(index)).toHaveText(label);
    }
    await noOverflow(fixturePage);
    report.push('PASS shared CharacterFrame labels for all 10 grades and unclassified directory option in unpublished fixtures');
    report.push('PASS unpublished actual-component fixtures: empty registry, long unbroken version name, 24 distinct cards, lazy loading after first 3, no overflow at 320px');
    await fixturePage.close();
    const simulatorPage = await browser.newPage({viewport:{width:390,height:844}});
    simulatorPage.on('pageerror', error => errors.push({text:String(error),url:'runtime'}));
    await simulatorPage.goto(base + '/scout-simulator/future-where-i-m-the-most-free-jewelry-bonney');
    const randomCategories = [0, 1 / 99.6, 4 / 99.6];
    for (const [index, randomCategory] of randomCategories.entries()) {
      await simulatorPage.evaluate(value => { let calls=0; Math.random=()=>calls++ === 0 ? value : 0; }, randomCategory);
      await simulatorPage.getByRole('button', {name:/^1 Pull\b/}).click();
      await expect(simulatorPage.getByRole('status')).toContainText(`${index+1} total pulls`);
      const expected = ['EX','BF','4★'][index];
      await expect(simulatorPage.locator('main [class*=resultsGrid] [class*=badge]').last()).toHaveText(expected);
    }
    await expect(simulatorPage.getByRole('status')).toContainText('15 diamonds spent');
    await simulatorPage.getByRole('button', {name:'Reset',exact:true}).click();
    await expect(simulatorPage.getByRole('status')).toContainText('0 total pulls');
    await expect(simulatorPage.getByRole('status')).toContainText('0 diamonds spent');
    await simulatorPage.close();
    report.push('PASS live Scout Simulator: deterministic EX/BF/4★ single pulls, shared result badges, unchanged total/diamond stats, Reset');
    const existingAnalyticsErrors = errors.filter(error => error.url === base + '/_vercel/insights/script.js' && error.text.includes('404'));
    assert.deepEqual(errors.filter(error => !existingAnalyticsErrors.includes(error)), [], 'unexpected browser console/runtime errors');
    report.push(`PASS no JS runtime or relevant asset errors; existing Vercel Analytics local script 404 (${existingAnalyticsErrors.length}) recorded separately`);
    fs.writeFileSync(path.join(output,'browser-results.txt'),report.join('\n')+'\n');
    console.log(report.join('\n'));
  } finally {
    await browser.close();
    if (fixtureServer) await new Promise(resolve=>fixtureServer.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
