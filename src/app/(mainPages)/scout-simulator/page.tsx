'use client'

import { useState } from "react";
import Image from "next/image";
import { characters } from "@/data/characters";
import { sampleExScout } from "@/data/scouts/sampleExScout";
import { rollScout } from "@/lib/scout";
import type { Character } from "@/data/characters/type";

const MAX_PULL_UNTIL = 1_000;
const RECENT_RESULTS_LIMIT = 11;

type SessionStats = {
  totalPulls: number;
  pickupPulls: number;
};

function getUnknownSafeLabel(value: Character["grade"] | Character["role"]): string {
  return value === "unknown" ? "Unknown" : value;
}

export default function ScoutSimulatorpage() {
  const [results, setResults] = useState<Character[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalPulls: 0,
    pickupPulls: 0,
  });
  const [pullUntilMessage, setPullUntilMessage] = useState("");

  function recordPull(character: Character) {
    const isPickup = sampleExScout.pickupIds.includes(character.id);

    setResults((currentResults) =>
      [...currentResults, character].slice(-RECENT_RESULTS_LIMIT),
    );
    setStats((currentStats) => ({
      totalPulls: currentStats.totalPulls + 1,
      pickupPulls: currentStats.pickupPulls + Number(isPickup),
    }));

    return isPickup;
  }

  function handleScout(count: number) {
    setPullUntilMessage("");

    for (let index = 0; index < count; index += 1) {
      const character = rollScout(sampleExScout, characters);

      if (character) {
        recordPull(character);
      }
    }
  }

  function handlePullUntilPickup() {
    setPullUntilMessage("");

    for (let index = 0; index < MAX_PULL_UNTIL; index += 1) {
      const character = rollScout(sampleExScout, characters);

      if (character && recordPull(character)) {
        setPullUntilMessage(`Stopped after ${index + 1} pulls: Pickup obtained.`);
        return;
      }
    }

    setPullUntilMessage(
      `Stopped after ${MAX_PULL_UNTIL} pulls without obtaining a Pickup.`,
    );
  }

  function handleReset() {
    setResults([]);
    setStats({ totalPulls: 0, pickupPulls: 0 });
    setPullUntilMessage("");
  }

  const pickupRate =
    stats.totalPulls === 0
      ? 0
      : (stats.pickupPulls / stats.totalPulls) * 100;

  return (
    <main>
      <h1>Scout Simulator</h1>
      <p>Try a simple OPBR scout simulation.</p>

      <section>
        <h2>{sampleExScout.name}</h2>
        <p>Cost: {sampleExScout.cost} Rainbow Diamonds</p>

        <button onClick={() => handleScout(1)}>Scout *1</button>
        <button onClick={() => handleScout(11)}>Scout *11</button>
        <button onClick={handlePullUntilPickup}>Pull Until Pickup</button>
        <button onClick={handleReset}>Reset Session</button>
        <p>Pull Until stops after a Pickup or {MAX_PULL_UNTIL} pulls.</p>
        {pullUntilMessage && <p role="status">{pullUntilMessage}</p>}
      </section>

      <section>
        <h2>Session Statistics</h2>
        <p>Total Pulls: {stats.totalPulls}</p>
        <p>Pickup Obtained: {stats.pickupPulls}</p>
        <p>Pickup Rate: {pickupRate.toFixed(2)}%</p>
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
