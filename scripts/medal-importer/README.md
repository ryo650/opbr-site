# Medal importer

This is a deliberately small incremental importer for the Medal Sets / Medal
Builder data. It validates one new screenshot batch, merges only new medal IDs
into production, and creates fixed-coordinate WebP crops without rebuilding or
reordering existing production data.

## Requirements

- macOS (the OCR helper uses Apple Vision through Swift)
- ImageMagick 7, available as `magick`
- Node.js 20 or newer

## Workflow

1. After a successful import, empty the ignored `input/` directory.
2. Add untouched screenshots for only the next new batch.
3. Run `npm run medals:import -- --dry-run` to inspect ordering, screen
   classification, grouping, dimensions, OCR, category-color checks, and
   `draft-medals.json` validation results.
4. Run `npm run medals:import`.
5. Run `npm run medals:validate` to verify the merge and every production WebP.
6. Empty `input/` only after the import and validation succeed.

The importer never edits files in `input/`. Ordering, screen classification,
grouping, screenshot dimensions, and regression-fixture failures stop the whole
run. New-medal content problems are attached only to that medal as `needsReview`.

Pixel-identical screenshots are detected with ImageMagick's decoded-pixel
signature and the later copy is skipped after ordering is resolved and before
grouping. The current production `medals.ts` is the merge baseline. Batch medals
with a new ID are appended, while production order and content are preserved.
A production ID with semantically identical content is skipped even if tag or
Trait arrays use a different order. A production ID with differing content is a
blocking conflict that reports both values, differing fields, and batch source
screenshots. It is never overwritten.

Normal imports do not require old OCR fixture screenshots in `input/`.
`reviewed-medals.json` remains the expected fixture data, and
`npm run medals:regression` is the explicit OCR regression mode. That command
requires the fixture screenshots and never writes production.

## Ordering and grouping

When every file has a unique `IMG_XXXX.PNG` / `IMG_XXXX.JPG` sequence number,
that filename sequence is authoritative. EXIF `DateTimeOriginal` remains
supplementary: an adjacent reversal is reported as a warning but does not
reorder an otherwise consistent filename batch. If filename sequences are
unavailable or ambiguous, the importer uses EXIF only when every screenshot has
a unique capture timestamp. If neither source determines a safe order, the
import stops instead of guessing.

Apple Vision OCR classifies each screen only from the modal-title region
(`x=0.35...0.65`, `y>=0.85` in normalized Vision coordinates). Background
controls and Details-body Tag / Rate buttons are excluded. A Medal Details screen
begins a group; every following Tag or Rate screen belongs to that group until
the next Medal Details screen. Missing or conflicting titles and body signatures
stop the import instead of falling back to a guess.

## Fixed crop

The verified coordinate box for 2532 x 1170 screenshots is:

```text
x: 800
y: 140
width: 200
height: 200
```

All coordinates are pixels measured from the screenshot's top-left corner. The
box intentionally keeps a small, consistent dark margin around the circular
medal so no edge is clipped.

## Native traits

Rate values and conditions are intentionally discarded. The generated data keeps
only the available native-stat types (`atk`, `def`, `hp`, and `crit`).
Status reductions are stored separately by status-effect ID without their value.
The currently verified IDs are `clawed`, `capture-block`, `aflame`, `tremor`,
`stun`, and `poison`.

The importer re-extracts these types from every Rate screenshot. An unknown
effect sentence or status-effect name marks only that medal as `needsReview`
with its name, original OCR text, and source screenshot. Add a new explicit type
only after a human verifies that failure against the image.

OCR is used after ordering for screen classification and field extraction.
New groups are structured directly from OCR. A new medal is eligible for import
only when every required field, known Trait, category check, crop check, and ID
check passes. Fixture fields are checked against `reviewed-medals.json` only in
the explicit regression mode.

Objective Unique Trait structure errors and unparsed Rate Trait text trigger a
field-level retry. The importer crops the configured field rectangle, enlarges
it, and runs Vision OCR again without rewriting the source screenshot. Both the
initial and retry OCR are retained in the Draft. No medal-specific text
replacement is applied.

## Draft and import gate

Dry-run writes `draft-medals.json` as its only output. It includes structured
fields, source screenshots, raw OCR lines, crop diagnostics, `validationPassed`,
`needsReview`, and explicit issues for every group. This file is diagnostic; new
medals do not need to be copied into `reviewed-medals.json` or manually approved
when validation passes.

A real import appends only batch medals with `validationPassed: true`. A medal
with an unknown Trait, unknown status effect, unparsed OCR, ambiguous category,
or incomplete Rate coverage is excluded individually; other validated new
medals remain eligible. A production ID conflict and global ordering,
classification, grouping, or data-structure failures stop the entire import.

Before publication, the importer stages the merged `medals.ts`, every new or
recoverable missing WebP, and validation results under the ignored `.tmp/`
directory. It validates IDs, counts, the generated TypeScript structure, and
200x200 WebPs first. New images are copied without overwrite and `medals.ts` is
replaced atomically last. If the data commit fails, added images are rolled back.
Existing WebPs are never replaced or deleted.

If an existing production WebP is missing, the importer stops unless the same
medal is present as an identical validated duplicate in the current batch. In
that case only the missing image can be safely regenerated from that Details
screenshot. A WebP already occupying a new ID is never overwritten.
