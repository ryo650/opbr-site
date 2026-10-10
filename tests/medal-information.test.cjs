const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");

// The project's tests/register.cjs handles .ts. Install a local TSX/CSS
// test-only loader to verify that the same presentational component renders
// from both Builder and Finder, without browser or Next.js runtime.
require.extensions[".tsx"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
require.extensions[".css"] = (module) => {
  module.exports = { content: "content", section: "section", pills: "pills", none: "none" };
};

const MedalInformation = require("../src/components/medals/MedalInformation.tsx").default;

function example(overrides = {}) {
  return {
    id: "fixture-medal",
    name: "Fixture Medal",
    category: "character",
    uniqueTrait: "Reduce the cooldown time of Skill 1 by 3%.",
    tags: [{ id: "egghead", name: "Egghead" }, { id: "zoan", name: "Zoan" }],
    nativeTraits: ["atk", "hp"],
    nativeEffects: ["damage-dealt-increase"],
    statusReductions: ["capture-block"],
    ...overrides,
  };
}

test("shared Builder/Finder medal information renders all fact sections", () => {
  const html = renderToStaticMarkup(React.createElement(MedalInformation, { medal: example() }));
  for (const title of ["Unique Trait", "Tags", "Native Traits", "Extra Trait Effects", "Status Reductions"]) {
    assert.ok(html.includes(title), title);
  }
  for (const value of ["Reduce the cooldown time of Skill 1 by 3%.", "Egghead", "Zoan", "ATK", "HP", "Damage Dealt Increase", "Capture Block"]) {
    assert.ok(html.includes(value), value);
  }
});

test("medals without optional extra effects show None rather than fabricated values", () => {
  const html = renderToStaticMarkup(React.createElement(MedalInformation, {
    medal: example({ nativeEffects: undefined, statusReductions: undefined, nativeTraits: [] }),
  }));
  assert.equal((html.match(/>None<\/em>/g) ?? []).length, 3);
  assert.ok(html.includes("Egghead"));
});

test("react escapes untrusted OCR-derived medal text", () => {
  const html = renderToStaticMarkup(React.createElement(MedalInformation, {
    medal: example({ uniqueTrait: '<img src=x onerror="alert(1)">' }),
  }));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});
