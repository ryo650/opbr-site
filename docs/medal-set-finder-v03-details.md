# Medal Set Finder v0.3 — Shared Medal Details

## Intent

Inspect a medal's attributes without losing the progressive 1 → 2 → 3
combination-search context. Selecting a medal remains one action; opening
its details is a separate action.

## Implementation

- **Shared information:** `src/components/medals/MedalInformation.tsx` is
  the single read-only UI for Unique Trait, Tags, Native Traits,
  Extra Trait Effects and Status Reductions.
- **Builder:** the existing Medal Builder detail overlay retains its
  slot replacement and Extra Traits editing. Only its read-only information
  section is replaced with the shared component; data and editing behavior
  remain unchanged.
- **Finder:** a new dedicated responsive details dialog uses the same
  shared information content. Desktop opens a centered dialog, narrow
  screens open a scrollable bottom sheet.
- **Three access points:** info buttons on every candidate,
  on each occupied slot, and on every Recently Added Medal card.
  Buttons are siblings (not nested) of the select/find buttons.
- **Actions:** unselected candidate → Add to the next open slot;
  recent-medal shortcut → Add to Slot 1 and start matching;
  already selected → status + Close (no duplicate). Close, backdrop,
  and Escape dismiss. Tab keyboard navigation stays in the dialog,
  focus initially moves to Close, then returns to the prior trigger
  where it still exists.
- **Search preservation:** merely opening/closing never resets chosen
  medals, query, catalog filters, tag/trait criteria or sort. Existing
  add-to-slot paths still clear the search text when a medal is chosen.
- **No duplicate IDs:** Finder's existing slot guard remains the sole
  add-selection path for both card and dialog actions.

## Stacked change / integration

Based on `feat/medal-finder-latest-v02` (Draft PR #100), which contains
the new Recently Added quick-start. Do **not** merge to main until that
dependency is integrated and this change has been rebased/retargeted or
independently verified against the current main.

## Verification checklist

```sh
npx tsc --noEmit
npm run lint
npm run build
node --require ./tests/register.cjs --test tests/medal-information.test.cjs
node --experimental-strip-types --test scripts/medal-set-finder/finder.test.mjs
node --experimental-strip-types --test scripts/medal-set-finder/finder-catalog-filters.test.mjs
node --experimental-strip-types --test scripts/medal-set-finder/recently-added.test.mjs
```

Manual browser checks in both desktop and 320/390px:
1. Candidate medal: tap card → adds; tap ⓘ → opens without adding.
2. Finder modal: all five fact sections present; long text scrolls.
3. Modal Add → correct next slot, retains other medals and matching criteria.
4. Occupied slot ⓘ → details show **Already in your set**; × still removes.
5. Latest card tap → existing quick-start; ⓘ → details and Add to Slot 1.
6. Close button, backdrop, Escape; keyboard Tab cycling / focus restoration.
7. Search and catalog filters unchanged after a close.
8. Complete 3 medals and check existing Builder link.
9. Builder own medal details still supports equip/remove/Extra Traits editing.

No production data, metadata, backend, ranking, or routes changed. No
merge or manual production deploy under this task.
