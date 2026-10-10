import type { Medal } from "@/data/medals";
import MedalArtwork from "@/components/medals/MedalArtwork";
import styles from "./RecentMedals.module.css";

type Props = {
  medals: readonly Medal[];
  onChoose: (medalId: string) => void;
};

export default function RecentMedals({ medals, onChoose }: Props) {
  if (!medals.length) return null;

  return (
    <section className={styles.section} aria-labelledby="recent-medals-heading">
      <div className={styles.heading}>
        <div>
          <span className={styles.kicker}>Quick start</span>
          <h3 id="recent-medals-heading">Recently Added Medals</h3>
          <p>Newly added to OPBR Guide, not necessarily newly released in-game. Choose one to find matching medals.</p>
        </div>
      </div>
      <div className={styles.grid}>
        {medals.map((medal) => (
          <button
            type="button"
            key={medal.id}
            className={styles.card}
            aria-label={`Find combinations with ${medal.name}`}
            onClick={() => onChoose(medal.id)}
          >
            <MedalArtwork medal={medal} sizes="64px" className={styles.artwork} />
            <span className={styles.name}>{medal.name}</span>
            <span className={styles.action}>Find matches →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
