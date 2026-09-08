import { characters } from "@/data/characters";
import { scouts } from "@/data/scouts";
import ScoutCard from "./ScoutCard";
import styles from "./page.module.css";
import { connection } from "next/server";
import { getScoutStatus } from "@/lib/scout-status";

export const metadata = {
  title: "Scout Simulator",
  description: "Explore OPBR scout banners and simulate character pulls in One Piece Bounty Rush.",
  alternates: { canonical: "/scout-simulator" },
};


function newestScoutFirst(
  left: (typeof scouts)[number],
  right: (typeof scouts)[number],
): number {
  return new Date(right.startAt).getTime() - new Date(left.startAt).getTime();
}

export default async function ScoutSimulatorPage() {
  await connection();
  // Request-time Server Component: connection() prevents build-time freezing.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
const currentScouts = scouts
  .filter((scout) => getScoutStatus(scout, now) === "current")
  .sort(newestScoutFirst);

const pastScouts = scouts
  .filter((scout) => getScoutStatus(scout, now) === "past")
  .sort(newestScoutFirst);

const upcomingScouts = scouts
  .filter((scout) => getScoutStatus(scout, now) === "upcoming")
  .sort(newestScoutFirst);

  return (
    <main id="main-content" tabIndex={-1} className={`${styles.page} upper-page-background`}>
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
            <h2 id="current-scouts-title">Current Scouts</h2>
            <span>{currentScouts.length}</span>
          </div>
          <div className={styles.scoutList}>
            {currentScouts.map((scout) => (
              <ScoutCard
                key={scout.id}
                scout={scout}
                characters={characters}
              />
            ))}
          </div>
          {!currentScouts.length && <p>No current scout banners are listed. You can still try past scouts below.</p>}
        </section>

        {upcomingScouts.length > 0 && <section className={styles.section} aria-labelledby="upcoming-scouts-title">
          <div className={styles.sectionHeading}><h2 id="upcoming-scouts-title">Upcoming Scouts</h2><span>{upcomingScouts.length}</span></div>
          <div className={styles.scoutList}>{upcomingScouts.map((scout) => <ScoutCard key={scout.id} scout={scout} characters={characters} />)}</div>
        </section>}

        {pastScouts.length > 0 && (
          <section className={styles.section} aria-labelledby="past-scouts-title">
            <div className={styles.sectionHeading}>
              <h2 id="past-scouts-title">Past Scouts</h2>
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
