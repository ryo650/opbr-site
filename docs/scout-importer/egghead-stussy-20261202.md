# Egghead Stussy — normal Scout Importer replay (2026-11-19)

This entry intentionally uses the **existing standard Scout simulator**, not its Step-Up engine.

## Evidence

- Game screenshots supplied by the user: IMG_6011–IMG_6020, especially IMG_6014 (end date), IMG_6015 (rarity summary) and IMG_6016–6020 (featured rates).
- Bandai Namco official [Step 1 rate table](https://pifpt.bandainamcoent.co.jp/462ww/7fbe710b-8824-48b0-98d3-e395c5b46274.html) (Korean locale), including 11 featured units and the regular 4★ unit rate.
- Normal slots: ★4 5%, ★3 35%, ★2 60%; Egghead Stussy 1%, ten other featured 0.2% each. The remaining 105 official ★4 characters are displayed at 0.0190476% each (truncated).
- Four of those 105 characters have `grade="bf"` in the existing master: Ideo, First Act as a Married Couple Pudding, Blackbeard Helmsman Burgess and Fire Fist Ace. Thus the **importer BF-count override is 4**, rather than auto-counting all currently registered BF units.
- V1 importer fixed-decimal calculation: BF `round(4 × 0.0190476, 2) = 0.08%`; regular ★4 remainder `5 - 3 - 0.08 = 1.92%`. The 3% total featured rate and 5/35/60 rarity totals remain unchanged. Individual featured values remain 1.0/0.2 exactly.
- Source opening: 2026-11-18 14:00 JST; closing: 2026-12-02 13:59 JST.
- Multi is a **standard 11 pulls / 50 rainbow diamonds** rather than the game banner's discounted Step-Up schedule.

## Importer execution / limitations

The regular `scripts/scout-importer/import.mjs` CLI uses Apple Vision OCR and therefore runs only on macOS. This change uses a **reviewed-transcription replay** implemented in `scripts/scout-importer/reviewed-stussy.mjs`, which imports the unmodified V1 functions `calculateScoutRates`, `calculateFinalScoutRates`, `validateScoutDraft`, `renderScoutModule` and `addScoutToIndex`. Run `npm run scouts:verify-stussy` to validate the result against the committed output. **It is not claimed that Apple Vision processed these screenshots here.**

The V1 normal simulator represents non-featured ★4 / BF pools as aggregate categories; it does not reconstruct the precise 105-unit eligibility list or individual repeating-decimal rates. Its random non-featured candidates may therefore differ from the full game pool. This limit is disclosed here rather than presenting the simulator as an exact official Step-Up reproduction.

Only one user-provided banner image and Stussy portrait are reused from the previous PR; the unverified Koala placeholder and all Step-Up engine/UI/fixtures are removed. No permanent Step-Up changes or free/guaranteed Step mechanics are included.
