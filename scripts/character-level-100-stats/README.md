# Character Lv.100 Stats screenshot prototype

This importer reads only five relative regions from the verified Max Level
Preview layout: Character identity, Level, HP, ATK, and DEF. It reuses the
Medal Importer's macOS Vision helper and does not OCR the full screenshot.

```sh
npm run characters:import-level-100-stats-screenshot -- /path/to/IMG_4816.PNG
```

The command is dry-run only. It prints the extracted values and writes the
ignored `draft-screenshot.json` review artifact. It never edits
`src/data/characters/level-100-stats.ts`.

`sourceType: "screenshot"` keeps the review Draft distinct from the existing
manual-entry workflow. Future screen layouts should add a new template rather
than changing the verified `max-level-preview-v1` coordinates.
