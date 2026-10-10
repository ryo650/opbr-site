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

- New importer: 27/27 pass with no original screenshots, including captured OCR text replay,
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
rechecked on a Mac where the existing helper is working. Support-effect correction remains explicitly unverified; Boost Max subtraction
now uses the existing verified profile and conversion helper. No merge, automatic Base Stats approval or public/admin web endpoint is added.
Base Stats conversion is available only through explicit local approval.
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

## Approved Base Stats conversion extension

The server reuses `boost-profiles.ts` and `deriveBaseStatsFromDisplayedStats()`
with canonical role + `boost-max`: HP −2580, ATK −640, DEF −640. It recomputes
from corrected display values on preview and save; client-supplied base numbers
are ignored. The page displays maximum, deduction, derived base, existing base
and final base together.

| Character | Base HP | Base ATK | Base DEF | Existing comparison |
|---|---:|---:|---:|---|
| Koby | 6589 | 1758 | 1519 | new record |
| Wapol | 7401 | 1151 | 1886 | new record |
| Rob Lucci | 7486 | 1131 | 1922 | new record |
| Monkey D. Garp | 6886 | 1871 | 1423 | exact existing match, 3/3 |
| Silvers Rayleigh | 7146 | 1299 | 1821 | new record |

All 15 derived values match independently recorded fixture expectations.
The five-row temporary save preserves every existing record, adds four new
records and leaves Garp unchanged. No fixture records are promoted into the
tracked catalog automatically; the real Base Stats source is unchanged.

Twelve added tests cover five OCR conversions, existing Garp equality, unknown
IDs/roles/conditions and nonpositive values, mandatory conversion/diff approval
(including equal existing data), separate Base Stats overwrite consent, ignoring
client-provided base numbers, partial preservation, source/comment/export
preservation, pre-save backup, equal-value no-op, invalid-batch rollback, stale
revision/lock handling, unsupported source schema and both HTTP save orders.
All 159 tests pass (Importer 27, medals 94, previous Base Stats 20, core 18),
as do full lint, TypeScript and both catalog validators.

Browser QA replayed all five captured OCR texts with synthetic 1×1 PNGs and a
copy of the actual TypeScript catalog. It verified manual IDs for the three
uncertain names, all five conversion tables, rejected an unapproved save,
showed Garp HP 6886 → 6887 when maximum HP was edited to 9467 and rejected that
change without Base Stats overwrite consent. Restoring 9466 reset approvals.
One individually approved row then four reapproved selected rows saved correctly:
5/5 exact values, while the display catalog remained untouched. No browser errors
were logged. The local screenshot contains only synthetic pixels, and is not
committed. A temporary disk-space error left the existing file intact; retry
after space became available succeeded.

Base saves use a source revision, exclusive lock, full selected-batch validation,
validated temporary source, pre-save backup and atomic replacement. They preserve
unrelated TypeScript bytes and null fields. Maximum and Base Stats saves are
separate transactions and approval is reset on reload/edit. Close unrelated
editors that ignore the lock during saving, as with the existing display store.
