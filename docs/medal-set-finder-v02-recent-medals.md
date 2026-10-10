# Medal Set Finder v0.2 — Recently Added quick start

## Scope

- Keep v0.1 Featured Sets, Finder logic, filters, sorting, slot removal, and Builder handoff unchanged.
- On Finder's **empty first-slot** state, show a "Recently Added Medals" quick-start panel above the full medal browser.
- Show up to 10 medals, newest **site additions** first, with medal artwork and name.
- Clicking a card uses the exact same `chooseMedal(id)` flow as selecting the first catalog medal: fill slot 1, show valid slot-2 candidates, then progressively select slot 3. The panel disappears while one or more slots are filled, and returns on Reset or removing the only selected medal.
- First-slot name/tag search and the Builder-style candidate filters also apply to these 10 quick-start entries, keeping the shortcuts consistent with the main candidate list.
- Use a horizontally swipeable one-row panel on narrow/mobile displays to prevent 10 cards from pushing the searchable catalog far down the page.

## Ordering and data integrity

The existing incremental Medal Importer preserves old production order and **appends new medal IDs** to the `medals.ts` array (see `scripts/medal-importer/README.md`). The pure `getRecentlyAddedMedals` selector reverses the last 10 medals of this catalog and requires **no manual featured-list edits or hand-entered dates**. When a new medal is imported, it will appear first in this panel on the next deployment containing the updated catalog.

This is **not game release chronology**. Historical backfills can also appear, because neither `Medal` nor the production catalog stores a verified `releasedAt` or `addedAt` property. The UI says "Newly added to OPBR Guide, not necessarily newly released in-game." Do not claim that these are the game's latest releases, or invent timestamps. When verified release-date metadata becomes available, replace the ordering source deliberately rather than silently treating import order as release date.

## Verification

```sh
node --experimental-strip-types --test scripts/medal-set-finder/recent-medals.test.mjs
node --experimental-strip-types --test scripts/medal-set-finder/finder.test.mjs scripts/medal-set-finder/finder-catalog-filters.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Manual desktop / iPhone preview checks:
1. Finder first-slot state shows 10 most recently appended catalog medals in newest-first order; Featured Sets is unchanged.
2. Tap a recent medal: Slot 1 fills, the panel disappears, and Slot 2 offers compatible medals.
3. Complete the third slot; the tag/trait summary and Builder link still work.
4. Remove the only selected medal or Reset: recent cards return. Remove middle/third slots: other selections remain.
5. Apply first-slot search or Category / Tag / Unique Trait filters: both quick-start cards and catalog use the same candidate-level filters; "No results" behavior remains coherent.
6. On mobile, recent cards swipe horizontally rather than creating a lengthy stack.

No merge, production deployment, manual medals DB edits, release-date claims, community scoring, or recommendation ranking as part of this task.
