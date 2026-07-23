import { characters } from "@/data/characters";
import { scouts } from "@/data/scouts";
import ScoutCard from "./ScoutCard";
import styles from "./page.module.css";

function isCurrentScout(endAt: string): boolean {
  return new Date(endAt).getTime() >= Date.now();
}

export default function ScoutSimulatorPage() {
  const currentScouts = scouts.filter((scout) => isCurrentScout(scout.endAt));
  const pastScouts = scouts.filter((scout) => !isCurrentScout(scout.endAt));

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>
            OPBR SCOUT
          </p>

          <h1>Scout Simulator</h1>
          <p className={styles.description}>
            Pick a banner and try your luck with its in-game rates.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="current-scouts-title">
          <div className={styles.sectionHeading}>
            <h2 id="current-scouts-title">開催中のガチャ</h2>
            <span>{currentScouts.length}</span>
          </div>
          <div className={styles.scoutList}>
            {currentScouts.map((scout) => (
              <ScoutCard
                key={scout.id}
                scout={scout}
                characters={characters}
                showMetaMeter
              />
            ))}
          </div>
        </section>

        {pastScouts.length > 0 && (
          <section className={styles.section} aria-labelledby="past-scouts-title">
            <div className={styles.sectionHeading}>
              <h2 id="past-scouts-title">過去のガチャ</h2>
              <span>{pastScouts.length}</span>
            </div>
            <div className={styles.scoutList}>
              {pastScouts.map((scout) => (
                <ScoutCard key={scout.id} scout={scout} characters={characters} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
