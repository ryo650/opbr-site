# Character Guides: implementation and QA

Verified on October 2, 2026 after integrating main `a6d17f5092ba0c9b710c911dcf4892df6a9f0157` into `feat/character-guides`. The feature began at committed main `774021265d7f307abdcfd60b1c0c816441b216ee`; original checkout WIP was not imported. Main now includes the published Nusjuro guide, medal tag review/importer work, and Home news. The sole merge conflict was the HTTP route list: both `/updates` and `/character-guides` are retained. No changes to main's guide content, medal catalog/importer, or news components/data are introduced by this feature.

## Behavior and scope

`/character-guides` lists every registered guide regardless of New Characters release dates. Currently four entries: Jewelry Bonney, S-Snake, St. Marcus Mars (its existing **Guide in Progress** notice remains visible), and St. Ethanbaron V. Nusjuro. All four have catalog grade `ex`. Nusjuro appeared automatically after main integration; no duplicate registration or draft publication was needed.

Names, version IDs, portraits, elements, roles, and grades come from the character catalog; summaries come from the guide overview with a first-strength fallback. Only projected card fields reach the client. Full names and unique detail URLs distinguish versions. Adding a registered guide makes it appear after rebuilding, without a second manual list. Individual guide URLs and bodies remain unchanged.

Name search normalizes case, accents and punctuation, and matches all entered words. Element/role choices derive from listed entries. Rarity uses the same catalog categories and exact labels as Scout Simulator: EX, BF, SP, 4★, 3★, 2★, FREE, EXCH, COLA, ?. Missing/invalid grades normalize to unknown; **Unclassified (?)** is offered only when a listed guide needs it. Grades are never inferred from names. All four controls combine; clear/show-all resets all. Empty registry and zero matches have distinct states. Native labeled inputs/selects, live result announcements, keyboard focus, reserved portrait dimensions, decorative alt text, and lazy loading after the first three cards are included.

Home, shared Menu, and New Characters link to the directory. Metadata includes title/description/canonical/Open Graph/Twitter and a sitemap entry. Main's Home section order remains Essential tools → What's new → Guides; both Updates and Character Guides remain in the Menu.

## Supplied Home artwork

The supplied original is byte-identical at `public/home/character-guides.png`: PNG, 2048×1146, 1,268,161 bytes, SHA-256 `2d1f9ef88eb2774a463a9e31f79745125a5d5137560f091f5c0a7ed982af5526`. No generation, source crop, conversion, or repainting was performed. The authorized Library original was retained, with no Library writeback.

Replace that asset, or change its single `/home/character-guides.png` path in Home `src/app/(mainPages)/page.tsx`. Existing centered `fill`/`cover` behavior is reused: approximately 190×154px desktop and 116×132px mobile, with the central face/sword visible. Empty alt is decorative beside the named link. See `home-entry-{1440,390,320}.png`.

## Verification

- Lint and TypeScript: pass. Production Webpack build: pass, Next.js 16.3.4, 73 generated pages. See `lint.log`, `types.log`, `build.log`.
- Core: 17/17 pass (`tests.log`), including registry completeness, post-expiry availability, real projections, search/filter combinations, empty data, and alternate versions.
- HTTP: 7/7 pass (`http.log`): published pages/canonicals/headings, noindex/404 behavior, exact sitemap, all registry links, Home/New Characters entries, PNG status/MIME/bytes, and preserved Home news order.
- News: 7/7 pass (`site-updates.log`). Medal importer: 94/94 pass (`medals.log`), including reviewed tag arrays. Main's medal data/importer and news data/components also compare identically to the integrated main commit.
- Production Chromium at 1440/390/320px: all four guide links, search/element/role/rarity combinations, BF zero results, clear/show-all, Tab/Enter/focus, Menu/Home entries, two Home news articles, portrait/Home image loads/alt/dimensions, no horizontal overflow. Expired Mars remains in the directory independently of New Characters.
- Unpublished fixtures render the actual component/CSS with zero entries and 24 versions including a long unbroken name. Verified distinct links, lazy loading and no 320px overflow. All ten shared CharacterFrame labels and conditional Unclassified option checked. Fixture data is not registered or shipped.
- Live Simulator deterministic EX/BF/4★ single pulls retain badges, three pulls/fifteen diamonds, and Reset.
- No JS runtime or relevant asset errors. The existing Vercel Analytics local script returns 404 on the local production server (21 resource messages), recorded separately in `browser-results.txt`. Analytics source is unchanged.
- Visually inspected directory desktop/320/390, Home/full entry, zero-result, empty-registry, and long-name screenshots in this folder.

An initial direct HTTP invocation omitted the repository TypeScript loader and failed before running tests. The documented `npm run test:http` invocation above passed all seven. No final relevant checks remain blocked. Disk was checked before heavy work: about 11GiB free; existing dependencies were reused.

The unrelated UniqueTrait suite's previously reported two baseline failures and old draft-batch validation context were not changed or re-run for this feature. The 94 passing importer checks do not claim those unrelated suites pass.

## Preview and rerun

From this checkout, after building:

```sh
npm run start -- --hostname 127.0.0.1 --port 3203
```

Open `http://127.0.0.1:3203/` and `/character-guides`. Stop the server before rebuilding changed source. For development use `npm run dev -- --hostname 127.0.0.1 --port 3203`. This worktree reuses the original installed dependency directory via an ignored symlink; on another machine run `npm ci` after checking disk capacity.

```sh
npm run lint
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm test
node --require ./tests/register.cjs --test tests/site-updates.test.cjs
npm run medals:test
npm run build
TEST_BASE_URL=http://127.0.0.1:3203 npm run test:http
PLAYWRIGHT_MODULE=/path/to/installed/playwright TEST_BASE_URL=http://127.0.0.1:3203 node tests/character-guides-browser.cjs
```

The optional browser verifier needs an existing Playwright package and installed Chromium; it does not alter dependencies. `OPBR_QA_OUTPUT` overrides the default evidence folder. It derives card coverage dynamically; interaction examples use the current catalog (S-Snake, blue, expired Mars, and EX). Adapt those examples if catalog data changes.

## Changed files and preservation

Application changes: new directory page/client/CSS and `src/lib/character-guide-directory.ts`; Home and New Characters entry/link/CSS; shared Header; sitemap; shared `src/data/characters/grades.ts`; CharacterFrame imports its former exact label map; supplied Home PNG. Tests: core, HTTP, optional browser verifier. Evidence is in this folder.

The dedicated persistent worktree is `/Users/sasakiryou/Desktop/OPBR/opbr-character-guides`, branch `feat/character-guides`. Main integration preserved news/Nusjuro/medal work. The other unmerged tier-important-updates and create-tier-save-share branches remain excluded. Future integration should retain all existing Home/Menu entries and combined test coverage.

`pr-original-preservation.json` verifies original checkout branch/HEAD/status/index and five Nusjuro-related files match the start of this PR preparation. No original checkout switching, stash/reset/clean, staging, or overwrites were performed. Older `original-preservation.json` and `rarity-preservation.json` are historical implementation evidence; their dates/states precede main's publication of Nusjuro. Main merge and production deployment are outside this task; the PR is prepared as a draft for review.
