import type { Metadata } from "next";
import { characterGuides } from "@/data/character-guides";
import { characterUsageSnapshots, getAvailableCharacterIds, processCharacterUsageSnapshots } from "@/data/character-usage";
import { characters } from "@/data/characters";
import CharacterUsageAnalytics from "./CharacterUsageAnalytics";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Top League Character Usage | OPBR",
  description: "Explore estimated character usage among top One Piece Bounty Rush League Battle players.",
};

export default function CharacterUsagePage() {
  const snapshots = processCharacterUsageSnapshots(characterUsageSnapshots);
  const availableCharacters = getAvailableCharacterIds(characterUsageSnapshots)
    .map((id) => characters[id])
    .sort((a, b) => a.name.localeCompare(b.name));
  const latest = snapshots.at(-1);

  return (
    <main className={`${styles.page} upper-page-background`}>
      <div className={styles.content}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>League Battle Analytics</p>
          <h1>Top League Character Usage</h1>
          <p className={styles.description}>Manually recorded from the teams used by top League Battle players, then translated into estimated player usage.</p>
          {latest ? (
            <dl className={styles.heroStats}>
              <div><dt>Latest update</dt><dd>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${latest.date}T00:00:00Z`))}</dd></div>
              <div><dt>Target players</dt><dd>{latest.targetPlayers}</dd></div>
              <div><dt>Recorded slots</dt><dd>{latest.recordedSlots}</dd></div>
              <div><dt>Data coverage</dt><dd>{latest.coverage.toFixed(1)}%</dd></div>
            </dl>
          ) : <p className={styles.empty}>No character usage snapshots are available yet.</p>}
          <p className={styles.disclaimer}>Data is collected manually and may contain minor counting errors.</p>
        </header>
        {latest && (
          <CharacterUsageAnalytics
            snapshots={snapshots}
            availableCharacters={availableCharacters}
            guideCharacterIds={Object.keys(characterGuides)}
          />
        )}
      </div>
    </main>
  );
}
