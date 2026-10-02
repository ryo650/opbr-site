# Character Guides — implementation and verification

Implemented on `feat/character-guides` in `/Users/sasakiryou/Desktop/OPBR/opbr-character-guides`, based on committed `774021265d7f307abdcfd60b1c0c816441b216ee` (main). The original checkout/index and Nusjuro WIP were not used as the implementation base. No other feature branch was merged or cherry-picked. No push, PR, merge, or deploy was performed.

## Behavior and published scope

`/character-guides` permanently lists all entries from `src/data/character-guides/index.ts`, independently of New Characters release dates. It renders three existing published guides at this base:

- Future Where I'm the Most Free Jewelry Bonney — green / attacker.
- Seraphim-S-Snake — blue / defender.
- The Five Elders St.Marcus Mars — blue / runner, with its existing **Guide in Progress** notice.

Names, portraits, element, role, and rarity grade come from the character catalog. Summaries come from the guide overview, falling back to its first quick strength. No guide text or character metadata is maintained twice. An unregistered character or draft is not listed. Nusjuro is absent at this committed base; registering its guide later makes it appear automatically after rebuilding.

The list sorts by full version name; cards retain the full name and unique character ID/URL. Name search tolerates case, punctuation, and word order. Element and role options are derived only from listed entries. Rarity options use the shared Scout Simulator grade labels; unknown is offered only if a listed entry needs it. Name search and all three filters combine; result counts are announced with a polite live region. Clear filters and Show all guides reset all four controls. Empty registry and empty results have distinct states. Card portraits have explicit dimensions and decorative empty alt text because the full character name already labels each link. The first three portraits load eagerly; subsequent portraits load lazily. The client receives only projected card fields, not full guides or the entire character catalog.

Home, the shared Menu, and New Characters link to the directory. Existing individual guide URLs/body/data stay unchanged. The directory has title, description, canonical, Open Graph/Twitter metadata, and a sitemap entry.

## Home image replacement

The supplied original PNG is now saved unchanged as `public/home/character-guides.png` (2048×1146px, 1,268,161 bytes). The Character Guides entry in `src/app/(mainPages)/page.tsx` points to `/home/character-guides.png`. To replace it later, replace that asset or update this one image path. The image uses the existing positioned `fill` thumbnail with central `object-fit: cover`; no card CSS or object-position override was needed. Empty alt remains appropriate for decorative artwork next to the already named Character Guides link. The original bytes remain preserved; Next Image handles browser delivery optimization without replacing the PNG.

## Validation

- `npm run lint`: pass, no warnings/errors.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: pass; production build also passed TypeScript.
- `npm test`: 17/17 pass, including registry completeness, post-expiry availability, real summary projection, empty registry, name search/combined filters, and a newly registered alternate version.
- `npm run build`: pass, Webpack / Next.js 16.3.4, 71 generated pages, `/character-guides` statically rendered. Existing Inter download uses the network. Logs saved alongside screenshots.
- `TEST_BASE_URL=http://127.0.0.1:3203 npm run test:http`: 6/6 pass, covering all published routes, canonical/title/headings, 404/noindex, exact sitemap, registry links and real data, Home/New Characters entry points, and the supplied PNG 200 response/MIME/original byte count.
- Production Chromium: 1440, 390, and 320px. Verified exact card coverage, full names, generated filter options and shared rarity labels, four-control combined/no-results/reset paths, every guide link, keyboard Tab/Enter/focus rings, Menu/Home entries, all existing Home links, image loading/alt/reserved dimensions, and no horizontal overflow. Expired Mars remains in the directory while absent from New Characters at the October 2 verification date.
- Read-only local fixtures rendered the actual directory component/CSS with zero entries and 24 distinct versions including a very long unbroken name. Verified zero-state UI, unique links, no horizontal overflow at 320px, and 21 lazy portraits after the first three. Fixture data was never registered or published. Fixtures cover layout/SSR; interactive filtering is tested against real production data.
- JS runtime and relevant route/image assets: pass. The existing shared Vercel Analytics inclusion requests `/_vercel/insights/script.js` and returns 404 on the local production server. Those 18 console resource messages are recorded separately in `browser-results.txt`; the existing `src/app/layout.tsx` and analytics integration are unchanged.
- Visual inspection: desktop/320/390 directory, Home entry, no-results, empty-registry, and long-name screenshots. At 320px the element/role/rarity controls stack to keep selected text readable; 390px retains two columns.

The first sandboxed HTTP run could not reach localhost; the same suite then passed with local network permission. No tests remain blocked. Disk space was checked before work (~14GiB) and after the build (~11GiB); installed dependencies were reused through an ignored `node_modules` symlink rather than reinstalled.

## Preview and rerun

The production preview is started on `http://127.0.0.1:3203/character-guides` (Home at `/`). Restart from this worktree:

```sh
cd /Users/sasakiryou/Desktop/OPBR/opbr-character-guides
npm run start -- --hostname 127.0.0.1 --port 3203
```

After changing source or registering another guide, stop that server, run `npm run build`, and start again. For development use `npm run dev -- --hostname 127.0.0.1 --port 3203` instead. This worktree currently shares the original installed dependency directory through a symlink. If that source dependency directory is removed, recreate local dependencies with `npm ci` after checking available disk space.

The optional browser verifier is `tests/character-guides-browser.cjs`; it uses an existing Playwright installation and does not change project dependencies:

```sh
PLAYWRIGHT_MODULE=/Users/sasakiryou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
TEST_BASE_URL=http://127.0.0.1:3203 \
node tests/character-guides-browser.cjs
```

On another machine provide a local Playwright package directory through `PLAYWRIGHT_MODULE`, or make `playwright` resolvable normally. Its Chromium browser must be installed. Tests use an ephemeral local fixture server and close it afterward. Screenshots/results default to this documentation folder; override `OPBR_QA_OUTPUT` to write elsewhere. The browser verifier assumes the current three-guide data (including blue/attacker filter examples and expired Mars); adjust those interaction expectations if the registry changes. Core and HTTP registry-coverage checks derive expected entries dynamically.

## Changed source and integration

- New: `src/app/(mainPages)/character-guides/page.tsx`, `CharacterGuideDirectory.tsx`, `page.module.css`; `src/lib/character-guide-directory.ts`.
- Localized updates: Home `page.tsx`/`page.module.css`; New Characters `page.tsx`/`page.module.css`; `src/components/header/CommonHeader.tsx`; `src/app/sitemap.ts`.
- Tests: `tests/core.test.cjs`, `tests/http.test.cjs`, optional `tests/character-guides-browser.cjs`.
- Evidence: this folder's screenshots and final test/build/browser logs.

`feat/site-updates` (`7dd4fde`) also changes Home and CommonHeader. When integrating later, preserve its news section/menu behavior and add this directory entry and optional-image handling. `feat/tier-important-updates` (`39e0236`) and `feat/create-tier-save-share` (`be96aec`) remain unmerged. Combine the added tests if later branches change the same test files; do not replace their existing regressions. Nusjuro guide data, type, draft, media, and CharacterGuidePage were not edited by this task.

## Original checkout preservation evidence

Final main HEAD, index SHA-256, and `git status --porcelain` match the initial snapshot. The initial dirty set contains nine files (including files inside the untracked Nusjuro media directory). Hash comparisons show concurrent changes at 10:11:55 to Nusjuro's `changed-normal-attack.mp4`, `skill-1.mp4`, and `docs/character-guide-drafts/nusjuro.md`. This task only wrote to its dedicated sibling worktree and `/tmp`; it did not restore, stage, stash, or overwrite those original WIP files. The remaining six original dirty file hashes still match the snapshot. The three independently updated files were left as found. See `original-preservation.json` for comparison flags.

## Rarity follow-up (based on c2afe762f1cd88854f8ab0f87443d5eadb479a68)

Added an explicit Rarity selector, a card badge, and combined grade filtering. The existing full character version name search remains a name search. All rarities includes every registered guide; a grade with no registered guide shows the existing no-results/reset state. The current three registered guides are all `ex`; BF/SP/etc. correctly produce zero matches. No other checkout's new guide was imported.

The character ID resolves its original `grade` from `src/data/characters` / `src/data/characters/type.ts`. The label map formerly local to `src/components/character-frame/CharacterFrame.tsx` is now shared in `src/data/characters/grades.ts`: `ex → EX`, `bf → BF`, `sp → SP`, `star-4 → 4★`, `star-3 → 3★`, `star-2 → 2★`, `free → FREE`, `exchange → EXCH`, `cola → COLA`, `unknown → ?`. CharacterFrame imports the same map, preserving Simulator labels, colors, sizing, and behavior. The directory projects only the grade field alongside existing card fields; no guide-side rarity assignments or name guessing were introduced.

These are the Simulator's catalog grade categories. EX/BF/SP are retained as distinct categories and are not collapsed into 4★. `pickup` in `src/data/scouts/type.ts` is a banner-specific draw category, not a character grade, and is not offered as a Rarity option. Missing, invalid, or explicitly unknown values become `unknown` and display **Unclassified (?)** in this directory; they remain visible under All rarities and are independently filterable if present. Nothing is assigned EX/BF/4★ by inference. Character catalog/guide registry entries and all Scout rates/roll/stat logic are unchanged.

Validation on the final app code: lint/type/build pass; 17/17 core tests; 6/6 HTTP tests; production Chromium 320/390/1440px with name + element + role + rarity combinations, BF zero results, all-field clear/show-all, keyboard Tab/Enter/focus, and overflow checks. Isolated actual-component fixtures verify all ten CharacterFrame grade labels and the conditional Unclassified option. Live Simulator deterministic single pulls verify EX, BF, and 4★ badges, three pulls/fifteen diamonds, and Reset. Existing local Vercel Analytics script 404s remain separately recorded. Updated screenshots and logs in this folder correspond to this follow-up. Disk space remained about 11GiB.

Follow-up source changes: `src/data/characters/grades.ts`; `src/components/character-frame/CharacterFrame.tsx` (label import only); `src/lib/character-guide-directory.ts`; directory `CharacterGuideDirectory.tsx` and `page.module.css`; core/HTTP/browser tests. Home, shared Header, sitemap, published guide registry/content, character IDs/grades, and Scout Simulator draw logic were not edited in this follow-up. Work stays on `feat/character-guides` at the same persistent sibling worktree. No push/PR/merge/deploy.

## Supplied Home image follow-up (based on 4084c3045729019043cb342d5a3e0d8a8039be4e)

Used the user-provided artwork as requested. Original format: PNG, 2048×1146px (approximately 1.79:1), 1,268,161 bytes. Saved byte-identically at `public/home/character-guides.png`; SHA-256 `2d1f9ef88eb2774a463a9e31f79745125a5d5137560f091f5c0a7ed982af5526`. No regeneration, cropping of the source, conversion, or repainting was performed. The current Library materialization workflow supplied the authorized original into this Mac workspace, and final local Library identity/version metadata was retained. No Library writeback or additional Library file was created. The original supplied image remains unchanged.

Only the Home entry image path changed in app source. Existing `fill`, empty decorative alt, lazy loading, sizes, `cover`, and central positioning were reused. At desktop the thumbnail is approximately 190×154px; at 320/390px it is approximately 116×132px. Those taller frames trim the image's sides as expected, while the central face and mouth-held sword remain visible. No common card redesign or card CSS adjustment was needed. Inspect `home-entry-1440.png`, `home-entry-390.png`, and `home-entry-320.png` for exact renders; full Home screenshots were refreshed as well.

Final checks: lint/type/build pass, core 17/17 and HTTP 6/6 pass. HTTP verifies original PNG 200, image/png, and 1,268,161 bytes. Production Chromium checks optimized image loading/natural dimensions, its exact asset path, Home-to-directory navigation at all three widths, all existing Home links, and no horizontal overflow. Existing name/element/role/rarity combinations, zero/clear, keyboard operations, registry-only coverage, and Simulator EX/BF/4★ behavior still pass in the same browser regression. Image display snapshots were visually inspected at 1440/390/320px. Existing local Vercel Analytics 404s remain the only recorded unrelated resource messages. No remaining blockers.

Changed application files: `public/home/character-guides.png` and `src/app/(mainPages)/page.tsx`. Existing HTTP/browser assertions were updated from the old image-free placeholder to the actual provided image; no new unrelated feature was added. Work remains on `feat/character-guides` in `/Users/sasakiryou/Desktop/OPBR/opbr-character-guides`. The original repo and other worktrees were not edited; the news branch was not merged. Future integration should preserve its Home news changes and use this Character Guides image path. No push/PR/merge/deploy.

Preview: `http://127.0.0.1:3203/` (Home) and `/character-guides` (directory). The same restart instructions above apply. Free disk space was checked at about 12GiB before this follow-up.
