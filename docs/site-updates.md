# Site updates

Home shows Essential OPBR tools after its introductory text, then up to three featured/recent additions under “What's new”, followed by Guides for every step. “View all updates” opens `/updates`, the full history. Both news surfaces use the same `src/data/site-updates.ts` entries and shared `SiteUpdateCard` component; no database, authentication, environment variables, or external service is needed. The existing Menu also links to `/updates`. This is separate from Tier List ranking notices.

## Add an update

Add an entry to `siteUpdates` once its content or feature is available on the published site. Do not announce work in another branch as released. Keep the title short and the description focused on what visitors can now use.

```ts
{
  id: "unique-stable-update-id",
  date: "2026-10-01", // Actual site publication date in UTC, YYYY-MM-DD.
  title: "A short description of the addition",
  category: "content", // content | guide | feature
  description: "What was added and how visitors can use it.",
  featuredRank: 1, // Optional Home priority; lower positive numbers appear first.
  image: { // Optional. Use a verified local asset and its actual dimensions.
    src: "/medals/halloween-perona.webp",
    alt: "Pink Halloween Perona medal artwork",
    width: 200,
    height: 200,
    kind: "medal", // medal | banner
  },
  links: [{ href: "/existing-page", label: "Open the related page" }],
},
```

Use a unique lowercase hyphenated `id`, a valid calendar date, at least one working internal link, and a specific link label. Use the date the addition became available on the site, rather than the game's event date, screenshot date, or importer default. The full list sorts by date descending; ties keep source order, so place the latest entry first. Older entries remain a history and do not receive a permanent “new” badge. Empty data shows an explanation and usable navigation.

Home prioritizes entries with `featuredRank`, then fills remaining slots with the newest unfeatured entries, up to three unique IDs. Equal featured ranks use the newest date, then source order. Omit/remove `featuredRank` when an item no longer needs emphasis; its history entry remains available. Do not add artificial news to fill the three slots: the initial verified data contains two entries, so Home shows two.

Images are optional. Supply an existing local path, meaningful alt text, and the asset's actual width/height. Both medal art and full Scout banners use `object-fit: contain` to preserve their content. The image frame reserves the intrinsic aspect ratio to reduce layout shift; medals are capped to a smaller square. On mobile, the image remains beside the title while description and links span the card width. With no `image`, the text uses the full card width. Use `sips -g pixelWidth -g pixelHeight public/path/to/image.webp` to check dimensions on Mac. No additional article pages or external image collection are needed.

The initial entries are limited to content verified in the starting main branch:

| Site date (UTC) | Evidence | Related content |
| --- | --- | --- |
| 2026-10-01 | Commit `774021265d7f307abdcfd60b1c0c816441b216ee`, committed at `2026-10-01T22:36:22Z` | `halloween-perona` and `ill-trick-you` in `src/data/medals/medals.ts` |
| 2026-10-01 | Commit `126e7dbaa81f065f326a50bdd8ad4995dd799b60`, committed at `2026-10-01T22:35:14Z` | `happy-halloween-uta-20261027` and `singer-of-the-new-genesis-uta-20261030` in `src/data/scouts/` |

These dates describe site additions. The Scout start timestamps are importer defaults without screenshot verification, so these entries make no claim about official game start times.

## Verify and publish

```sh
npm run lint
npm test
node --require ./tests/register.cjs --test tests/site-updates.test.cjs
npx tsc --noEmit
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
# In a second terminal:
npm run test:http
```

Check Home and `/updates` on desktop and mobile, follow “View all updates” and Menu → Updates, and open the related links. Check Home's featured/newest ordering, three-item limit, empty data, missing images, and long titles when changing the display. Rebuild and deploy through the usual authorized workflow to publish new entries; editing the data alone does not update an existing deployment.

## Initial implementation checks

Validated from base `774021265d7f307abdcfd60b1c0c816441b216ee` in the dedicated `feat/site-updates` worktree:

- Pass: ESLint, `tsc --noEmit`, 11 existing core tests, 3 update data/render tests, and `git diff --check`.
- Pass: production build with all 71 static pages generated, including `/updates`; production HTTP regression tests (4 tests covering published routes, canonical metadata, unfinished routes, 404s, sitemap, and robots).
- Pass: actual browser at 1440px desktop and 390px / 320px mobile widths; no horizontal overflow. Menu → Updates navigation, all three related links, and browser back navigation worked. Related links have 44px tap targets; no browser warning/error logs were captured.
- Pass: automated empty-state rendering (explanation and home link), long title escaping, newest-first date ordering, and preserving the input array. The shipped medal title also wraps correctly on mobile.
- Not performed: real-browser rendering of synthetic empty data and extremely long synthetic titles; no temporary routes or fixture data were added to the product. No push, PR, merge, or deployment was performed.

The first sandbox build could not fetch the existing Google font. A network-enabled build compiled, then ran out of disk space. Removing only this task's generated `.next/cache` allowed the final build to complete. Disk space remained low (about 277 MiB at the final check), so no further heavy builds or dependency installation were attempted.

Screenshots are saved outside the repository at `/tmp/opbr-site-updates-qa/desktop.jpg` and `/tmp/opbr-site-updates-qa/mobile.jpg`. A production preview was started at `http://127.0.0.1:3104/updates`. If it is no longer running, use the commands above with `--port 3104` and set `TEST_BASE_URL=http://127.0.0.1:3104` for the HTTP tests.

## Home and related-image revision checks

Continued in `/Users/sasakiryou/Desktop/OPBR/opbr-site-updates`, branch `feat/site-updates`, from clean commit `3a8fa98048d15160919e94695724ccda391641fa`:

- Pass: ESLint, TypeScript, 11 existing core tests, 7 update selection/data/render tests, production build (71 generated pages), and production HTTP tests including the Home section/hierarchy check.
- Pass: Home and `/updates` in the actual browser at 1440px desktop and 390px/320px mobile. Headings are Home h1 → section h2 → card h3, and archive h1 → card h2. Existing tools and their links remain below the news section.
- Pass: “View all updates” by keyboard Enter, visible keyboard focus outline, all three related destination links, back navigation, and mobile tap areas of at least 44px. No captured browser warning/error logs.
- Pass: reused medal and Scout images loaded, reserved intrinsic dimensions/frame aspect ratios, `contain` rendering, and no horizontal overflow. This verifies space reservation, not a measured field CLS score.
- Pass: temporary read-only HTML fixtures rendered the actual shared components and CSS with 0 entries, image-free content, an unbroken 168-character title, and 4 entries. At desktop, 390px, and 320px, Home selected three unique entries and the full list retained four; empty data kept navigation, and missing images used a single text column. The fixtures were outside the repository and were never added to product data or routes.
- Not performed: production deployment, field performance monitoring, push/PR/merge, or unrelated guide work.

Disk space was about 15 GiB at the revision's start. Revision screenshots are in `/tmp/opbr-site-updates-qa/`: `home-desktop.jpg`, `home-mobile-full.jpg`, `updates-images-desktop.jpg`, `updates-images-mobile.jpg`, `fixture-long-no-image-320.jpg`, and `fixture-empty-320.jpg`. The temporary fixture server was stopped after verification. Production preview uses `http://127.0.0.1:3104/` (restart using the commands above if needed).

## Section-order revision

At the user's request, Home now orders Essential OPBR tools → What's new → Guides for every step. Only the Home component placement, its existing HTTP order assertion, and this document changed from `7dd4fde4781077a943681d5c7d27dc44ace4a0b7`. The earlier validation notes above describe the previous order.

Pass: lint, TypeScript, 11 core tests, 7 update tests, production build (71 pages), and the updated HTTP regression suite. Actual browser verification at 1440px desktop and 390px/320px mobile confirmed the new heading order and no horizontal overflow. Screenshots: `/tmp/opbr-site-updates-qa/home-reordered-desktop.jpg` and `/tmp/opbr-site-updates-qa/home-reordered-mobile.jpg`. No push, PR, merge, or deployment was performed.
