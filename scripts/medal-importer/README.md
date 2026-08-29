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

If dry-run reports an unknown Status Effect:

1. Inspect the reported source Rate screenshot in the game capture.
2. Approve the exact display name with
   `npm run medals:approve-status -- "Status Name"`.
3. Run `npm run medals:import -- --dry-run` again.
4. Import only after `needsReview` reaches zero.
5. Run `npm run medals:import` and then `npm run medals:validate`.

Use `--name` and `--id` when the generated slug is not the desired stable ID:

```sh
npm run medals:approve-status -- --name "Some Status" --id some-status
```

The approval command is intentionally non-interactive: explicitly running it is
the human approval. It validates the display name and ID, rejects conflicting
names or IDs, appends the catalog entry, and regenerates the TypeScript type.

If dry-run reports an unknown Native Effect, inspect the exact Extra Trait on
the source Rate screenshot, then approve its stable display name in the same
way:

```sh
npm run medals:approve-native-effect -- "Dodge cooldown reduction speed"
npm run medals:import -- --dry-run
```

An explicit ID is also supported:

```sh
npm run medals:approve-native-effect -- --name "Some Effect" --id some-effect
```

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

When every file has a unique `IMG_XXXX.PNG` / `IMG_XXXX.JPG` sequence key,
that filename sequence is authoritative. Numeric continuation suffixes are
supported and sorted as `(sequence number, suffix number)`, with an unsuffixed
file treated as suffix zero. For example, the order is
`IMG_4000.PNG`, `IMG_4000_2.PNG`, `IMG_4000_3.PNG`, `IMG_4001.PNG`—never a
plain lexical sort. For a long Unique Trait, use the base Details screenshot's
number and append `_2`, `_3`, and so on to continuation captures. EXIF
`DateTimeOriginal` remains
supplementary: an adjacent reversal is reported as a warning but does not
reorder an otherwise consistent filename batch. If filename sequences are
unavailable or ambiguous, the importer uses EXIF only when every screenshot has
a unique capture timestamp. If neither source determines a safe order, the
import stops instead of guessing.

Apple Vision OCR classifies each screen only from the modal-title region
(`x=0.35...0.65`, `y>=0.85` in normalized Vision coordinates). Background
controls and Details-body Tag / Rate buttons are excluded. A Medal Details screen
begins a group; every following Tag or Rate screen belongs to that group until
the next Medal Details screen. A second Medal Details screen may remain in the
same group only as a validated Unique Trait continuation: its medal name must
match exactly after safe normalization, it must appear before Rate begins, its
fixed scrollbar must be lower than the preceding Details page, its field OCR
must have a sufficiently long exact overlap with the preceding page, and the
last continuation must reach the scrollbar bottom. This also safely permits a
continuation after Tag. A different medal name still starts a new group, and a
same-name page that fails continuation validation becomes `needsReview` rather
than being joined by guesswork. Missing or conflicting titles and body
signatures stop the import instead of falling back to a guess.

A group may contain one or more consecutive Tag screens before its Rate screens.
Tags are extracted page by page, merged in page order, and deduplicated by Tag ID
while keeping the first occurrence. A Tag screen after Rate has started is a
fatal structure error. Different screenshots with identical extracted Tag
content and no new Tag produce a `needsReview` issue as a possible accidental
duplicate; pixel-identical screenshots are still removed by the earlier pixel
deduplication step.

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

Other approved Extra Traits are stored separately as `nativeEffects`, without
their conditions or values. For example, both conditional and unconditional
forms of “Boost the cooldown reduction speed of Skill 2 by 1%” become
`skill2-cooldown-reduction-speed`. Duplicate values or conditions do not create
duplicate IDs. `native-effects.json` is the single source of truth for these
effect display names and stable production IDs. The initial approved catalog is:

- `skill1-cooldown-reduction-speed` — Skill 1 cooldown reduction speed
- `skill2-cooldown-reduction-speed` — Skill 2 cooldown reduction speed

Unknown effect-like Rate text is not discarded or fuzzily mapped. It marks the
medal as `needsReview` and records the medal name, OCR original, Rate screenshot,
display-name candidate, and suggested ID. After human confirmation,
`medals:approve-native-effect` appends the catalog and regenerates
`src/data/medals/native-effects.generated.ts`; `types.ts` never needs a manual
union edit. `npm run medals:generate-native-effect-types` explicitly regenerates
the derived file.

`status-effects.json` is the single source of truth for approved display names
and stable production IDs. The importer compares normalized display names from
OCR with that catalog using case-, quote-, and whitespace-insensitive exact
matching. It does not use fuzzy matching.

`src/data/medals/status-effects.generated.ts` is derived from the catalog and
provides `StatusEffectType` to production TypeScript. The approval command keeps
it synchronized, so adding a Status Effect never requires editing `types.ts`.
`npm run medals:generate-status-types` can explicitly regenerate the derived
file, and `npm run medals:validate` rejects an out-of-sync generated type.

The importer re-extracts these types from every Rate screenshot. An unknown
effect sentence or status-effect name marks only that medal as `needsReview`
with its medal name, display-name candidate, original OCR text, source Rate
screenshot, and a suggested ID. The suggestion is diagnostic only and is never
added automatically.

Rate coverage is not rejected merely because fewer than three distinct Trait
kinds exist. For a one- or two-kind result, the importer inspects the fixed Rate
scrollbar region and accepts it only when the list fits without a scrollbar or
the final screenshot has reached the scrollbar bottom. Every visible Trait must
also parse successfully. A scrollable partial one/two-kind capture remains
`needsReview`. Existing three-kind captures retain their established validation
behavior, while the terminal diagnostics are recorded in the Draft for future
capture auditing.

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

`npm run medals:validate` also validates that both catalog files have unique IDs
and normalized names, IDs use lowercase kebab-case, both generated TypeScript
types match their catalogs, and every production `statusReductions` and
`nativeEffects` ID exists in its catalog. Duplicate `nativeEffects` on one medal
are rejected.

If an existing production WebP is missing, the importer stops unless the same
medal is present as an identical validated duplicate in the current batch. In
that case only the missing image can be safely regenerated from that Details
screenshot. A WebP already occupying a new ID is never overwritten.
