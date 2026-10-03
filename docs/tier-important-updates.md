# Tier List important updates

## Scope and current publication state

Adds one latest editorially registered important-update summary below the existing Tier List, plus affected-character colored frames and matching direction tabs. Uses the existing dark background, gold accents, rounded panels, typography and spacing. The first three characters are visible; native disclosure shows the rest, including keyboard operation and operation without JavaScript. Rise/drop/new entry/same-tier important adjustment use both symbols and text. Official notices and OPBR Guide's assessment are separate sections.

**Production now has one editorially registered event.** Happy Halloween Uta is published as a `rise` from unranked to B Tier. The event uses the OPBR Guide assessment supplied for this review; no official-adjustment block is included until its notice date and HTTPS source are separately verified. The Tier List `Last updated` date is October 3, 2026. The development preview continues to use explicitly fictional examples and never changes `src/data/tierList.ts`.

Neither Create Tier List, news, global navigation, medals nor Nusjuro guide files were edited. The original checkout remained on `main` at `774021265d7f307abdcfd60b1c0c816441b216ee` with no uncommitted differences during verification. Initial worktrees were the original checkout and `/Users/sasakiryou/.codex/worktrees/6c7c/opbr-site` (detached `3edc7596fd41f95ff6bc573dce7ed74275b1c4ae`). Work began from the original `HEAD`, which matched the locally available `origin/main`; no fetch, push, PR, merge or deployment was performed.

## Editorial registration

Edit `src/data/tier-important-updates.ts` after verifying a real event. Registration is independent of ordinary reordering in `tierList.ts`.

- Unique event ID, explicit `draft`/`published` status and ISO publication timestamp with timezone.
- Title and editorial summary; each affected character has an existing ID, change kind, from/to tier and a short OPBR Guide assessment.
- A `new` entry has `fromTier: null`. A `rise` may also use `fromTier: null` when an existing character moves from unranked into a tier; this remains a Rise rather than a New Entry. `adjustment` keeps the same tier. Ranked `rise`/`fall` transitions follow the order `god, SS, S, A, B, C, D`.
- An optional official-adjustment section contains only verified facts, its official notice date and HTTPS source. The site's tier evaluation belongs in `reason`, not in that section. For a meta review without an official notice, omit this section.
- Set `published` only when approved for publication. Scheduled future events and drafts are not displayed early. Sort order in the data file does not matter; the newest published event at request time wins. Avoid identical publication timestamps; ties resolve deterministically by event ID.
- Update the existing current rankings separately when justified; this UI never changes them. The page's existing Last updated string remains separately maintained.

Markers are active from publication **inclusive** until 14 elapsed days later **exclusive**, or the next registered published event, whichever comes first. Only the latest event receives markers. Drafts do not terminate them. If an event's target tier differs from the current tier (or the character is no longer ranked), its marker is suppressed and its row explains the current placement. Expired summaries remain explicitly dated, with the current table taking priority. Marker links jump to the visible summary, including for characters inside the disclosure; the original portrait guide link stays separate. A legend above the table explains all four symbols and links to the review below; a return link focuses the Tier List heading with a fixed-header offset.

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
| Desktop 1280×900 and mobile 320×800 / 390×844 | Pass | Actual supported in-app browser; document width matches both mobile viewports, all 41 computed card widths are 48px; screenshots below |
| Disclosure and keyboard | Pass | Repeated click/Enter/Space expands and collapses, correct labels; Tab reaches expanded guide link with solid focus outline |
| Links | Pass | Marker focuses summary at safe header offset; original Bonney portrait opens its guide; expanded S-Snake link opens its guide via Enter |
| Visual boundary states | Pass | Expired: dated panel and zero markers; mismatch: explicit current tier and 4 markers rather than 5; draft: no panel/markers |
| `git diff --check` | Pass | No whitespace errors |
| Real phone/browser matrix and screen-reader speech output | Not run | Narrow desktop browser viewport and accessibility tree were used |

The first sandbox-only build and HTTP attempt failed because network/localhost access was blocked; approved reruns passed. Initial lint exposed the request-time clock purity rule and was corrected using the repository's existing policy. Native disclosure can be operated before hydration; its `open` attribute alone has hydration-warning suppression to preserve that browser state. Repeated fast disclosure after the change produced no new hydration error. Existing Next Image mobile-animation sizing warnings were observed; the original table image sizing/animation was preserved.

Screenshots capture development demo content, not actual game history:

- [Desktop expanded](tier-update-qa/desktop-expanded.jpg)
- [Mobile 320px collapsed](tier-update-qa/mobile-collapsed.jpg)
- [Mobile 390px collapsed](tier-update-qa/mobile-390-collapsed.jpg)
- [Desktop colored cards](tier-update-qa/desktop-cards.jpg)
- [Mobile 390px colored cards](tier-update-qa/mobile-390-cards.jpg)
- [Production empty state, mobile](tier-update-qa/production-empty-mobile.jpg)

## Changed files

Existing minimal connections: `src/app/(mainPages)/tier-list/page.tsx`, `src/components/tier-list/TierList.tsx`, `src/components/tier-list/TierList.module.css` (only adds relative positioning); the Tier List page CSS adds focused-heading and anchor-offset styles.

New: `ImportantTierUpdate.tsx/.module.css`, `TierUpdateBadge.tsx/.module.css` under the Tier List components; `src/data/tier-important-updates.ts`; `src/lib/tier-important-updates.ts`; development `tier-list/preview/page.tsx` and its CSS; fixture and dedicated test; this record and screenshots. The UI revision also adds `TierUpdateLegend.tsx`. No dependency/configuration/test-script changes.

## Feedback revision: summary below the table and stronger card frames

Continued from `02dee1d743345a72659fd22fc66e44a299b30eee` on the existing dedicated branch/worktree, with no starting differences. The summary now follows all tier rows in both the production page and development preview. Historical-tier notes refer to rankings above.

Affected cards have a 2px colored frame with a static soft edge and a filled corner tab matching that frame: mint ↑ for rise, rose ↓ for drop, gold + for new entry, blue ≈ for same-tier adjustment. The palette is distinct from the row background; symbols and the text legend provide non-color cues. The tab stays at the portrait edge, with no explanation over the face. Card geometry remains 88px desktop / 48px mobile, images and ordinary guide links are preserved. Decoration passes pointer events through to the portrait except for the separate tab link. The frame and tab are removed together by the existing expiry component. No new animation is added.

Calculated contrast ratios against `#262626` for frame colors are rise 9.93, drop 5.62, new 9.07, same-tier 8.39. Dark tab symbols (`#111827`) contrast with their filled tab at 11.64, 6.59, 10.63, 9.84 respectively. A white outer focus outline highlights the frame during keyboard use.

Revision checks: lint, TypeScript, 11 core tests, 6 important-update tests, production build, HTTP regression and diff check all pass. Actual 1280/320/390px browser verification covered all four frame types, no horizontal overflow, preserved card size, separate portrait guide navigation, tab/legend links to the lower review, return-link focus/offset, native disclosure click/Enter/Space and Tab, expiry (zero frames and legend), mismatch (four frames and explicit current tier), draft and empty (zero frames/panel). No browser errors were recorded. Screenshots listed above were refreshed for this layout. Real-phone and screen-reader speech verification remains unperformed.

The production event registry and fixture content were not changed. Main and unrelated worktrees were untouched. Available disk space was about 15GiB at revision start, so no storage blocker prevented validation.

At revision completion, the original `main` checkout still pointed to `774021265d7f307abdcfd60b1c0c816441b216ee`. Concurrent Nusjuro-guide changes were present in its guide draft, character guide page, guide index/types and a new Nusjuro guide data file; all were left untouched. The dedicated worktree contains only this Tier List work.


## UI revision v2 — October 3, 2026

Implemented on `feat/tier-important-updates` in the existing dedicated checkout. The starting checkout was clean. No rebase, merge, push, PR, commit or publication was performed.

The design follows the existing Tier List section headings and Guide Article: dark wash, gold uppercase kicker, larger white heading, relaxed spacing and horizontal rules. The upper marker legend now reads as a “Latest Tier Changes” section with a highlighted-character count and a gold “See update details” link. The count describes markers actually present in the rankings (four in the mismatch scenario), rather than promising that every historical change is still marked.

Card frames and filled corner tabs have more presence while preserving the existing 88px desktop / 48px mobile geometry and portrait sizes. Desktop hover and focus reveal the change label, strengthen the shadow and lift the card by 3px. Labels expand toward the inside of the card rather than beyond the right edge of the table. Mobile retains visible symbols and a text legend without needing hover. Keyboard focus keeps a visible outline and separate portrait-guide / update-summary links. Reduced-motion CSS disables the added transitions and movement; OS reduced-motion emulation was not exercised.

The lower review uses an article header with publication date, title and introduction, then character assessments with emphasized tier movements, followed by the official source section. Assessment and official facts have semantic h3 headings. Matching portrait frames and filled direction symbols share the card-marker palette. The native three-visible / additional-character disclosure, historical mismatch note and return link remain available.

Publication logic, 14-day boundaries, request-time selection, client expiry effect, production development guard, empty event registry, fixture content, rankings and guide availability were not edited. No dependencies were added. Changed implementation files are the six existing Tier List update components/styles; this document and new screenshots record the verification.

Validation:

- Whole-repository `npm run lint`: passed.
- TypeScript `tsc --noEmit --incremental false`: passed.
- Core and dedicated important-update tests: all 17 passed (11 core, 6 dedicated).
- `git diff --check`: passed.
- Actual in-app browser at 1280×900 and 390×844: document width matches viewport; all 41 cards are 88px / 48px respectively.
- Desktop hover/focus: expanded label, stronger frame shadow and 3px lift observed. Tab moves from the Bonney portrait guide to its separate summary marker; Enter opens the original guide or focuses the lower review as appropriate.
- Upper details link, marker link and return link: correct anchors and focus; review starts about 102px below the viewport top.
- Native disclosure: click and keyboard Enter/Space expand and collapse; expanded content remains within the 390px document width.
- Browser scenarios: expired has zero markers/legend and retains its dated review; mismatch has four markers and an explicit current-tier note; draft/future/empty have zero markers, legend and review.
- Ordinary `/tier-list`: zero update markers, legend and review; the existing Last updated date is unchanged. This was checked on the development server using the real empty production registry.
- Browser error log: empty. Existing Next Image warnings related to the unchanged table image/mobile animation remain.
- Production build/HTTP checks and real-device/screen-reader testing were not rerun for this UI-only revision. The production preview guard source is unchanged.

Screenshots contain the unchanged fictional development fixture, not actual OPBR update history:

- [Desktop section and normal cards](tier-update-qa/v2/desktop-1280-cards.jpg)
- [Desktop hover](tier-update-qa/v2/desktop-1280-hover.jpg)
- [Desktop keyboard focus](tier-update-qa/v2/desktop-1280-focus.jpg)
- [Desktop review](tier-update-qa/v2/desktop-1280-review.jpg)
- [Desktop full page, expanded](tier-update-qa/v2/desktop-1280-full-expanded.jpg)
- [390px section and cards](tier-update-qa/v2/mobile-390-cards.jpg)
- [390px review](tier-update-qa/v2/mobile-390-review.jpg)
- [390px full page, expanded](tier-update-qa/v2/mobile-390-full-expanded.jpg)
- [Ordinary route with no registered event, 390px](tier-update-qa/v2/normal-route-empty-390.jpg)


## Card glow refinement — October 3, 2026

Continued in the existing `feat/tier-important-updates` checkout with the uncommitted v2 revision already present. This refinement changes only `TierUpdateBadge.module.css`, plus this verification record and new screenshots. All pre-existing v2 work is retained. No commit, merge, rebase, push, PR or publication was performed.

The original solid frames remain at their current v2 widths (3px desktop, 2px mobile). Each kind now supplies RGB channels matching its existing frame and tab: mint rise, rose drop (`fall` internally), gold new entry, blue adjustment. Two color shadows give the frame a defined soft edge and a wider, lower-opacity glow, with a small dark shadow for depth. Desktop normal blur radii are 6px/12px, increasing to 8px/16px on hover or focus. Changed cards lift by only 1px, overriding the ordinary card hover's 3px movement. Existing label expansion, corner tabs, symbols and white keyboard focus outline remain.

Mobile uses tighter 4px/7px color shadows for the existing 5px grid gaps. All four kinds are visible in the normal state through color and symbol, alongside the existing textual legend; no label expansion is required. The existing reduced-motion rule continues to disable transitions, card animation and hover/focus movement while preserving the static glow. Browser stylesheet inspection confirmed that this rule is loaded; OS reduced-motion emulation was not available in this browser interface.

The shadows are attached to the existing absolute-positioned frame. Card/portrait geometry, tier layout, link destinations, pointer events, click areas, accessible labels, expiration effect, publication logic and data are unchanged. No new dependencies were added.

Validation:

- Whole-repository `npm run lint`: passed.
- `tsc --noEmit --incremental false`: passed.
- Existing core plus dedicated important-update tests: 17/17 passed, including the exact 14-day boundary and four change kinds.
- `git diff --check`: passed.
- Actual in-app browser at 1280x900 and 390x844: all 41 cards retain 88x88px and 48x48px respectively; document scroll width equals the viewport width. All mobile tier content widths equal their scroll widths (322px), with no horizontal overflow.
- Desktop normal state: all four matching color glows present. Actual hover without keyboard focus strengthens the glow, expands the label and settles at `translateY(-1px)`; document width stays 1280px.
- Keyboard: Tab moves from the Bonney portrait guide to its separate summary tab. All four kinds were focused by keyboard and show the stronger glow, expanded label and visible outline. No horizontal overflow was observed.
- Mobile normal state: all four colors and symbols visually checked; labels stay collapsed and frames remain within the original tier rows. Neighboring portraits remain distinct.
- Browser error log: empty.
- Production build/HTTP checks, OS motion emulation, real-device and screen-reader speech testing were not run for this CSS-only refinement.

Screenshots use fictional development fixture data:

- [Desktop normal, four colors](tier-update-qa/glow/desktop-1280-normal.jpg)
- [Desktop hover](tier-update-qa/glow/desktop-1280-hover.jpg)
- [Desktop keyboard focus](tier-update-qa/glow/desktop-1280-focus.jpg)
- [390px normal, four colors](tier-update-qa/glow/mobile-390-normal.jpg)
- [390px legend and upper rows](tier-update-qa/glow/mobile-390-legend.jpg)


## Rise / Drop directional streak trial — October 3, 2026

Added only for `rise` and `fall` in the existing uncommitted `feat/tier-important-updates` checkout. Existing Glow CSS is retained verbatim. New Entry and Adjustment receive no motion element. The component adds one empty `aria-hidden` span inside the existing frame only for the two directional kinds; publication, expiry, data and link behavior are unchanged.

Three 1px gradient tracks are clipped to a narrow ring around the frame using a CSS mask. They stay off the portrait and do not intercept pointer input. One pseudo-element translates a repeating 96px texture over 3.6 seconds, linearly and continuously: Rise moves up; Drop reverses the movement and points the brighter gradient head down. The three tracks have staggered positions; the existing character index also offsets card phases. Moving exactly one texture period keeps the wrap visually continuous. There is no opacity, brightness or scale keyframe and no JavaScript animation or new dependency.

Normal effect opacity is 0.38; hover or keyboard focus increases it to 0.55 without changing the speed or restarting the animation. The existing Glow, 1px desktop lift, tab, symbol and label expansion remain. Mobile clips the effect to a tighter 2px ring and runs it in the normal state. `prefers-reduced-motion: reduce` hides the streak layer and disables its animation/transition, retaining the existing static Glow and symbols.

Validation:

- Whole-repository lint and `tsc --noEmit --incremental false`: passed.
- Existing core and dedicated important-update tests: 17/17 passed.
- `git diff --check`: passed.
- Actual browser at 1280x900 and 390x844: all 41 card sizes remain 88x88px / 48x48px; document scroll widths remain 1280px / 390px. Each mobile tier content has matching client/scroll widths of 322px.
- Two Rise cards and one Drop card are simultaneously visible alongside unchanged New Entry and Adjustment cards. Their narrow, low-opacity streaks stay by the frame, with no large flashing region or synchronized whole-card pulse.
- Repeated computed-style samples show both Rise textures moving upward and the Drop texture moving downward. Normal opacity stays at 0.38, with no opacity keyframe. The effect remains active in the normal mobile state.
- Desktop actual hover without focus settles at 0.55 effect opacity with a 3.6-second animation; label expansion remains and document width stays 1280px. Keyboard Tab reaches the separate summary marker from the portrait guide, shows a visible outline and strengthens the effect without changing animation duration.
- Exactly three motion elements exist (Rise / Rise / Drop); New Entry and Adjustment have none. All motion elements have `aria-hidden=true` and `pointer-events:none`.
- Browser stylesheet inspection confirms the loaded reduced-motion rule hides the effect and sets its animation to none. OS reduced-motion emulation was unavailable; this preference was checked in source and loaded styles, not emulated.
- Browser error log was empty. An initially unresponsive old tab required a fresh preview tab; browser automation also limited long asynchronous sampling. Ordinary visual and short computed-style checks completed on the fresh tab.
- No production build/HTTP, real-phone or screen-reader speech tests were run for this visual trial.
- No commit, push, merge, rebase, PR or publication was performed.

Screenshots are still frames of the fictional development preview. Review the live preview to see the movement:

- [Desktop normal, multiple marked cards](tier-update-qa/direction-motion/desktop-1280-normal.jpg)
- [Desktop hover](tier-update-qa/direction-motion/desktop-1280-hover.jpg)
- [Desktop keyboard focus](tier-update-qa/direction-motion/desktop-1280-focus.jpg)
- [390px normal, multiple marked cards](tier-update-qa/direction-motion/mobile-390-normal.jpg)


## Extreme directional energy prototype — October 3, 2026

Replaces the subtle three-track motion with an intentionally conspicuous Rise/Drop prototype for human intensity review. Eight white-headed light streaks launch together per card. Widths vary from 1.5px to 4px, lengths from 30% to 68% of the effect field, and peak individual opacity from 0.6 to 1.0. The parent is already at 0.9 opacity normally and reaches 1.0 on hover/focus. A 1.6-second linear transfer carries the entire group upward; the complete Drop field is inverted vertically, including the pointed heads, plume and movement. Eight beams on a given card share the exact animation delay, with an existing character-index offset between cards.

This trial intentionally overlays light on the portrait. It removes the narrow-ring mask and expands the vertical effect field by 20px desktop / 12px mobile. A pointed colored energy plume and two strong directional shadows extend toward the destination: Rise uses -14px/-28px offsets on desktop; Drop uses +14px/+28px. Mobile uses -8px/-16px and +8px/+16px, while retaining beam brightness, widths and count. Existing Tier-row clipping bounds the outer plume at the row edge without enlarging the rows or document. The strong normal presentation is retained for human review; it has not been toned down to blend with the site.

The pre-existing static Glow remains underneath the additional Rise/Drop energy. New Entry and Adjustment retain their original normal/active shadows and have no motion field or streaks. Card dimensions, images, tier layout, guide links, summary tabs, accessible labels, pointer behavior, publication/expiry logic and data are unchanged. No dependency or JavaScript animation was added. Reduced motion hides the energy field, disables beam animations and removes the extra directional shadows, leaving the original static Glow and symbols. OS preference emulation was unavailable; source and loaded stylesheet rules were inspected.

Validation:

- Whole-repository lint and `tsc --noEmit --incremental false`: passed.
- Core and dedicated important-update tests: all 17 passed.
- `git diff --check`: passed.
- Actual browser 1280x900 and 390x844: multiple Rise/Drop cards show the strong energy effect together with unchanged New/Adjustment cards. All 41 cards remain 88x88px / 48x48px. Document scroll widths equal the viewport widths; all mobile tier content client/scroll widths match at 322px.
- Repeated actual beam bounding-box samples show Rise moving upward and Drop moving downward. Each affected card contains eight beams with the same delay; New/Adjustment have zero beams.
- Computed shadows verify the opposite vertical offsets and confirm the original New/Adjustment Glow remains unchanged at both widths.
- Keyboard Tab still reaches the separate summary tab from the portrait guide, retains the visible outline, expands the label and raises field opacity toward 1.0 without losing directional Glow.
- Browser error log: empty. A fresh preview tab was used after the previous tab's automation connection stopped responding.
- Production build/HTTP, OS motion emulation, real-device and screen-reader speech tests were not run for this prototype.
- Work remains uncommitted on `feat/tier-important-updates`; no push, merge, rebase, PR or publication was performed.

Screenshots are still frames of the fictional preview. Use the live preview to review direction and intensity over a complete transfer:

- [Extreme desktop normal](tier-update-qa/extreme/desktop-1280-normal.jpg)
- [Extreme desktop keyboard focus](tier-update-qa/extreme/desktop-1280-focus.jpg)
- [Extreme 390px normal](tier-update-qa/extreme/mobile-390-normal.jpg)


## Extreme edge placement and irregular rhythm — October 3, 2026

Continued on `feat/tier-important-updates` with the existing uncommitted Extreme prototype retained. This revision changes only `TierUpdateBadge.module.css`, plus this record and new screenshots. No commit, push, merge, PR or publication was performed.

The eight trails now cluster four per side at 3/9/16/20% and 78/84/90/96% of the effect field. A shared horizontal alpha mask clips trails, arrowheads, trail shadows and the energy plume: the central 25–75% is fully transparent, with a short fade between 22–25% and 75–78%. The original broad plume is split into two pointed side plumes using the existing gradient colors/opacity. Existing static and directional frame Glow remains verbatim, so the edge energy still connects to it.

Every trail has its own start Y (88–116%), negative delay and period (1.31–1.91 seconds), alongside the existing varied lengths, widths and peak opacity. Existing character-index offsets remain, further separating cards. There is no shared marching line or regular left-to-right wave. Rise moves upward; Drop still inverts the complete field including arrowheads and plumes. Trail count, peak brightness, parent opacity, Glow intensity and travel distances are preserved; this is a placement/rhythm revision, not an intensity reduction.

New Entry/Adjustment, frame/tab colors, hover/focus rules, 1px desktop lift, link destinations, pointer behavior, portrait/card dimensions, fixture/production data and 14-day expiry logic were not edited. No dependencies were added. The existing reduced-motion rule still hides the field and stops animation while retaining static Glow.

Validation:

- Whole-repository lint and TypeScript `tsc --noEmit --incremental false`: passed.
- Existing core and important-update tests: all 17 passed, including exact expiry boundaries.
- `git diff --check`: passed.
- Actual in-app browser at 1280x900 and 390x844: central portraits remain clear while bright trails and arrowheads stay at the side edges. Two Rise cards and one Drop card were viewed together with New/Adjustment; the effect remains conspicuous but no longer sweeps across faces/bodies or flashes as an aligned eight-beam group. Perceived intensity still warrants human review.
- Computed styles confirm eight distinct start heights, periods and delays per card. Repeated desktop bounding-box samples show Rise decreasing in Y and Drop increasing in Y between cycle resets.
- All 41 cards remain 88x88px desktop and 48x48px mobile after the existing mobile entrance animation settles. Document scroll widths are 1280px and 390px respectively; each mobile tier content has equal client/scroll widths (322px).
- Keyboard Tab reaches the separate summary tab from the original Bonney guide link, showing the white frame outline, opacity approaching 1.0 and the existing 1px lift. Hover rules are unchanged; a separate pointer-hover check was not rerun.
- New/Adjustment have zero streaks and unchanged computed static shadows. Rise/Drop directional Glow offsets remain opposite at both widths.
- Loaded reduced-motion CSS was inspected; OS preference emulation was not performed. Browser error log is empty.
- Production build/HTTP checks, real-device and screen-reader speech tests were not rerun for this CSS-only revision.

Screenshots use the fictional development fixture and show still frames; review the live preview for rhythm:

- [Desktop edge motion](tier-update-qa/edge-motion/desktop-1280-normal.jpg)
- [Desktop keyboard focus](tier-update-qa/edge-motion/desktop-1280-focus.jpg)
- [390px edge motion](tier-update-qa/edge-motion/mobile-390-normal.jpg)


## Extreme card-height motion boundary — October 3, 2026

Continued on `feat/tier-important-updates` without committing or publishing. Only the Rise/Drop motion-field sizing in `TierUpdateBadge.module.css` changed, alongside this record and screenshots. The earlier uncommitted work is retained.

The motion field now uses vertical insets of -4px on desktop and -2px on mobile instead of -20px/-12px. Its existing `overflow: hidden` clips the side plumes, streaks, arrowheads and trail shadows near the character frame. The frame's separate static and directional Glow is unchanged and can still spill outside the card. Actual clipped field heights are 92px around the 88px desktop card and 48px at the 48px mobile card, independent of a Tier row's height or wrapped card count.

The field is a size query container; `200cqh` makes streak travel twice its own height (184px desktop / 96px mobile) rather than a fixed 220px/140px. This clears even the longest trail from its staggered starting position before each cycle resets. The eight widths, percentage lengths, peak opacities, start positions, individual delays/durations, character-index phase offsets, normal/active opacity and full-field Drop inversion remain unchanged. The horizontal central-50% mask and side placement are retained. New/Adjustment, frame colors, hover/focus, desktop 1px lift, tabs, links, card/image CSS dimensions, expiry and data were not edited; no dependency was added.

Validation:

- Whole-repository lint and `tsc --noEmit --incremental false`: passed.
- Existing core and important-update tests: 17/17 passed.
- `git diff --check`: passed.
- Actual browser at 1280x900 and 390x844: side tracks terminate near the card's top/bottom; bright heads and direction remain visible while the portrait center stays clear. Two Rise cards and one Drop card were checked with New/Adjustment.
- Desktop: all 41 cards remain 88x88px; fields are 92px tall within 120px Tier content rows. All five frame shadows match the pre-edit desktop sample, including unchanged directional Glow.
- Mobile: all 41 cards remain 48x48px; all three fields are 48px tall, including the Rise card in a wrapped 115px Tier content row. Document width is 390px; all seven Tier content client/scroll widths match at 322px. Desktop document width is 1280px.
- Repeated bounding-box samples at both widths show Rise moving upward and Drop moving downward between resets. Each field retains eight distinct starts/delays/durations (1.31–1.91 seconds).
- Keyboard Tab from the Bonney portrait reaches its separate summary marker with a white 3px frame outline and approximately 1px desktop lift. Hover rules are unchanged; a separate pointer-hover check was not rerun.
- Loaded reduced-motion CSS still hides the motion field, disables streak animations and removes directional energy shadows. OS preference switching was not performed.
- Browser error log: empty. No production build/HTTP, real-device or screen-reader speech checks were rerun for this CSS sizing adjustment.
- No commit, push, merge, PR or publication was performed.

Screenshots use fictional preview fixtures; review the live preview for motion:

- [Desktop card-height motion](tier-update-qa/card-height/desktop-1280-normal.jpg)
- [390px card-height motion](tier-update-qa/card-height/mobile-390-normal.jpg)


## Rise / Drop terminal fade — October 3, 2026

Continued on `feat/tier-important-updates` with all previous uncommitted work retained. This revision changes only the motion-field mask in `TierUpdateBadge.module.css`, plus this verification record and three screenshots. No commit, push, merge, PR or publication was performed.

The existing horizontal central-50% mask is intersected with a vertical alpha gradient. In the upward field, opacity tapers from full strength at 24% of field height through 55% at 15% and 15% at 8%, reaching zero at 4% and remaining transparent through the clipping edge. This makes the final 20% of visible travel fade progressively just before the frame, including each streak's body, arrowhead, tail, shadows and side plume. The entire Drop field retains its vertical inversion, so its destination fade is at the bottom. A lighter 14% spatial entrance fade complements the existing 12% time-based fade-in. The existing animation keyframes, peak opacities, streak gradients and frame Glow are unchanged.

Field sizing remains 92px desktop / 48px mobile. The eight side positions, unequal starts/durations/delays, character phase offsets, 200cqh upward travel and Drop inversion remain unchanged. New/Adjustment, hover/focus selectors, reduced-motion rules, cards, links, tabs, fixture/production data and expiry logic are untouched. No dependency was added.

Validation:

- Whole-repository lint and `tsc --noEmit --incremental false`: passed.
- Existing core and important-update tests: 17/17 passed, including the exact 14-day boundary.
- `git diff --check`: passed.
- Actual in-app browser at 1280x900 and 390x844: both Rise cards and the Drop card were inspected together. Streaks fade within their destination edge instead of ending as a bright clipped line; arrowheads and side motion remain visible, and portrait centers stay clear. Screenshots are still frames; final visual intensity remains a human judgment in the live preview.
- Loaded styles confirm both mask gradients with `mask-composite: intersect` on all three fields, unchanged .9 normal opacity and opposite Drop transform. Fields measure 92px / 48px, and all 41 cards remain 88x88px / 48x48px.
- Document scroll widths equal 1280px / 390px. All seven Tier content client/scroll widths match (1038px desktop / 322px mobile).
- Eight consecutive mobile position samples over 221ms show upward Rise movement and downward Drop movement between cycle resets, with independent beam phases retained.
- Keyboard Tab from Bonney's portrait reaches its separate summary tab, retaining the white 3px frame outline, label expansion, stronger field opacity and 1px desktop lift. Hover selectors and shadows are unchanged; a separate pointer-hover check was not rerun.
- New/Adjustment still have zero streaks. Loaded reduced-motion styles still hide the field and stop streak animations, retaining static Glow. OS preference switching was not performed.
- Browser error log: empty. No production build/HTTP, real-device or screen-reader speech checks were rerun for this mask-only revision.

Screenshots use fictional development fixtures:

- [1280px terminal fade](tier-update-qa/terminal-fade/desktop-1280-normal.jpg)
- [1280px keyboard focus](tier-update-qa/terminal-fade/desktop-1280-focus.jpg)
- [390px terminal fade](tier-update-qa/terminal-fade/mobile-390-normal.jpg)


## Compact Rise / Drop background Glow — October 3, 2026

Continued on `feat/tier-important-updates`, preserving all earlier uncommitted changes. Only six directional background-shadow size values in `TierUpdateBadge.module.css` changed, plus this record and QA artifacts. No commit, push, merge, PR or publication was performed.

Desktop directional offsets shrink from 14px / 28px to 10px / 20px (29%); mobile offsets shrink from 8px / 16px to 6px / 12px (25%). The two blur radii shrink from 18px / 30px to 13px / 22px (28% / 27%) at both widths. Colors, 85% / 55% alpha, zero spread, upward Rise / downward Drop signs, static frame Glow and normal/active differences are unchanged. The side plume gradients belong to the motion field and were left untouched with all eight streaks, masks, terminal fade, timing, 92px / 48px field sizing and reduced-motion rules. New/Adjustment, tabs, links, card geometry, 1px desktop lift and expiry behavior were not edited.

Validation:

- Whole-repository lint and `tsc --noEmit --incremental false`: passed.
- Existing core and important-update tests: 17/17 passed.
- `git diff --check`: passed.
- Actual in-app browser at 1280x900 and 390x844: background Glow is closer to both Rise cards and the Drop card, retaining opposite vertical bias. Document scroll width equals each viewport width; all seven Tier content client/scroll widths match (1038px desktop / 322px mobile).
- All 41 cards retain 88x88px desktop / 48x48px mobile CSS dimensions. Before/after computed motion settings match for all three fields: masks, plume gradients, inversion, opacity, eight beam positions/lengths/widths/gradients/shadows/delays/durations. Desktop field rectangles remain 92px; mobile fields settle at 48px. One pre-edit mobile rectangle was sampled during the unchanged entrance animation at 48.06px.
- Static normal/active frame-shadow definitions and New/Adjustment shadows match the pre-edit samples. Keyboard Tab reaches the separate Rise and Drop summary links, with the visible white focus outline, stronger frame Glow and existing desktop lift. Pointer-hover and OS reduced-motion preference switching were not separately rerun; their CSS rules are unchanged.
- Browser error log: empty. No production build, real-device or screen-reader speech check was rerun for this shadow-only adjustment.

Screenshots use fictional development fixtures:

- [1280px compact background Glow](tier-update-qa/compact-background-glow/desktop-1280-after.jpg)
- [1280px keyboard focus](tier-update-qa/compact-background-glow/desktop-1280-focus.jpg)
- [390px compact background Glow](tier-update-qa/compact-background-glow/mobile-390-after.jpg)
- [Before/after browser measurements](tier-update-qa/compact-background-glow/measurements.json)


### Further background blur reduction — October 3, 2026

Following human review, reduced only the two directional blur radii again: 13px / 22px to 8px / 14px (a further 38% / 36%). Directional offsets, colors, alpha, static normal/active frame shadows and all motion rules remain unchanged. Lint, TypeScript, all 17 existing tests and diff whitespace checks passed. Actual browser at 1280x900 and 390x844 confirms a narrower background halo, upward Rise / downward Drop bias, eight streaks per field, 92px / 48px fields and document widths equal to the viewport. No commit, push, merge, PR or publication was performed.

- [1280px tighter blur](tier-update-qa/compact-background-glow/desktop-1280-tighter.jpg)
- [390px tighter blur](tier-update-qa/compact-background-glow/mobile-390-tighter.jpg)


### Two further blur steps — October 3, 2026

Following human review, reduced only the two directional blur radii from 8px / 14px to 3px / 6px, keeping offsets, colors, opacity and every streak/motion rule unchanged. At 1280x900 and 390x844, the background halo is narrower and Rise/Drop still bias upward/downward; fields retain eight streaks and 92px / 48px heights, with no horizontal document overflow. Lint, TypeScript, all 17 existing tests and diff whitespace checks passed. No commit, push, merge, PR or publication was performed.

- [1280px two further blur steps](tier-update-qa/compact-background-glow/desktop-1280-two-steps.jpg)
- [390px two further blur steps](tier-update-qa/compact-background-glow/mobile-390-two-steps.jpg)


### Shared frame Glow with New entry — October 3, 2026

Human review now requests the same background blur treatment as New entry, superseding the earlier directional-shadow requirement. Removed the Rise/Drop directional energy-shadow declarations, normal/active overrides, mobile offset override and obsolete reduced-motion shadow reset. All four change kinds now use the existing shared frame-shadow definitions, preserving each kind's color. Desktop hover/focus use the shared active shadow. Mobile uses the same existing static treatment as New entry. The eight streaks, side plumes, fade masks, upward/downward motion, field dimensions and reduced-motion animation/visibility rules are unchanged.

At 1280x900 and 390x844, all five frame shadows have identical geometry and opacity, with their respective colors. Document scroll widths equal viewport widths; the three motion fields retain eight streaks, 92px / 48px heights and the Drop inversion. Desktop keyboard focus retains the white 3px outline, active shared Glow and 1px lift. Lint, TypeScript, all 17 existing tests and diff whitespace checks passed. No commit, push, merge, PR or publication was performed.

- [1280px shared Glow](tier-update-qa/compact-background-glow/desktop-1280-shared-glow.jpg)
- [390px shared Glow](tier-update-qa/compact-background-glow/mobile-390-shared-glow.jpg)
- [1280px shared Glow focus](tier-update-qa/compact-background-glow/desktop-1280-shared-glow-focus.jpg)


## PR integration verification — October 3, 2026 (JST)

This record supersedes the earlier prototype/integration status above. The accepted UI uses eight side streaks on Rise/Drop, a transparent central 50%, card-height fields and a terminal fade before the frame. All four kinds share frame Glow geometry, with their own colors. New Entry and Adjustment remain static. No real editorial event was registered.

- Starting branch/HEAD: `feat/tier-important-updates` / `39e0236ad0166c7c3d4578ab430a3ef4e8505a7c`.
- Committed the existing UI and QA work as `b6314ed`.
- Fetched remote main using existing GitHub HTTPS authentication after SSH public-key authentication failed. Base main: `5c5e0f437cd2ea33c545fee39b2d50e42450961d`.
- Merged main without conflicts as `edc6079c520934dbea4d4326f1bc00357d397c95`. No whole-worktree copy or history rewrite was used. Header, guide registry/content, sitemap, core tests and HTTP tests match main exactly. The source rankings were not edited by this feature.
- `npm run lint`: pass.
- `./node_modules/.bin/tsc --noEmit --incremental false`: pass.
- Core tests: 18 pass (latest main added one beyond the requested 17). Dedicated important-update tests: 6 pass. Additional newly integrated Tier List save/share and site-update tests: 8 + 7 pass. Combined: 39/39 pass.
- `npm run build`: pass. `/tier-list` stays static with the empty registry.
- `TEST_BASE_URL=http://127.0.0.1:3211 npm run test:http`: 7/7 pass against the local production build, including published guide routes and sitemap.
- Explicit selection assertions: before publication, publication inclusive, one millisecond before cutoff, exact 14-day cutoff exclusive, 30-day expired, active, mismatch, draft, future and empty: pass. Expiry retains the dated summary.
- Production checks: registry is exactly `[]`; ordinary Tier List has zero update panels, legend or markers and no demo content, preserving its date and Nusjuro guide link. Preview returns 404 and noindex for ordinary, active-query and mismatch-query requests. Preview is absent from sitemap. All 47 public production JS/HTML files were checked for fixture identifiers/title/source and contain none. The fixture import remains server-side behind the development guard; this verification does not claim the fixture is absent from every private server build artifact.
- In-app browser at 1280x900 and 390x844: document scroll widths equal viewport widths; 41 cards retain 88px/48px widths. Rise/Drop fields contain eight streaks each at 92px/48px height. Computed masks clear the central 25%-75% and fade vertically; Drop reverses the field with `scaleY(-1)`. Shared Glow geometry is present for all kinds. Screenshots show clear portraits and effects contained around the cards.
- Keyboard Tab reaches the separate portrait/summary links and visible focus outline. Enter on a marker focuses the summary approximately 102px below the top; the return link reaches the Tier List heading. Native disclosure expands and reveals the S-Snake guide link. Nusjuro's portrait opens the newly integrated guide. Navigation includes Character Guides and Updates.
- Browser scenarios: active = 5 markers and summary; exact cutoff = 0 markers and retained summary; mismatch = 4 markers and explicit “At publication: S. Current tier: SS” explanation; draft/future/empty = 0 markers and no summary. All scenarios have no horizontal overflow at 390px. Browser error log is empty. Production preview also visibly renders Page not found.
- `git diff --check`: pass.

Not rerun: physical mobile devices, a browser/assistive-technology matrix, screen-reader speech, OS reduced-motion preference switching or pointer-hover interaction. Reduced-motion CSS was reviewed: directional fields are hidden, streak animations stop, added transitions stop and affected-card hover/focus lift is removed. Existing fixture/date selection, request-time `connection()` gate and client expiry rules are unchanged by UI polishing.

Screenshots below use fictional development data and the integrated main header; they are not actual OPBR update history:

- [1280px integrated cards](tier-update-qa/integration-2026-10-03/desktop-1280.jpg)
- [390px integrated cards and keyboard focus](tier-update-qa/integration-2026-10-03/mobile-390.jpg)
- [Browser boundary scenario measurements](tier-update-qa/integration-2026-10-03/browser-scenarios.json)

Publication scope ends at a Draft PR. Merge, production deployment and real-event registration are outside this task.


## Production event registration — October 3, 2026

Happy Halloween Uta is the first real event registered with this UI. The event is published as **Rise · Unranked → B** for `happy-halloween-uta`. This distinguishes an existing character rising from outside the ranked list from a `new` entry, which remains reserved for New Entry semantics.

OPBR Guide assessment:

> The recent buffs greatly improved Uta’s Treasure control and durability. Above 50% HP, she can ignore enemies while capturing Treasure and while charging her team’s Treasure Gauge up to 150%, making her significantly more reliable in contested Treasure Areas.

No `officialAdjustment` object is attached in this change because an official notice date and HTTPS source were not added as part of this review. The ranking already places Happy Halloween Uta in B Tier, so the production Rise marker is coherent with the current table.
