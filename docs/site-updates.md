# Site updates

`/updates` is a small, manually maintained history of content and features added to OPBR Guide. It uses `src/data/site-updates.ts`; no database, authentication, environment variables, or external service is needed. The existing Menu links to it. It is separate from Tier List ranking notices.

## Add an update

Add an entry to `siteUpdates` once its content or feature is available on the published site. Do not announce work in another branch as released. Keep the title short and the description focused on what visitors can now use.

```ts
{
  id: "unique-stable-update-id",
  date: "2026-10-01", // Actual site publication date in UTC, YYYY-MM-DD.
  title: "A short description of the addition",
  category: "content", // content | guide | feature
  description: "What was added and how visitors can use it.",
  links: [{ href: "/existing-page", label: "Open the related page" }],
},
```

Use a unique lowercase hyphenated `id`, a valid calendar date, at least one working internal link, and a specific link label. Use the date the addition became available on the site, rather than the game's event date, screenshot date, or importer default. Entries sort by date descending; ties keep their source order, so place the latest entry first. Older entries remain a history and do not receive a permanent “new” badge. Empty data shows a message with a home link.

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

Check `/updates` on desktop and mobile, open Menu → Updates, and follow every related link. Check long titles and the empty state when changing the display. Rebuild and deploy through the usual authorized workflow to publish new entries; editing the data alone does not update an existing deployment.

## Initial implementation checks

Validated from base `774021265d7f307abdcfd60b1c0c816441b216ee` in the dedicated `feat/site-updates` worktree:

- Pass: ESLint, `tsc --noEmit`, 11 existing core tests, 3 update data/render tests, and `git diff --check`.
- Pass: production build with all 71 static pages generated, including `/updates`; production HTTP regression tests (4 tests covering published routes, canonical metadata, unfinished routes, 404s, sitemap, and robots).
- Pass: actual browser at 1440px desktop and 390px / 320px mobile widths; no horizontal overflow. Menu → Updates navigation, all three related links, and browser back navigation worked. Related links have 44px tap targets; no browser warning/error logs were captured.
- Pass: automated empty-state rendering (explanation and home link), long title escaping, newest-first date ordering, and preserving the input array. The shipped medal title also wraps correctly on mobile.
- Not performed: real-browser rendering of synthetic empty data and extremely long synthetic titles; no temporary routes or fixture data were added to the product. No push, PR, merge, or deployment was performed.

The first sandbox build could not fetch the existing Google font. A network-enabled build compiled, then ran out of disk space. Removing only this task's generated `.next/cache` allowed the final build to complete. Disk space remained low (about 277 MiB at the final check), so no further heavy builds or dependency installation were attempted.

Screenshots are saved outside the repository at `/tmp/opbr-site-updates-qa/desktop.jpg` and `/tmp/opbr-site-updates-qa/mobile.jpg`. A production preview was started at `http://127.0.0.1:3104/updates`. If it is no longer running, use the commands above with `--port 3104` and set `TEST_BASE_URL=http://127.0.0.1:3104` for the HTTP tests.
