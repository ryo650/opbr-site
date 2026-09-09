# Character Lv.100 Stats screenshot prototype

This importer reads only five relative regions from the verified Max Level
Preview layout: Character identity, Level, HP, ATK, and DEF. It reuses the
Medal Importer's macOS Vision helper and does not OCR the full screenshot.

```sh
npm run characters:import-level-100-stats-screenshot -- /path/to/IMG_4816.PNG
```

The command is dry-run only. It prints the extracted values and writes the
ignored `draft-screenshot.json` review artifact. It never edits
`src/data/characters/level-100-base-stats.ts`.

`sourceType: "screenshot"` keeps the review Draft distinct from the existing
manual-entry workflow. The verified `max-level-preview-v1` template explicitly
marks its source as an unowned Boost Max preview, so the Draft also contains a
Base Stats candidate derived with the matched Character's canonical Role and
its Boost Max profile. Boost Max currently has the same values for all three
Roles. No other screen template may use that subtraction without its own
verified source context.

The reviewed IMG_4816 fixture is the initial production Base Stats entry. New
Draft candidates still require review and manual catalog entry; the importer
does not merge them automatically.

Future screen layouts should add a new template rather than changing these
verified coordinates. Owned-character Base Stats can continue to use the
manual-entry workflow without applying any Boost subtraction.
