# Medal Set Finder v0.1 — implementation handoff

## Scope

- New **Set Finder** tab on the existing `/medal-sets` page. Existing Featured Sets remain the default view and keep their category filters.
- Select an initial medal, then select a second from medals that have **at least one valid third-medal completion**. The third list is recomputed immediately from both fixed medals.
- A candidate list contains **individual next medals**, not all generated three-medal set combinations.
- Search the candidate list by medal name or tag. Lists are paginated in groups of 36 to avoid loading hundreds of medal artworks simultaneously.
- Sort candidates using the same five options as Medal Builder: **Default (catalog order)**, **Name A–Z**, **Name Z–A**, **Category**, and **Best Tag Match**. Best Tag Match becomes available after the first selection and orders by pair/trio common tag count. Sorting does not change which medals qualify; switching sort returns pagination to the first 36 items.
- Filter by minimum three-way tag overlap (2–6), by Tag (4+), Trait (2+ tags and shared trait purpose), Hybrid (4+ tags and shared purpose), and by a specific shared purpose.
- No recommendation score or subjective ranking. The candidate list is sorted by objective shared-tag count, then name.
- When complete, display the shared 3-medal tags, exactly-two tags count, shared trait purposes, and active tag effects. Send the exact 3 medal IDs to the already-supported `/medal-builder?medals=` URL to inspect caps and additional traits.
- Use the × control on a filled slot to remove **only that medal**. Remaining selections keep their relative order and shift left so the next candidate list can update. **Reset set** still clears all three slots.

## Data + correctness

- Uses the current medal catalog and `uniqueTraitCategoryIdsByMedalId`; no saved 85,039-row candidate snapshot or background job is required.
- Pair- and trio- tag overlap are not confused: final filters always use **tags common to all 3**.
- Each selected medal ID is unique.
- A trait purpose means matching classifications on at least two distinct medals; activation conditions are intentionally not assessed.
- Generic `cooldown` is suppressed on medals with a Skill 1 or Skill 2 specific category, preventing two different skills from matching only through the broad cooldown category. Needs in-game review for ambiguous generic trait classifications.
- No effect caps are calculated by the Finder. The existing Builder remains the authority for known effective cap calculation; no speculative caps are introduced.
- Slot 2 lookahead checks possible slot 3 completions so selected filters cannot lead to a dead end at that step.

## Local verification

```sh
node --experimental-strip-types --test scripts/medal-set-finder/finder.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Also validate in iPhone / desktop Preview: per-slot × removes only the targeted medal (first/middle/last); other selections remain; Reset set clears all; candidate lists refresh; all five sort modes (including disabled Best Tag Match before slot 1), sort switching while a search is active, pagination reset, filter changes, empty results, and transfer to Builder.

## Limitations / next phase

- This initial version calculates available continuations client-side (up to O(N²) for the second slot) rather than pre-generating all possible trios. Check perceived latency on an actual iPhone before release; memoization/indexing can be optimized later.
- Completeness depends on the existing unique-trait category mapping, which may require review for generic/ambiguous effects.
- Result labels are factual compatibility filters, not claims that a set is optimal.
- No persistence, account actions, community scoring, publishing, or production data mutation.
