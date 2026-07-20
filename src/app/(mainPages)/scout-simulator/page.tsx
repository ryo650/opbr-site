'use client'

import { useState } from "react";
import Image from "next/image";
import { characters } from "@/data/characters";
import { sampleExScout } from "@/data/scouts/sampleExScout";
import { rollScout } from "@/lib/scout";
import type { Character } from "@/data/characters/type";
import type { ScoutPullOption } from "@/data/scouts/type";

const MAX_PULL_UNTIL = 1_000;
const RECENT_RESULTS_LIMIT = 11;

type SessionStats = {
  totalPulls: number;
  diamondsSpent: number;
  pickupPulls: number;
  exPulls: number;
  bfPulls: number;
  star4Pulls: number;
};

function createEmptyStats(): SessionStats {
  return {
    totalPulls: 0,
    diamondsSpent: 0,
    pickupPulls: 0,
    exPulls: 0,
    bfPulls: 0,
    star4Pulls: 0,
  };
}

function getStatsForPull(
  character: Character,
  diamondCost: number,
): SessionStats {
  return {
    totalPulls: 1,
    diamondsSpent: diamondCost,
    pickupPulls: Number(sampleExScout.pickupIds.includes(character.id)),
    exPulls: Number(character.grade === "ex"),
    bfPulls: Number(character.grade === "bf"),
    star4Pulls: Number(character.grade === "star-4"),
  };
}

function addStats(currentStats: SessionStats, addedStats: SessionStats): SessionStats {
  return {
    totalPulls: currentStats.totalPulls + addedStats.totalPulls,
    diamondsSpent: currentStats.diamondsSpent + addedStats.diamondsSpent,
    pickupPulls: currentStats.pickupPulls + addedStats.pickupPulls,
    exPulls: currentStats.exPulls + addedStats.exPulls,
    bfPulls: currentStats.bfPulls + addedStats.bfPulls,
    star4Pulls: currentStats.star4Pulls + addedStats.star4Pulls,
  };
}

function addRecentResult(results: Character[], character: Character): void {
  results.push(character);

  if (results.length > RECENT_RESULTS_LIMIT) {
    results.shift();
  }
}

function getUnknownSafeLabel(value: Character["grade"] | Character["role"]): string {
  return value === "unknown" ? "Unknown" : value;
}

export default function ScoutSimulatorpage() {
  const [results, setResults] = useState<Character[]>([]);
  const [stats, setStats] = useState<SessionStats>(createEmptyStats);
  const [pullUntilMessage, setPullUntilMessage] = useState("");

  function handleScout(pullOption: ScoutPullOption) {
    setPullUntilMessage("");
    let pullStats = createEmptyStats();
    const pullResults: Character[] = [];

    for (let index = 0; index < pullOption.pullCount; index += 1) {
      const character = rollScout(sampleExScout, characters);

      if (character) {
        pullStats = addStats(pullStats, getStatsForPull(character, 0));
        addRecentResult(pullResults, character);
      }
    }

    pullStats.diamondsSpent = pullOption.diamondCost;

    setResults((currentResults) =>
      [...currentResults, ...pullResults].slice(-RECENT_RESULTS_LIMIT),
    );
    setStats((currentStats) => addStats(currentStats, pullStats));
  }

  function handlePullUntilPickup() {
    setPullUntilMessage("");
    let pullStats = createEmptyStats();
    const pullResults: Character[] = [];

    for (let index = 0; index < MAX_PULL_UNTIL; index += 1) {
      const character = rollScout(sampleExScout, characters);

      if (character) {
        pullStats = addStats(
          pullStats,
          getStatsForPull(character, sampleExScout.pullOptions.single.diamondCost),
        );
        addRecentResult(pullResults, character);

        if (sampleExScout.pickupIds.includes(character.id)) {
          setResults(pullResults);
          setStats(pullStats);
          setPullUntilMessage(`Stopped after ${index + 1} pulls: Pickup obtained.`);
          return;
        }
      }
    }

    setResults(pullResults);
    setStats(pullStats);
    setPullUntilMessage(
      `Stopped after ${MAX_PULL_UNTIL} pulls without obtaining a Pickup.`,
    );
  }

  function handleReset() {
    setResults([]);
    setStats(createEmptyStats());
    setPullUntilMessage("");
  }

  const pickupRate =
    stats.totalPulls === 0
      ? 0
      : (stats.pickupPulls / stats.totalPulls) * 100;
  const exRate =
    stats.totalPulls === 0 ? 0 : (stats.exPulls / stats.totalPulls) * 100;
  const bfRate =
    stats.totalPulls === 0 ? 0 : (stats.bfPulls / stats.totalPulls) * 100;
  const star4Rate =
    stats.totalPulls === 0 ? 0 : (stats.star4Pulls / stats.totalPulls) * 100;

  return (
    <main>
      <h1>Scout Simulator</h1>
      <p>Try a simple OPBR scout simulation.</p>

      <section>
        <h2>{sampleExScout.name}</h2>
        <p>
          1 Pull: {sampleExScout.pullOptions.single.diamondCost} Rainbow Diamonds
        </p>
        <p>
          11 Pulls: {sampleExScout.pullOptions.multi.diamondCost} Rainbow Diamonds
        </p>

        <button onClick={() => handleScout(sampleExScout.pullOptions.single)}>
          Scout *1
        </button>
        <button onClick={() => handleScout(sampleExScout.pullOptions.multi)}>
          Scout *11
        </button>
        <button onClick={handlePullUntilPickup}>Pull Until Pickup</button>
        <button onClick={handleReset}>Reset Session</button>
        <p>Pull Until stops after a Pickup or {MAX_PULL_UNTIL} pulls.</p>
        {pullUntilMessage && <p role="status">{pullUntilMessage}</p>}
      </section>

      <section>
        <h2>Session Statistics</h2>
        <p>Total Pulls: {stats.totalPulls}</p>
        <p>
          Diamonds Spent: {stats.diamondsSpent}
        </p>
        <p>Pickup: {stats.pickupPulls} ({pickupRate.toFixed(2)}%)</p>
        <p>EX: {stats.exPulls} ({exRate.toFixed(2)}%)</p>
        <p>BF: {stats.bfPulls} ({bfRate.toFixed(2)}%)</p>
        <p>Star 4: {stats.star4Pulls} ({star4Rate.toFixed(2)}%)</p>
      </section>

      {results.length > 0 && (
        <section>
          <h2>Recent Results (last {RECENT_RESULTS_LIMIT})</h2>

          <div>
            {results.map((character, index) => (
              <div key={`${character.id}-${index}`}>
                <Image
                  src={character.image}
                  alt={character.name}
                  width={96}
                  height={96}
                />
                <p>{character.name}</p>
                <p>
                  {character.element} / {getUnknownSafeLabel(character.role)} / {getUnknownSafeLabel(character.grade)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
