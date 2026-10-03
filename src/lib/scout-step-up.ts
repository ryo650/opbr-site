import type { Character } from "@/data/characters/type";
import type { CharacterPool, PoolEntry, ScoutStep, StepUpDefinition } from "@/data/scouts/simulator-type";

type ObjectValue = Record<string, unknown>;
function reject(message: string): never { throw new Error(`Invalid Step-Up: ${message}`); }
function object(value: unknown, path: string, keys: readonly string[]): ObjectValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) reject(`${path} must be an object`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) reject(`${path} must be a plain object`);
  const result = value as ObjectValue;
  for (const key of Object.keys(result)) if (!keys.includes(key)) reject(`${path}.${key} is unsupported`);
  return result;
}
function text(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) reject(`${path} must be nonempty text`);
}
function integer(value: unknown, path: string, minimum = 0): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) reject(`${path} must be a safe integer >= ${minimum}`);
}
function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) reject(`${path} must be an array`);
  return value;
}
function source(value: unknown, path: string) {
  const s = object(value, path, ["kind", "evidencePath", "context"]);
  if (s.kind !== "fixture" && s.kind !== "gameScreenshots") reject(`${path}.kind is unsupported`);
  text(s.evidencePath, `${path}.evidencePath`); text(s.context, `${path}.context`);
}
function ids(value: unknown, path: string, characters: Record<string, Character>) {
  const list = array(value, path);
  const seen = new Set<string>();
  for (const id of list) {
    text(id, path);
    if (!Object.hasOwn(characters, id) || characters[id].id !== id) reject(`${path}: unknown character ${id}`);
    if (seen.has(id)) reject(`${path}: duplicate character ${id}`);
    seen.add(id);
  }
  return seen;
}

// Accept unknown at the registration boundary. No missing capability is silently skipped.
export function validateStepUpDefinition(value: unknown, characters: Record<string, Character>): asserts value is StepUpDefinition {
  const d = object(value, "definition", ["kind", "schemaVersion", "meta", "source", "pools", "steps", "repeat"]);
  if (d.kind !== "stepUp" || d.schemaVersion !== 1) reject("unsupported kind/schemaVersion");
  const meta = object(d.meta, "meta", ["id", "name", "bannerImg", "startAt", "endAt", "displayPickupIds", "featuredCharacterId"]);
  for (const key of ["id", "name", "bannerImg", "startAt", "endAt", "featuredCharacterId"]) text(meta[key], `meta.${key}`);
  if (!Number.isFinite(Date.parse(meta.startAt as string)) || !(Date.parse(meta.startAt as string) < Date.parse(meta.endAt as string))) reject("invalid period");
  const displayIds = ids(meta.displayPickupIds, "meta.displayPickupIds", characters);
  if (!displayIds.has(meta.featuredCharacterId as string)) reject("featured character must be in displayPickupIds");
  source(d.source, "source");
  const pools = object(d.pools, "pools", Object.keys((d.pools ?? {}) as object));
  if (!Object.keys(pools).length) reject("empty pools");
  for (const [poolId, poolValue] of Object.entries(pools)) {
    text(poolId, "poolId");
    const p = object(poolValue, poolId, ["kind", "unit", "entries", "source"]);
    if (p.kind !== "characterWeights" || !["relative", "percent"].includes(p.unit as string)) reject(`${poolId}: unsupported pool kind/unit`);
    source(p.source, `${poolId}.source`);
    let total = 0;
    const entries = array(p.entries, `${poolId}.entries`);
    const seen = new Set();
    for (const entryValue of entries) {
      const e = object(entryValue, poolId, ["characterId", "weight", "rarity", "featured"]);
      text(e.characterId, `${poolId}.characterId`);
      if (!Object.hasOwn(characters, e.characterId) || characters[e.characterId].id !== e.characterId) reject(`${poolId}: unknown character ${e.characterId}`);
      if (seen.has(e.characterId)) reject(`${poolId}: duplicate character`);
      seen.add(e.characterId);
      if (typeof e.weight !== "number" || !Number.isFinite(e.weight) || e.weight < 0) reject(`${poolId}: invalid weight`);
      if (![2, 3, 4].includes(e.rarity as number) || typeof e.featured !== "boolean") reject(`${poolId}: invalid rarity/featured`);
      total += e.weight;
    }
    if (!Number.isFinite(total) || total <= 0) reject(`${poolId}: empty positive pool`);
    if (p.unit === "percent" && Math.abs(total - 100) > 0.000001) reject(`${poolId}: percent weights must total 100`);
  }
  const repeat = object(d.repeat, "repeat", ["kind", "maxRounds"]);
  if (repeat.kind !== "finite") reject("unsupported repeat kind");
  integer(repeat.maxRounds, "repeat.maxRounds", 1);
  const steps = array(d.steps, "steps");
  if (!steps.length) reject("empty steps");
  const stepIds = new Set();
  const rewardLabels = new Map();
  for (const stepValue of steps) {
    const s = object(stepValue, "step", ["id", "displayLabel", "cost", "eligibility", "pullCount", "drawPlan", "rewards"]);
    text(s.id, "step.id"); text(s.displayLabel, "step.displayLabel");
    if (stepIds.has(s.id)) reject("duplicate step id");
    stepIds.add(s.id);
    const cost = object(s.cost, "cost", ["kind", "amount"]);
    if (cost.kind !== "rainbowDiamonds") reject("unsupported cost kind");
    integer(cost.amount, "cost.amount");
    const eligibility = object(s.eligibility, "eligibility", ["kind"]);
    if (eligibility.kind !== "unrestricted") reject("unsupported eligibility kind");
    integer(s.pullCount, "pullCount");
    const plan = object(s.drawPlan, "drawPlan", ["kind", "groups"]);
    if (plan.kind !== "independentSlots") reject(`unsupported drawPlan kind: ${String(plan.kind)}`);
    let count = 0;
    for (const groupValue of array(plan.groups, "groups")) {
      const g = object(groupValue, "group", ["role", "poolId", "count", "criterion"]);
      text(g.poolId, "group.poolId");
      if (!Object.hasOwn(pools, g.poolId)) reject("unknown pool reference");
      integer(g.count, "group.count", 1);
      count += g.count;
      if (g.role === "guarantee") {
        const c = object(g.criterion, "criterion", ["kind", "rarity", "characterIds"]);
        const entries = (pools[g.poolId] as CharacterPool).entries;
        if (c.kind === "rarityAtLeast") {
          if (![2, 3, 4].includes(c.rarity as number) || c.characterIds !== undefined) reject("invalid rarity criterion");
          if (!entries.every(e => e.rarity >= (c.rarity as number))) reject("guarantee pool violates rarity criterion");
        } else if (c.kind === "characterIds") {
          const allowed = ids(c.characterIds, "criterion.characterIds", characters);
          if (!allowed.size || c.rarity !== undefined || !entries.every(e => allowed.has(e.characterId))) reject("guarantee pool violates character criterion");
        } else reject("unsupported guarantee criterion kind");
      } else if (g.role !== "normal" || g.criterion !== undefined) reject("invalid group role/criterion");
    }
    if (!Number.isSafeInteger(count) || count !== s.pullCount) reject("group count must equal pullCount");
    const rewardIds = new Set();
    for (const rewardValue of array(s.rewards, "rewards")) {
      const r = object(rewardValue, "reward", ["kind", "rewardId", "label", "quantity", "grant"]);
      if (r.kind !== "displayItem" || r.grant !== "onStepCompletion") reject("unsupported reward kind/grant");
      text(r.rewardId, "rewardId"); text(r.label, "reward.label"); integer(r.quantity, "reward.quantity", 1);
      if (rewardIds.has(r.rewardId) || (rewardLabels.has(r.rewardId) && rewardLabels.get(r.rewardId) !== r.label)) reject("duplicate/inconsistent reward");
      rewardIds.add(r.rewardId); rewardLabels.set(r.rewardId, r.label);
    }
  }
  // Keep aggregate accounting exact even at the declared finite limit.
  for (const value of [steps.length, steps.reduce<number>((n, s) => n + (s as ScoutStep).pullCount, 0), steps.reduce<number>((n, s) => n + (s as ScoutStep).cost.amount, 0)]) {
    if (!Number.isSafeInteger(value * repeat.maxRounds)) reject("finite totals exceed safe integer range");
  }
  for (const rewardId of rewardLabels.keys()) {
    const quantity = steps.reduce<number>((n, s) => n + (s as ScoutStep).rewards.filter(r => r.rewardId === rewardId).reduce((sum, r) => sum + r.quantity, 0), 0);
    if (!Number.isSafeInteger(quantity * repeat.maxRounds)) reject("finite reward total exceeds safe integer range");
  }
}

export type StepResult = {
  characterId: string; rarity: 2 | 3 | 4; featured: boolean;
  poolId: string; role: "normal" | "guarantee"; slot: number;
};
export type StepOutcome = {
  definitionId: string; schemaVersion: 1; expectedRevision: number;
  stepId: string; round: number; results: readonly StepResult[];
};
export type StepUpState = {
  definitionId: string; schemaVersion: 1; revision: number;
  status: "active" | "completed"; currentRound: number; currentStepIndex: number | null;
  completedRounds: number; stepExecutions: number; characterDraws: number; diamondsSpent: number;
  rewardTotals: Readonly<Record<string, number>>; lastOutcome: StepOutcome | null;
};
export type CompiledStepUp = { definition: StepUpDefinition; pools: Readonly<Record<string, { entries: readonly PoolEntry[]; total: number }>> };
function freeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.freeze(value); for (const child of Object.values(value)) freeze(child); }
  return value;
}
export function compileStepUp(value: unknown, characters: Record<string, Character>): CompiledStepUp {
  validateStepUpDefinition(value, characters);
  const definition = freeze(structuredClone(value));
  const pools = Object.fromEntries(Object.entries(definition.pools).map(([id, pool]) => [id, {
    entries: pool.entries.filter(e => e.weight > 0), total: pool.entries.reduce((sum, e) => sum + e.weight, 0),
  }]));
  return freeze({ definition, pools });
}
export function createStepUpState(compiled: CompiledStepUp, revision = 0): StepUpState {
  integer(revision, "revision");
  return freeze({
    definitionId: compiled.definition.meta.id,
    schemaVersion: 1,
    revision,
    status: "active",
    currentRound: 1,
    currentStepIndex: 0,
    completedRounds: 0,
    stepExecutions: 0,
    characterDraws: 0,
    diamondsSpent: 0,
    rewardTotals: {},
    lastOutcome: null,
  });
}
function currentStep(compiled: CompiledStepUp, state: StepUpState): ScoutStep {
  if (state.definitionId !== compiled.definition.meta.id || state.schemaVersion !== 1) reject("state definition mismatch");
  if (state.status !== "active" || state.currentStepIndex === null) reject("already completed");
  const step = compiled.definition.steps[state.currentStepIndex];
  if (!step) reject("invalid cursor");
  return step;
}
export function drawStep(compiled: CompiledStepUp, state: StepUpState, rng: () => number): StepOutcome {
  const step = currentStep(compiled, state);
  if (step.drawPlan.kind !== "independentSlots") reject("unsupported drawPlan kind");
  const results: StepResult[] = [];
  for (const group of step.drawPlan.groups) {
    const pool = compiled.pools[group.poolId];
    for (let i = 0; i < group.count; i++) {
      const u = rng();
      if (!Number.isFinite(u) || u < 0 || u >= 1) reject("RNG must return 0 <= u < 1");
      const point = u * pool.total;
      let cumulative = 0;
      const entry = pool.entries.find(e => { cumulative += e.weight; return point < cumulative; });
      if (!entry) reject("could not draw a slot");
      results.push({ characterId: entry.characterId, rarity: entry.rarity, featured: entry.featured, poolId: group.poolId, role: group.role, slot: results.length + 1 });
    }
  }
  return freeze({ definitionId: state.definitionId, schemaVersion: 1, expectedRevision: state.revision, stepId: step.id, round: state.currentRound, results });
}
// Pure commit: derive cost/rewards from the validated Step, never from caller totals.
export function commitStep(compiled: CompiledStepUp, state: StepUpState, outcome: StepOutcome): StepUpState {
  const step = currentStep(compiled, state);
  if (outcome.definitionId !== state.definitionId || outcome.schemaVersion !== state.schemaVersion || outcome.expectedRevision !== state.revision || outcome.stepId !== step.id || outcome.round !== state.currentRound) reject("stale/mismatched outcome");
  if (step.drawPlan.kind !== "independentSlots" || outcome.results.length !== step.pullCount) reject("invalid outcome count");
  let slot = 0;
  for (const group of step.drawPlan.groups) {
    for (let i = 0; i < group.count; i++) {
      const result = outcome.results[slot++];
      const entry = compiled.pools[group.poolId].entries.find(e => e.characterId === result.characterId);
      if (!entry || result.slot !== slot || result.poolId !== group.poolId || result.role !== group.role || result.rarity !== entry.rarity || result.featured !== entry.featured) reject("invalid outcome slot");
    }
  }
  const rewards = new Map(Object.entries(state.rewardTotals));
  for (const reward of step.rewards) rewards.set(reward.rewardId, (rewards.get(reward.rewardId) ?? 0) + reward.quantity);
  const rewardTotals = Object.fromEntries(rewards);
  const lastStep = state.currentStepIndex === compiled.definition.steps.length - 1;
  const completedRounds = state.completedRounds + Number(lastStep);
  const repeat = compiled.definition.repeat;
  if (repeat.kind !== "finite") reject("unsupported repeat kind");
  const completed = completedRounds === repeat.maxRounds;
  return freeze({
    ...state,
    revision: state.revision + 1,
    status: completed ? "completed" : "active",
    currentStepIndex: completed ? null : lastStep ? 0 : state.currentStepIndex! + 1,
    currentRound: lastStep && !completed ? state.currentRound + 1 : state.currentRound,
    completedRounds,
    stepExecutions: state.stepExecutions + 1,
    characterDraws: state.characterDraws + outcome.results.length,
    diamondsSpent: state.diamondsSpent + step.cost.amount,
    rewardTotals,
    lastOutcome: structuredClone(outcome),
  });
}
// One local session; RNG runs outside React updater/reducer replay. Re-entrant or stale
// actions cannot charge twice. Reset increments revision, invalidating queued actions.
export function createStepUpSession(compiled: CompiledStepUp, rng: () => number = () => Math.random()) {
  let state = createStepUpState(compiled);
  let running = false;
  return {
    getState: () => state,
    run(expectedRevision: number) {
      if (running || expectedRevision !== state.revision) reject("busy/stale action");
      running = true;
      try {
        const outcome = drawStep(compiled, state, rng);
        state = commitStep(compiled, state, outcome);
        return state;
      } finally { running = false; }
    },
    reset() {
      if (running) reject("cannot reset during draw");
      state = createStepUpState(compiled, state.revision + 1);
      return state;
    },
  };
}
