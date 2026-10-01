# Tier List important updates

## Scope and current publication state

Adds one latest editorially registered important-update summary before the existing Tier List, plus small affected-character markers. Uses the existing dark background, gold accents, rounded panels, typography and spacing. The first three characters are visible; native disclosure shows the rest, including keyboard operation and operation without JavaScript. Rise/drop/new entry/same-tier important adjustment use both symbols and text. Official notices and OPBR Guide's assessment are separate sections.

**Production events are intentionally empty.** Git history confirms placement edits but does not establish official notice dates or the editorial reasons for a major review. No fictional OPBR change is published. `/tier-list` therefore shows the existing page with no additional panel or markers. Its hard-coded `Last updated: September 18, 2026` is preserved. The preview uses explicitly fictional examples with existing character art; it never changes `src/data/tierList.ts`.

Neither Create Tier List, news, global navigation, medals nor Nusjuro guide files were edited. The original checkout remained on `main` at `774021265d7f307abdcfd60b1c0c816441b216ee` with no uncommitted differences during verification. Initial worktrees were the original checkout and `/Users/sasakiryou/.codex/worktrees/6c7c/opbr-site` (detached `3edc7596fd41f95ff6bc573dce7ed74275b1c4ae`). Work began from the original `HEAD`, which matched the locally available `origin/main`; no fetch, push, PR, merge or deployment was performed.

## Editorial registration

Edit `src/data/tier-important-updates.ts` after verifying a real event. Registration is independent of ordinary reordering in `tierList.ts`.

- Unique event ID, explicit `draft`/`published` status and ISO publication timestamp with timezone.
- Title and editorial summary; each affected character has an existing ID, change kind, from/to tier and a short OPBR Guide assessment.
- A `new` entry has `fromTier: null`; `adjustment` keeps the same tier. `rise`/`fall` follow the order `god, SS, S, A, B, C, D`.
- An optional official-adjustment section contains only verified facts, its official notice date and HTTPS source. The site's tier evaluation belongs in `reason`, not in that section. For a meta review without an official notice, omit this section.
- Set `published` only when approved for publication. Scheduled future events and drafts are not displayed early. Sort order in the data file does not matter; the newest published event at request time wins. Avoid identical publication timestamps; ties resolve deterministically by event ID.
- Update the existing current rankings separately when justified; this UI never changes them. The page's existing Last updated string remains separately maintained.

Markers are active from publication **inclusive** until 14 elapsed days later **exclusive**, or the next registered published event, whichever comes first. Only the latest event receives markers. Drafts do not terminate them. If an event's target tier differs from the current tier (or the character is no longer ranked), its marker is suppressed and its row explains the current placement. Expired summaries remain explicitly dated, with the current table taking priority. Marker links jump to the visible summary, including for characters inside the disclosure; the original portrait guide link stays separate.

With events registered, `connection()` enables request-time selection so scheduled publication/expiry does not freeze at build time. Markers also remove themselves at their deadline on an already-open browser page. A newly published summary requires navigation/reload; no notification or polling system is added. Device clock accuracy affects the client-side expiry, while the server is authoritative on each request. With no events, the production page remains static.

## Local preview

```sh
npm run dev -- --hostname 127.0.0.1 --port 3210
```

Open `http://127.0.0.1:3210/tier-list/preview`. The visible page and summary label all example content as demo. Fixture data lives in `tests/fixtures/tier-important-updates.ts`. The fixed simulated time avoids previews changing with the real date; marker client timers are disabled only on this development preview.

Scenario links cover active, exact 14-day cutoff, current-tier mismatch, draft, future publication and no updates. `/tier-list/preview` returns **404 in production**, has noindex metadata, is absent from navigation/sitemap, and imports the fixture only after the development guard. The ordinary `/tier-list` route never reads fixture data.

## Final validation

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | Pass | Whole repository; server clock uses the existing scout-page exception policy |
| `npx tsc --noEmit` | Pass | Final code |
| `npm test` | Pass | Existing 11 core tests |
| `node --require ./tests/register.cjs --test tests/tier-important-updates.test.cjs` | Pass | 6 tests: no automatic events, draft/future/invalid/empty, inclusive publication, exclusive expiry, next event replaces all badges, mismatch/removal, four kinds and production data integrity |
| `npm run build` | Pass | Next 16.3.4 Webpack; production Tier List stays static; existing Inter font fetched with approved network access |
| `TEST_BASE_URL=http://127.0.0.1:3211 npm run test:http` | Pass | Existing 4 HTTP regression tests on production server |
| Production demo guard and empty state | Pass | Browser shows 404 for preview; production Tier List has zero panels/markers; date, criteria and original guide links present |
| Desktop 1280×900 and narrow mobile 320×800 | Pass | Actual supported in-app browser; document width 320px, computed card width 48px; screenshots below |
| Disclosure and keyboard | Pass | Repeated click/Enter/Space expands and collapses, correct labels; Tab reaches expanded guide link with solid focus outline |
| Links | Pass | Marker focuses summary at safe header offset; original Bonney portrait opens its guide; expanded S-Snake link opens its guide via Enter |
| Visual boundary states | Pass | Expired: dated panel and zero markers; mismatch: explicit current tier and 4 markers rather than 5; draft: no panel/markers |
| `git diff --check` | Pass | No whitespace errors |
| Real phone/browser matrix and screen-reader speech output | Not run | Narrow desktop browser viewport and accessibility tree were used |

The first sandbox-only build and HTTP attempt failed because network/localhost access was blocked; approved reruns passed. Initial lint exposed the request-time clock purity rule and was corrected using the repository's existing policy. Native disclosure can be operated before hydration; its `open` attribute alone has hydration-warning suppression to preserve that browser state. Repeated fast disclosure after the change produced no new hydration error. Existing Next Image mobile-animation sizing warnings were observed; the original table image sizing/animation was preserved.

Screenshots capture development demo content, not actual game history:

- [Desktop expanded](tier-update-qa/desktop-expanded.jpg)
- [Mobile collapsed](tier-update-qa/mobile-collapsed.jpg)
- [Production empty state, mobile](tier-update-qa/production-empty-mobile.jpg)

## Changed files

Existing minimal connections: `src/app/(mainPages)/tier-list/page.tsx`, `src/components/tier-list/TierList.tsx`, `src/components/tier-list/TierList.module.css` (only adds relative positioning).

New: `ImportantTierUpdate.tsx/.module.css`, `TierUpdateBadge.tsx/.module.css` under the Tier List components; `src/data/tier-important-updates.ts`; `src/lib/tier-important-updates.ts`; development `tier-list/preview/page.tsx` and its CSS; fixture and dedicated test; this record and three screenshots. No dependency/configuration/test-script changes.
