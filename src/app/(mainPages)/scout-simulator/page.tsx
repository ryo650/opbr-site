'use client'

import { useState } from "react";
import Image from "next/image";
import { characters } from "@/data/characters";
import { sampleExScout } from "@/data/scouts/sampleExScout";
import { rollScoutMany } from "@/lib/scout";
import type { Character } from "@/data/characters/type";

function getUnknownSafeLabel(value: Character["grade"] | Character["role"]): string {
  return value === "unknown" ? "Unknown" : value;
}

export default function ScoutSimulatorpage() {

  const [results, setResults] = useState<Character[]>([]);

  function handleScout(count: number) {
    const charactersResult = rollScoutMany(sampleExScout, characters, count);
    setResults(charactersResult)
  }

  return (
    <main>
      <h1>Scout Simulator</h1>
      <p>Try a simple OPBR scout simulation.</p>

      <section>
        <h2>{sampleExScout.name}</h2>
        <p>Cost: {sampleExScout.cost} Rainbow Diamonds</p>

        <button onClick={() => handleScout(1)}>Scout *1</button>
        <button onClick={() => handleScout(11)}>Scout *11</button>
      </section>

      {results.length > 0 && (
        <section>
          <h2>Results</h2>

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
