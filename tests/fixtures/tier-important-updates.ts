import type { ImportantTierUpdate } from "../../src/data/tier-important-updates";

// Synthetic examples for development/test only. These are NOT OPBR history.
export const demoNow = Date.parse("2026-10-01T12:00:00Z");
export const demoUpdate: ImportantTierUpdate = {
  id: "demo-review",
  status: "published",
  publishedAt: "2026-10-01T00:00:00Z",
  title: "Example of a major evaluation review",
  summary: "Fictional preview: a balance update and a changing meta prompt an editorial review. These example movements do not describe actual OPBR changes.",
  officialAdjustment: {
    date: "2026-09-30",
    summary: "Demo only: a verified notice would summarize changes to skills or traits here. This is not a real game adjustment or official date.",
    sourceUrl: "https://example.com/#demo-not-an-official-source",
  },
  changes: [
    { characterId: "future-where-i-m-the-most-free-jewelry-bonney", kind: "rise", fromTier: "A", toTier: "SS", reason: "Example assessment: stronger flag control would justify a higher evaluation." },
    { characterId: "the-five-elders-st-marcus-mars", kind: "fall", fromTier: "SS", toTier: "S", reason: "Example assessment: more common counters would reduce consistency in league battles." },
    { characterId: "navy-hq-sword-koby", kind: "new", fromTier: null, toTier: "B", reason: "Example assessment: a first placement would reflect the character’s value as a runner." },
    { characterId: "seraphim-s-snake", kind: "adjustment", fromTier: "C", toTier: "C", reason: "Example assessment: a meaningful matchup change could warrant a review without changing tier." },
    { characterId: "navy-hq-sword-prince-grus", kind: "rise", fromTier: "D", toTier: "C", reason: "Example assessment: improved survivability would increase value in contested areas." },
  ],
};

export function getDemoScenario(scenario?: string) {
  if (scenario === "empty") return { events: [], now: demoNow };
  if (scenario === "draft") return { events: [{ ...demoUpdate, status: "draft" as const }], now: demoNow };
  if (scenario === "future") return { events: [demoUpdate], now: Date.parse("2026-09-30T23:59:59Z") };
  if (scenario === "expired") return { events: [demoUpdate], now: Date.parse("2026-10-15T00:00:00Z") };
  if (scenario === "mismatch") return { events: [{ ...demoUpdate, changes: demoUpdate.changes.map((change, index) => index === 0 ? { ...change, toTier: "S" as const } : change) }], now: demoNow };
  return { events: [demoUpdate], now: demoNow };
}
