# Four-medal screenshot import

Adds St. Topman Warcury, St. Shepherd Ju Peter, Kizaru (Egghead), and Luffy (Dawn Rocket) to Medal Builder and Medal Finder. The catalog increases from 700 to 704 without modifying or reordering the earlier entries. The existing Recently Added function automatically exposes the four new medals first.

The product change contains seven files: the medal catalog, both generated Unique Trait indexes, and four 200×200 WebP images. No importer implementation, approval catalog, application logic, or dependency changes are included.

## Source and capture handling

The user supplied IMG_5571.PNG through IMG_5585.PNG. [sources.json](sources.json) records original-file SHA-256 values; [expected-medals.json](expected-medals.json) contains the independently transcribed screenshot fields. The original images were not modified. All four imported records were compared exactly against this transcription, and the crops were visually inspected in [evidence/medal-crops.webp](evidence/medal-crops.webp).

The 2622×1206 captures differ from the stock 2532×1170 profile. [batch-profile.json](batch-profile.json) records the temporary geometry: a whole-modal primary OCR pass at 1.5× with coordinates rebased to the source, the existing independent tag-region comparison, and a 2.5× Rate field retry. CPU processing avoided stalled GPU requests. The temporary helper/settings were restored after import. No review flags or tag comparisons were bypassed; the original batch validated all four with zero needsReview and zero conflicts. [evidence/import-audit.jsonl](evidence/import-audit.jsonl) preserves successful tag comparisons; its publication event refers to the local atomic catalog write.

Native Rate data follows the existing importer contract: available stat kinds are stored, while values, probabilities, and conditions are discarded. The captures expose three kinds per medal and pass the existing common-three-kind rule; they do not show the list end. No unseen kinds were inferred.

## Verification on latest main

The PR branch starts at `00cca921c5a9ae6e2d08afe76847f75d820f4d62`. The verified product commit is recorded in [verification.json](verification.json); [evidence/final-reconciliation.json](evidence/final-reconciliation.json) ties the exact committed files to the checked SHA-256 values and proves that all 700 earlier entries are unchanged.

Passed: batch reconciliation, production validation including all 704 WebPs, 94 importer tests, 23 core tests, three Medal Information tests, TypeScript, scoped ESLint, and the full production build. Recently Added was also checked for the four new IDs. A clean `npm ci` was used. Log paths and trailing whitespace are normalized for portability.

Two existing suites remain red: Unique Trait tests have 17 passing and two failing tests; Finder tests have 18 passing and two failing tests. Both suites reproduce the same failures on the unchanged latest-main baseline. The former still hard-codes an old 666-medal snapshot and has an unresolved `the-strongest-man-in-the-world` assertion. The latter has an extensionless-import failure with the documented direct Node command and an outdated sort fixture. Baseline and changed logs are included under `evidence/`; these unrelated tests were left unchanged. Overall verification is recorded as failed and the PR is a draft.

## News Shadow

The private JSON and Markdown output for latest main → the product commit were inspected. Read-only Shadow detected the four committed medals, with no failures. [evidence/news-shadow-summary.json](evidence/news-shadow-summary.json) records the range and outcome. All Production receipts are missing; `published=false`, `publicationReady=false`, and publication actions are empty. No news content or production publication was performed.
