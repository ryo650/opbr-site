'use client'

import { useState } from "react";
import Image from "next/image";
import { characters } from "@/data/characters";
import { sampleExScout } from "@/data/scouts/sampleExScout";
import { rollScout } from "@/lib/scout";
import type { Character } from "@/data/characters/type";
import type { ScoutPullOption } from "@/data/scouts/type";
import styles from "./page.module.css";

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

const gradeLabels: Record<Character["grade"], string> = {
  ex: "EX",
  bf: "BF",
  sp: "SP",
  "star-4": "4★",
  "star-3": "3★",
  "star-2": "2★",
  free: "FREE",
  exchange: "EXCH",
  cola: "COLA",
  unknown: "?",
};

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
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>OPBR SCOUT</p>
          <h1>Scout Simulator</h1>
        </header>

        <section className={styles.scoutPanel} aria-labelledby="banner-title">
          <div className={styles.banner}>
            <Image
              src="/scouts/ex/IMG_1871.jpg"
              alt="Sample EX Scout banner"
              fill
              priority
              sizes="(max-width: 430px) calc(100vw - 32px), 390px"
            />
            <div className={styles.bannerShade} />
            <div className={styles.bannerCopy}>
              <p>LIMITED SCOUT</p>
              <h2 id="banner-title">{sampleExScout.name}</h2>
            </div>
          </div>

          <div className={styles.pullActions}>
            <button className={styles.singlePull} onClick={() => handleScout(sampleExScout.pullOptions.single)}>
              <span>1 Pull</span>
              <small>{sampleExScout.pullOptions.single.diamondCost} <span aria-hidden="true">◆</span></small>
            </button>
            <button className={styles.multiPull} onClick={() => handleScout(sampleExScout.pullOptions.multi)}>
              <span>11 Pulls</span>
              <small>{sampleExScout.pullOptions.multi.diamondCost} <span aria-hidden="true">◆</span></small>
            </button>
          </div>
        </section>

        <section className={styles.resultsSection} aria-labelledby="results-title">
          <div className={styles.sectionHeading}>
            <h2 id="results-title">Scout Results</h2>
            <span>LAST {RECENT_RESULTS_LIMIT}</span>
          </div>
          {results.length > 0 ? (
            <div className={styles.resultsGrid}>
              {results.map((character, index) => (
                <div
                  className={`${styles.resultCard} ${styles[`grade${character.grade.replace("-", "")}`]}`}
                  key={`${character.id}-${index}`}
                >
                  <span className={styles.rarityLabel}>{gradeLabels[character.grade]}</span>
                  <Image src={character.image} alt={character.name} width={112} height={112} sizes="72px" />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyResults}>Your latest scout results will appear here.</div>
          )}
        </section>

        <section className={styles.sessionSection} aria-labelledby="session-title">
          <div className={styles.utilityActions}>
            <button className={styles.untilButton} onClick={handlePullUntilPickup}>Pull Until Pickup</button>
            <button className={styles.resetButton} onClick={handleReset}>Reset</button>
          </div>
          <p className={styles.helper}>Pull Until stops after a Pickup or {MAX_PULL_UNTIL} pulls.</p>
          {pullUntilMessage && <p className={styles.status} role="status">{pullUntilMessage}</p>}

          <div className={styles.statistics}>
            <h2 id="session-title">Session Statistics</h2>
            <dl>
              <div><dt>Total Pulls</dt><dd>{stats.totalPulls}</dd></div>
              <div><dt>Diamonds Spent</dt><dd>{stats.diamondsSpent}</dd></div>
              <div><dt>Pickup</dt><dd>{stats.pickupPulls} <small>{pickupRate.toFixed(2)}%</small></dd></div>
              <div><dt>EX</dt><dd>{stats.exPulls} <small>{exRate.toFixed(2)}%</small></dd></div>
              <div><dt>BF</dt><dd>{stats.bfPulls} <small>{bfRate.toFixed(2)}%</small></dd></div>
              <div><dt>Star 4</dt><dd>{stats.star4Pulls} <small>{star4Rate.toFixed(2)}%</small></dd></div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  )
}
