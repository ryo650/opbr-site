# 270 Million Downloads Celebration EX Festival #2 — registration notes
Source: user-provided game screenshots IMG_5418–IMG_5423, 2026-10-15.

## Game-visible Step 1 rates
- ★4 7%, ★3 35%, ★2 58%.
- Navy HQ / Fleet Admiral Akainu [Sakazuki]: 0.2000000%.
- The nine other listed 4★ featured characters: 0.7555555% each.
- Display precision: 0.2 + (9 × 0.7555555) = 6.9999995%. Store the official 4★ category total (7%) as the pickup category weight.
- No unlisted 4★ category has been added; the visible list spans the ★4 section until ★3 begins.
- ★3/★2 draws use the simulator's general catalog pools, not an exhaustively verified per-character pool.

## Visible step schedule
- Five steps, each 11 draws for 30 RD; can be repeated 8 times.
- Red gift-box counts by step: 2, 3, 4, 6, 10, with a 20,000 bounty-coins icon on each step.
- Steps 2–5 and any guarantees have **not** had separate rate windows verified.
- Implementation: normal-draw approximation based on the game's **Step 1** table, with a 30-RD eleven-draw button. The simulator does **not** advance steps or grant rewards.
- The single-draw 5-RD button is inherited simulator compatibility UI, **not** a confirmed offer for this banner.
- Game banner ends 2026-10-27 13:59 JST. The screenshot's 2026-10-30 13:59 is the separate Scout Points exchange deadline.
- Start date was not visible; 2026-10-15 00:00 JST is provisionally set to the first observed date, **not** the official start.

## Artwork and follow-up
- A small locally defined illustrative SVG is included as the website banner because the screenshot's original raster asset cannot be uploaded through the current repository editing flow. It is not official game art. Replace with an actual cropped WebP of IMG_5418 when image upload is available.
- To simulate true steps later, introduce step state, distinct cost/reward tables, and verified step-specific pool/guarantee rules without changing the original Step 1 data.
