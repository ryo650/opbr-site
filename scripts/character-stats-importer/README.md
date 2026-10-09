# Character Stats Importer v0.1

Local maintainer workflow: screenshots → cropped OCR → canonical character
suggestion → per-row corrections/review → approved local catalog save.
The existing Medal Importer and Lv.100 Base Stats prototype are unchanged.
No Next.js route, public write endpoint, deployment or automatic data promotion
is introduced.

## Run

Requires Node 22.12+ (native TypeScript stripping), ImageMagick 7, and `npm ci`.
The default ImageMagick path is `/opt/homebrew/bin/magick`; set `OPBR_MAGICK`
for other installations. Vision uses macOS's existing Medal Importer helper.
If Vision is unavailable, the new importer falls back to Tesseract.js. Its
English model is downloaded once into ignored `.cache/`; screenshots never
leave this computer. Set `OPBR_STATS_OCR=vision` to disable fallback, or
`OPBR_STATS_OCR=tesseract` to bypass Vision on affected hosts.
The Tesseract worker API follows the [upstream documentation](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).

```sh
npm run characters:stats-review
# Or preload a batch (maximum 20 files):
OPBR_STATS_OCR=tesseract npm run characters:stats-review -- /path/to/local/screenshots/*.PNG
```

Open the exact `http://127.0.0.1:4319` URL printed by the command. Select PNG/JPEG
screenshots (up to 20 per upload batch, 10 MB per image, 50 rows per session).
Verify the version AND personal name, edit each value/condition if needed,
confirm all three medal slots are empty, then approve each row. Save one row
or select several individually approved rows and save together. Any invalid
selected row stops the entire selected save. Unselected rows remain pending.
Saving does not commit Git changes or deploy the site.

`--port 0` picks a free port. `--catalog /path/to/test.json` uses a separate
catalog (initialize it with `[]` first) for safe verification. Normal saves
go to `src/data/characters/max-level-stats.json`. Keep this server local;
Host, Origin and session-token checks restrict writes to this review page.
Pending edits survive catalog reloads in the current page, with approvals
reset. Unsaved drafts are session-only; exiting the server discards them.
Restart with the original images to resume. Saved records include the source
SHA-256, filename, template/engine, raw OCR, original matching result, original
values/conditions, corrected values, confirmed conditions, previous values,
and approval time. The temporary image copies are deleted when the server exits.

## Data and approval rules

The canonical catalog uses the existing string character IDs. The existing
`CharacterLevel100BaseStats` stores **unboosted** `baseHp/baseAtk/baseDef`.
This importer stores **observed** `maxStats` plus conditions in a separate
optional catalog, exported from `src/data/characters/index.ts`. Characters
with no record need no placeholder; individual numeric fields may be null.
At least one of HP/ATK/DEF must be present. Null input preserves an existing
field rather than deleting it. The HP/ATK/DEF range is 1–999999 (integers),
CRIT is >0 to 100, and total power is a positive integer.

v0.1 only accepts the landscape 2048×946 layout and proportionally scaled
images with the same aspect ratio. It requires reviewed Stats of max level,
Lv100/100, Boost52/52, and no medals. Support effects are explicitly
`not-verified`. These observations are not silently converted to Base Stats
or fed into the medal calculator. Builder integration needs separate
verification of the calculation basis and support effects.

Name matching requires the combined version title and personal name to match
a canonical name exactly after punctuation normalization. Fuzzy scores only
produce suggestions. Missing/ambiguous numeric OCR and uncertain IDs stay
pending. Even exact OCR requires human approval; no numerical checksum is
inferred from total power. Edits reset the row approval and overwrite consent.
Existing differing non-null fields require a second explicit overwrite
checkbox after the diff is reviewed. Null cannot clear existing values.

The entire selected batch validates before one atomic catalog replacement.
An exclusive lock prevents concurrent importer writers; a SHA-256 revision
rejects previews made against stale catalog data. Previous values remain in
review history. Repeated character IDs within an approval batch stop the save.
No other character data, Base Stats, medals or images are overwritten.

## Verification

```sh
npm run characters:stats-test
npm run characters:stats-evaluate # replay stored OCR text, no images required
# Optional re-OCR with temporary local files:
OPBR_STATS_OCR=tesseract npm run characters:stats-evaluate -- --input-dir /path/to/local/screenshots
npm run characters:stats-validate
npm run characters:test-level-100-stats
npm run medals:test
npm test
npm run lint
npx tsc --noEmit --incremental false
```

Original screenshots and UI screenshots containing them are never checked in.
`fixtures/expected.json` retains the user-supplied truth, and
`fixtures/ocr-results.json` retains previously measured OCR text, image hashes,
crop coordinates and comparisons, with no pixels or encoded images.
Ordinary tests need neither original images nor an OCR engine: they replay the
captured OCR text, verify expected values, simulate explicit identity review
in a temporary catalog, and use a synthetic 1×1 PNG for the HTTP transport test.

`characters:stats-evaluate` replays the structured evidence by default.
With `--input-dir`, it re-runs OCR on privately held files matching the fixture
filenames. Missing files produce a clear error before any results are replaced.
It writes only structured OCR results. Both modes exit 1 if any strict exact
comparison fails; an uncertain ID is never filled with the expected answer.
The current 3/5 manual identity selections are an accepted v0.1 limit.
Original files remain under the operator's control. Crops and review copies
are temporary and deleted on normal session exit; no image enters the saved
catalog. No account authentication is needed for this local maintainer tool;
the existing local Origin/Host checks simply guard accidental cross-site writes.
See [QA report](QA.md).
