# Character Stats Importer v0.1 QA — 2026-10-09 JST

Base: GitHub main `877218221b5fe72baa5686598057dec2af83b9a3`.
Work isolated in a separate checkout on `feat/character-stats-importer-v01`;
the original `data/law-birthday-270m-scouts` checkout was not edited.

## Real image evaluation

Original five uploads were recovered from the referenced conversation and
used locally for the original OCR measurement. Only structured OCR results and
source SHA-256 remain; all five original fixture PNGs and the UI screenshot
containing their thumbnails were removed from this branch and its outgoing history.
Image dimensions: all 2048×946. Expected values were taken from the user request.

| Image | Canonical character | HP | ATK | DEF | CRIT | Power | Automatic ID |
|---|---|---:|---:|---:|---:|---:|---|
| IMG_5229.PNG | navy-hq-captain-koby | 9169 | 2398 | 2159 | 11 | 11446 | exact match |
| IMG_5230.PNG | evil-black-drum-kingdom-king-wapol | 9981 | 1791 | 2526 | 11 | 11409 | pending manual selection |
| IMG_5231.PNG | unexpected-collaboration-rob-lucci | 10066 | 1771 | 2562 | 11 | 11446 | pending manual selection |
| IMG_5232.PNG | legendary-hero-monkey-d-garp | 9466 | 2511 | 2063 | 11 | 11537 | pending manual selection |
| IMG_5233.PNG | ex-roger-pirates-first-mate-silvers-rayleigh | 9726 | 1939 | 2461 | 11 | 11428 | exact match |

All 25 numeric fields exactly match. All five screen labels, both level
values and both Boost values match. Medal absence is checked visually by the
reviewer; the parser leaves it unknown, never defaulting to unequipped.

This host's unchanged Medal Importer Vision helper failed with
`Foundation._GenericObjCError error 0` on the full original screenshot as well
as the crops, including an independent CPU-only diagnostic copy. The new
Tesseract.js fallback produced the results above. The Medal helper is unchanged.

Names over character artwork remain imperfect: Wapol's Kingdom/extra `L`,
Lucci's Collaboration/Lucci, and Garp's title suffix require manual selection.
All three correct IDs are in the suggestions. No wrong ID was auto-selected.
The strict raw evaluation therefore exits 1 (52/55 exact comparisons); this
is deliberately reported rather than filled with expected IDs. The separate
review/save replay explicitly selects these IDs and confirms medals absent:
5/5 saved records match expected IDs and all values. OCR name accuracy still
needs more screenshots/layouts; do not remove human approval.

## Automated checks

- New importer: 15/15 pass with no original screenshots, including captured OCR text replay,
  uncertainty, malformed values, unknown IDs, partial records, selected-only
  save, overwrite consent/history, invalid batch rollback, stale revision,
  duplicate IDs, exclusive lock, loopback-only HTTP upload/correction/save, batch preload
  and temporary-image cleanup.
- Existing Medal Importer: 94/94 pass.
- Existing Lv.100 Base Stats/prototype: 20/20 pass.
- Core application: 18/18 pass.
- Full repository lint: pass, no warnings/errors.
- TypeScript (`tsc --noEmit --incremental false`): pass.
- Empty new observation catalog validates; existing Base Stats and medals
  match the base commit. No fixture has been automatically approved into
  the tracked catalog.

Detailed test outputs are in `qa/`. Real OCR results are in
`fixtures/ocr-results.json`. Browser verification uses only a temporary
catalog; no actual site records are approved by the test. The actual page was
checked with all five original images: an unapproved save was rejected, one
approved row was saved while four remained pending, then three canonical IDs
were corrected and the remaining four individually approved rows were saved
together. The resulting temporary file was checked against all five expected
IDs, values and conditions (5/5 exact). The UI screenshot was removed because
it contained original-image thumbnails.

## Limits and remaining checks

Only this screenshot layout/conditions are supported. Names need manual
correction for 3/5 initial examples with the fallback. Vision should be
rechecked on a Mac where the existing helper is working. Support effects and
calculation-basis integration remain explicitly unverified. No deployment,
merge, automatic Base Stats conversion or public/admin web endpoint is added.
Unsaved drafts do not persist across server restart. Atomic importer locks
cannot prevent an unrelated editor that ignores the lock from racing the
final revision check; close other editors during review/save.

## Publication and local-only checks

The five PNGs and the UI screenshot containing their thumbnails were removed
before rewriting the unpushed implementation commit. The outgoing tree and
complete branch history are scanned for their paths and blob IDs before push.
Only JSON evidence, expected values, text logs and source code remain.
Tests run successfully after all original images have been removed.

The review server binds only to `127.0.0.1`, has no Next.js route, and has no
imports from the public site's source or assets. It is launched only by
`characters:stats-review`, never by `dev`, `build`, or `start`. Temporary
review copies are removed when the session closes. No account authentication
was added, and the existing Medal Importer is unchanged. Preview URL checks
and GitHub CI results are reported on the Draft PR after publication.
