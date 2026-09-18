"use client";

import { useMemo, useState } from "react";
import type { Medal } from "@/data/medals";
import type { MedalSetCategory, RecommendedMedalSet } from "@/data/medal-sets";
import MedalSetCard, { medalSetCategoryLabels } from "./MedalSetCard";
import styles from "./MedalSets.module.css";

type Filter = "all" | MedalSetCategory;

const categoryOrder: readonly MedalSetCategory[] = [
  "general",
  "attack",
  "durability",
  "capture-speed",
  "skill-1",
  "skill-2",
  "skill-1-and-2",
];

export default function MedalSets({
  medals,
  sets,
}: {
  medals: readonly Medal[];
  sets: readonly RecommendedMedalSet[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const medalById = useMemo(() => new Map(medals.map((medal) => [medal.id, medal])), [medals]);
  const visibleSets = filter === "all" ? sets : sets.filter((set) => set.category === filter);

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Recommended Builds</p>
          <h1>Medal Sets</h1>
          <p>Find the best medal combinations for different playstyles.</p>
        </header>

        <nav className={styles.filters} aria-label="Filter medal sets by category">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
          {categoryOrder.map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {medalSetCategoryLabels[category]}
            </button>
          ))}
        </nav>

        <div className={styles.grid} aria-live="polite">
          {visibleSets.map((set) => <MedalSetCard key={set.id} set={set} medalById={medalById} />)}
        </div>
      </div>
    </main>
  );
}
