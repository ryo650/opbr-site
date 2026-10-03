"use client";

import { useRef, useState } from "react";
import CharacterFrame from "@/components/character-frame/CharacterFrame";
import type { Character } from "@/data/characters/type";
import type { ScoutStep, StepUpDefinition } from "@/data/scouts/simulator-type";
import { compileStepUp, createStepUpSession } from "@/lib/scout-step-up";
import styles from "./StepUpSimulator.module.css";

function guaranteeText(step: ScoutStep): string {
  if (step.drawPlan.kind !== "independentSlots") return "Unsupported guarantee plan";
  const guarantees = step.drawPlan.groups.filter(group => group.role === "guarantee");
  if (!guarantees.length) return "No guaranteed slots";
  return guarantees.map(group => group.role === "guarantee" && `${group.count} fixed guaranteed slot: ${group.criterion.kind === "rarityAtLeast" ? `rarity ${group.criterion.rarity}+` : group.criterion.characterIds.join(" or ")}`).join("; ") + ` (included in ${step.pullCount} pulls)`;
}

export default function StepUpSimulator({ definition, characters }: { definition: StepUpDefinition; characters: Record<string, Character> }) {
  const [runtime] = useState(() => {
    try { const compiled = compileStepUp(definition, characters); return { compiled, session: createStepUpSession(compiled), error: "" }; }
    catch (error) { return { compiled: null, session: null, error: error instanceof Error ? error.message : "Invalid Step-Up definition" }; }
  });
  const [state, setState] = useState(() => runtime.session?.getState() ?? null);
  const [error, setError] = useState("");
  const resetButton = useRef<HTMLButtonElement>(null);
  if (!runtime.compiled || !runtime.session || !state) return <main id="main-content" tabIndex={-1} className={styles.page}><h1>Step-Up Simulator unavailable</h1><p role="alert">{runtime.error}</p></main>;
  const compiled = runtime.compiled;
  const session = runtime.session;
  const data = compiled.definition;
  const step = state.currentStepIndex === null ? null : data.steps[state.currentStepIndex];
  const fixture = data.source.kind === "fixture";
  const rounds = data.repeat.kind === "finite" ? data.repeat.maxRounds : 0;
  const rewardLabels = Object.fromEntries(data.steps.flatMap(s => s.rewards.map(r => [r.rewardId, r.label])));

  function run() {
    if (!state) return;
    try {
      const next = session.run(state.revision);
      setState(next); setError("");
      if (next.status === "completed") resetButton.current?.focus();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Step could not be completed"); }
  }
  function reset() { setState(session.reset()); setError(""); }

  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <div className={styles.content}>
      <header><p className={styles.eyebrow}>{fixture ? "DEVELOPMENT FIXTURE" : "OPBR STEP-UP"}</p><h1>{data.meta.name}</h1>
        {fixture && <p className={styles.notice}>Fictional characters, rates and rewards. This is a development test, not an official Scout.</p>}
      </header>
      <section className={styles.panel} aria-labelledby="progress-title">
        <h2 id="progress-title">{state.status === "completed" ? "Completed" : `Round ${state.currentRound} / ${rounds} · Step ${state.currentStepIndex! + 1} / ${data.steps.length}`}</h2>
        {step ? <><h3>{step.displayLabel}</h3><p>{step.pullCount} pulls · {step.cost.amount === 0 ? "Free (0 RD)" : `${step.cost.amount} RD`} · Eligibility: unrestricted</p><p>{guaranteeText(step)}</p><p>Reward: {step.rewards.length ? step.rewards.map(r => `${r.label} × ${r.quantity}`).join(", ") : "None"}</p></> : <p>Completed {state.completedRounds} / {rounds} rounds. All Steps finished.</p>}
        <div className={styles.actions}>
          <button onClick={run} disabled={!step} className={styles.pull}>{step ? `Run ${step.displayLabel} · ${step.pullCount} pulls · ${step.cost.amount === 0 ? "Free" : `${step.cost.amount} RD`}` : "All Steps completed"}</button>
          <button ref={resetButton} onClick={reset}>Reset Step-Up</button>
        </div>
        <p className={styles.status} role="status">{state.stepExecutions} Steps executed · {state.characterDraws} character draws · {state.diamondsSpent} RD spent · {state.completedRounds} rounds completed</p>
        {error && <p role="alert">{error}</p>}
      </section>
      <section className={styles.panel} aria-labelledby="steps-title"><h2 id="steps-title">Step schedule</h2>
        <ol className={styles.steps}>{data.steps.map((s, index) => <li key={s.id} aria-current={state.currentStepIndex === index ? "step" : undefined}>
          <h3>{s.displayLabel} <span>{state.status === "completed" || index < state.currentStepIndex! ? "Done this round" : index === state.currentStepIndex ? "Current" : "Next"}</span></h3>
          <p>{s.pullCount} pulls · {s.cost.amount} RD · Unrestricted</p><p>{guaranteeText(s)}</p><p>Reward: {s.rewards.map(r => `${r.label} × ${r.quantity}`).join(", ") || "None"}</p>
        </li>)}</ol>
      </section>
      {step && step.drawPlan.kind === "independentSlots" && <section className={styles.panel} aria-labelledby="rates-title"><h2 id="rates-title">Current Step rates</h2><p>Independent slots draw with replacement. Rates below apply only within each named pool.</p>
        {step.drawPlan.groups.map((group, index) => {
          const pool = compiled.pools[group.poolId];
          return <details key={index}><summary>{group.count} {group.role} slots · {group.poolId}</summary><p>{data.pools[group.poolId].source.context}</p>
            <table><caption>{group.role === "guarantee" ? "Guaranteed slot pool" : "Normal slot pool"}</caption><thead><tr><th scope="col">Character</th><th scope="col">Rarity</th><th scope="col">Featured</th><th scope="col">Rate</th></tr></thead><tbody>{pool.entries.map(entry => <tr key={entry.characterId}><th scope="row">{characters[entry.characterId].name}</th><td>{entry.rarity}★</td><td>{entry.featured ? "Yes" : "No"}</td><td>{(100 * entry.weight / pool.total).toFixed(2)}%</td></tr>)}</tbody></table>
          </details>;
        })}
      </section>}
      <section className={styles.panel} aria-labelledby="results-title"><h2 id="results-title">Step results</h2>
        {state.lastOutcome ? <><p>Round {state.lastOutcome.round} · {state.lastOutcome.stepId} · All {state.lastOutcome.results.length} slots</p><ol className={styles.results}>{state.lastOutcome.results.map(result => <li key={result.slot}>
          {fixture ? <div className={styles.demoAvatar} aria-hidden="true">{result.characterId}</div> : <CharacterFrame character={characters[result.characterId]} />}
          <strong>{characters[result.characterId].name}</strong><span>Slot {result.slot} · {result.rarity}★</span><span>{result.featured ? "Featured" : "Non-featured"}</span><span className={result.role === "guarantee" ? styles.guaranteed : ""}>{result.role === "guarantee" ? "Guaranteed" : "Normal"}</span>
        </li>)}</ol>{!state.lastOutcome.results.length && <p>Reward-only Step completed.</p>}</> : <p>Run a Step to see all its results.</p>}
      </section>
      <section className={styles.panel} aria-labelledby="stats-title"><h2 id="stats-title">Session totals</h2><dl className={styles.totals}><div><dt>Steps executed</dt><dd>{state.stepExecutions}</dd></div><div><dt>Character draws</dt><dd>{state.characterDraws}</dd></div><div><dt>RD spent</dt><dd>{state.diamondsSpent}</dd></div><div><dt>Completed rounds</dt><dd>{state.completedRounds} / {rounds}</dd></div></dl>
        <h3>Display rewards</h3>{Object.keys(state.rewardTotals).length ? <ul>{Object.entries(state.rewardTotals).map(([id, quantity]) => <li key={id}>{rewardLabels[id]} × {quantity}</li>)}</ul> : <p>None yet</p>}
        <p>Rewards are simulated display items. Reloading starts a new session.</p>
      </section>
    </div>
  </main>;
}
