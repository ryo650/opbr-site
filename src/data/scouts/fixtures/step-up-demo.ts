import type { Character } from "@/data/characters/type";
import type { CharacterPool, ScoutSource, StepUpDefinition } from "../simulator-type";

export const demoCharacters: Record<string, Character> = Object.fromEntries(
  ["A", "B", "C", "D", "E"].map(id => [id, {
    id, name: `Demo ${id}`, image: "/rainbow-diamonds.webp",
    grade: id === "C" ? "star-3" : id === "D" ? "star-2" : "star-4",
    element: "blue", role: "attacker",
  } as Character]),
);
const source: ScoutSource = { kind: "fixture", evidencePath: "docs/scout-step-up/evidence/demo.json", context: "Fictional development fixture; no official game rates or rewards." };
function pool(context: string, weights: Record<string, number>): CharacterPool {
  return { kind: "characterWeights", unit: "relative", source: { ...source, context }, entries: Object.entries(weights).map(([characterId, weight]) => ({ characterId, weight, rarity: characterId === "D" ? 2 : characterId === "C" ? 3 : 4, featured: characterId === "A" || characterId === "E" })) };
}
export const stepUpDemo: StepUpDefinition = {
  kind: "stepUp", schemaVersion: 1, source,
  meta: { id: "fictional-step-up-demo", name: "Fictional Step-Up Demo", bannerImg: "/rainbow-diamonds.webp", startAt: "2026-01-01T00:00:00Z", endAt: "2027-01-01T00:00:00Z", displayPickupIds: ["A", "E"], featuredCharacterId: "A" },
  pools: {
    N1: pool("Normal slots, Steps 1 and 2", { D: 60, C: 29, B: 8, A: 2, E: 1 }),
    N3: pool("Normal slots, Step 3", { D: 60, C: 25, B: 9, A: 4, E: 2 }),
    G4: pool("Fixed final slot: rarity 4 guarantee, included in 11 pulls", { B: 8, A: 2, E: 1 }),
    GF: pool("Fixed final slot: Demo A or E guarantee, included in 5 pulls", { A: 2, E: 1 }),
  },
  steps: [
    { id: "S1", displayLabel: "Step 1", cost: { kind: "rainbowDiamonds", amount: 10 }, eligibility: { kind: "unrestricted" }, pullCount: 3, drawPlan: { kind: "independentSlots", groups: [{ role: "normal", poolId: "N1", count: 3 }] }, rewards: [] },
    { id: "S2", displayLabel: "Step 2 · Free", cost: { kind: "rainbowDiamonds", amount: 0 }, eligibility: { kind: "unrestricted" }, pullCount: 11, drawPlan: { kind: "independentSlots", groups: [{ role: "normal", poolId: "N1", count: 10 }, { role: "guarantee", poolId: "G4", count: 1, criterion: { kind: "rarityAtLeast", rarity: 4 } }] }, rewards: [] },
    { id: "S3", displayLabel: "Step 3", cost: { kind: "rainbowDiamonds", amount: 30 }, eligibility: { kind: "unrestricted" }, pullCount: 5, drawPlan: { kind: "independentSlots", groups: [{ role: "normal", poolId: "N3", count: 4 }, { role: "guarantee", poolId: "GF", count: 1, criterion: { kind: "characterIds", characterIds: ["A", "E"] } }] }, rewards: [{ kind: "displayItem", rewardId: "demo-bonus", label: "Demo bonus", quantity: 1, grant: "onStepCompletion" }] },
  ],
  repeat: { kind: "finite", maxRounds: 1 },
};
