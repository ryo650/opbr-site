# Medal importer

This is a deliberately small, review-first importer for the Medal Sets / Medal
Builder data. It turns one ordered screenshot batch into checked TypeScript data
and fixed-coordinate WebP crops.

## Requirements

- macOS (the OCR helper uses Apple Vision through Swift)
- ImageMagick 7, available as `magick`
- Node.js 20 or newer

## Workflow

1. Add untouched screenshots to `input/`.
2. Keep known regression fixtures in `reviewed-medals.json`; new medal groups do
   not need to be added there before scanning.
3. Run `npm run medals:import -- --dry-run` to inspect ordering, screen
   classification, grouping, dimensions, OCR, category-color checks, and
   `draft-medals.json` validation results.
4. Run `npm run medals:import`.
5. Review the generated `src/data/medals/medals.ts` and
   `public/medals/*.webp`.

The importer never edits files in `input/`. Ordering, screen classification,
grouping, screenshot dimensions, and regression-fixture failures stop the whole
run. New-medal content problems are attached only to that medal as `needsReview`.

Pixel-identical screenshots are detected with ImageMagick's decoded-pixel
signature and the later copy is skipped after ordering is resolved and before
grouping. Duplicate
medal IDs are compared without their source filenames: matching content is
generated once, while any differing field stops the import and reports both
Details screenshots. A newly captured duplicate medal still needs a reviewed
manifest entry so its ID and content can be verified rather than inferred.

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
Structured medal fields for existing fixtures are checked against
`reviewed-medals.json`. New groups are structured directly from OCR. A new medal
is eligible for import only when every required field, known Trait, category
check, crop check, and ID check passes.

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

A real import includes regression fixtures and new medals with
`validationPassed: true`. A medal with an unknown Trait, unknown status effect,
unparsed OCR, ambiguous category, incomplete Rate coverage, or ID conflict is
excluded individually. Global ordering, classification, grouping, or fixture
regression failures still stop the entire import.
