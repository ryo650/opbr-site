import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateImporterBatch } from "./batch-validation.mjs";
import { parseGeneratedMedals } from "./incremental.mjs";

const importerDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(importerDir, "../..");
const production = parseGeneratedMedals(
  readFileSync(path.join(projectDir, "src/data/medals/medals.ts"), "utf8"),
);
const draft = JSON.parse(
  readFileSync(path.join(importerDir, "draft-medals.json"), "utf8"),
);

console.log(JSON.stringify(validateImporterBatch(production, draft), null, 2));
