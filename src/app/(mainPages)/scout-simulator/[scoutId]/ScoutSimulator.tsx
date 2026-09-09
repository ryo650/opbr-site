'use client'

import { useMemo, useState } from "react";
import Image from "next/image";
import CharacterFrame from "@/components/character-frame/CharacterFrame";
import { characters } from "@/data/characters";
import { createScoutRoller } from "@/lib/scout";
import type { Character } from "@/data/characters/type";
import type { ScoutBanner, ScoutPullOption } from "@/data/scouts/type";
import styles from "./ScoutSimulator.module.css";

const MAX_PULL_UNTIL = 1_000;
const RECENT_RESULTS_LIMIT = 11;

function DiamondCost({ amount }: { amount: number }) {
  return (
    <span className={styles.diamondCost}>
      {amount}
      <Image
        className={styles.diamondIcon}
        src="/rainbow-diamonds.webp"
        alt="Rainbow Diamonds"
        width={16}
        height={16}
      />
    </span>
  );
}

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
  scout: ScoutBanner,
): SessionStats {
  return {
    totalPulls: 1,
    diamondsSpent: diamondCost,
    pickupPulls: Number(isPickupCharacter(scout, character.id)),
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

function isPickupCharacter(scout: ScoutBanner, characterId: string): boolean {
  return scout.pickups.some(
    (pickup) => pickup.characterId === characterId,
  );
}

export default function ScoutSimulator({ scout }: { scout: ScoutBanner }) {
  const roll = useMemo(() => createScoutRoller(scout, characters), [scout]);
  const pickupOptions = useMemo(
    () => scout.pickups.flatMap((pickup) => {
      const character = characters[pickup.characterId];

      if (!character) {
        return [];
      }

      return [{
        characterId: character.id,
        name: character.name,
        rate: pickup.rate,
      }];
    }),
    [scout],
  );
  const [selectedPickupId, setSelectedPickupId] = useState(() => {
    const featuredPickup = scout.pickups.find(
      (pickup) =>
        pickup.characterId === scout.featuredCharacterId &&
        Boolean(characters[pickup.characterId]),
    );

    return featuredPickup?.characterId ?? pickupOptions[0]?.characterId ?? "";
  });
  const [results, setResults] = useState<Character[]>([]);

  const [stats, setStats] = useState<SessionStats>(createEmptyStats);
  const [pullUntilMessage, setPullUntilMessage] = useState("");
  const selectedPickupName =
    pickupOptions.find((pickup) => pickup.characterId === selectedPickupId)?.name ??
    "selected Pickup";

  function handleScout(pullOption: ScoutPullOption) {
    setPullUntilMessage("");
    let pullStats = createEmptyStats();
    const pullResults: Character[] = [];

    for (let index = 0; index < pullOption.pullCount; index += 1) {
      const character = roll();

      if (character) {
        pullStats = addStats(pullStats, getStatsForPull(character, 0, scout));
        addRecentResult(pullResults, character);
      }
    }

    pullStats.diamondsSpent = pullOption.diamondCost;

    setResults((currentResults) =>
      [...currentResults, ...pullResults].slice(-RECENT_RESULTS_LIMIT),
    );
    setStats((currentStats) => addStats(currentStats, pullStats));
  }

  function handlePullUntilSelectedPickup() {
    setPullUntilMessage("");

    if (!selectedPickupId) {
      setPullUntilMessage("Choose a Pickup character first.");
      return;
    }

    let pullStats = createEmptyStats();
    const pullResults: Character[] = [];

    for (let index = 0; index < MAX_PULL_UNTIL; index += 1) {
      const character = roll();

      if (character) {
        pullStats = addStats(
          pullStats,
          getStatsForPull(character, scout.pullOptions.single.diamondCost, scout),
        );
        addRecentResult(pullResults, character);

        if (character.id === selectedPickupId) {
          setResults(pullResults);
          setStats(pullStats);
          setPullUntilMessage(
            `Stopped after ${index + 1} pulls: ${selectedPickupName} obtained.`,
          );
          return;
        }
      }
    }

    setResults(pullResults);
    setStats(pullStats);

    setPullUntilMessage(
      `Stopped after ${MAX_PULL_UNTIL} pulls without obtaining ${selectedPickupName}.`,
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
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>OPBR SCOUT</p>
          <h1>Scout Simulator</h1>
        </header>

        <section className={styles.scoutPanel} aria-labelledby="banner-title">
          <div className={styles.banner}>
            <Image
              src={`${scout.bannerImg}`}
              alt={`${scout.name} banner`}
              fill
              preload
              sizes="(max-width: 480px) 100vw, 390px"
              className={styles.bannerImage}
            />
            <div className={styles.bannerShade} />
            <div className={styles.bannerCopy}>
              <p>LIMITED SCOUT</p>
              <h2 id="banner-title">{scout.name}</h2>
            </div>
          </div>

          <div className={styles.pullActions}>
            <button className={styles.singlePull} onClick={() => handleScout(scout.pullOptions.single)}>
              <span>{scout.pullOptions.single.pullCount} Pull</span>
              <DiamondCost amount={scout.pullOptions.single.diamondCost} />
            </button>
            <button className={styles.multiPull} onClick={() => handleScout(scout.pullOptions.multi)}>
              <span>{scout.pullOptions.multi.pullCount} Pulls</span>
              <DiamondCost amount={scout.pullOptions.multi.diamondCost} />
            </button>
          </div>
        </section>

        <p role="status" className="sr-only">{stats.totalPulls} total pulls. {stats.pickupPulls} pickups. {stats.diamondsSpent} diamonds spent.</p>
        <section className={styles.resultsSection} aria-labelledby="results-title">
          <div className={styles.sectionHeading}>
            <h2 id="results-title">Scout Results</h2>
            <span>LAST {RECENT_RESULTS_LIMIT}</span>
          </div>
          {results.length > 0 ? (
            <div className={styles.resultsGrid}>
              {results.map((character, index) => (
                <CharacterFrame
                  character={character}
                  key={`${character.id}-${index}`}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyResults}>Your latest scout results will appear here.</div>
          )}
        </section>

        <section className={styles.sessionSection} aria-labelledby="session-title">
          <div className={styles.targetPicker}>
            <label htmlFor="pickup-target">Pull Until Target</label>
            <select
              id="pickup-target"
              value={selectedPickupId}
              onChange={(event) => {
                setSelectedPickupId(event.target.value);
                setPullUntilMessage("");
              }}
              disabled={pickupOptions.length === 0}
            >
              {pickupOptions.map((pickup) => (
                <option key={pickup.characterId} value={pickup.characterId}>
                  {pickup.name} ({pickup.rate}%)
                </option>
              ))}
            </select>
          </div>
          <div className={styles.utilityActions}>
            <button
              className={styles.untilButton}
              onClick={handlePullUntilSelectedPickup}
              disabled={!selectedPickupId}
            >
              Pull Until Selected Pickup
            </button>
            <button className={styles.resetButton} onClick={handleReset}>Reset</button>
          </div>
          <p className={styles.helper}>
            Choose a Pickup character. Stops when it appears or after {MAX_PULL_UNTIL} pulls.
          </p>
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
