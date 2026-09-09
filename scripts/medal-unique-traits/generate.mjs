import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { medals } from "../../src/data/medals/medals.ts";
import {
  renderUniqueTraitCategoryData,
  summarizeUniqueTraitCategories,
} from "./classify-unique-traits.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "../..");
const outputPath = path.join(
  projectDir,
  "src/data/medals/unique-trait-categories.generated.ts",
);

await writeFile(outputPath, renderUniqueTraitCategoryData(medals), "utf8");
console.log(
  JSON.stringify(
    {
      medals: medals.length,
      ...summarizeUniqueTraitCategories(medals),
      output: path.relative(projectDir, outputPath),
    },
    null,
    2,
  ),
);
