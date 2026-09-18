import Link from "next/link";
import type { Medal } from "@/data/medals";
import MedalArtwork from "@/components/medals/MedalArtwork";
import { resolveMedalSetSlots, type RecommendedMedalSet } from "@/data/medal-sets";
import { medalSetCategoryLabels } from "./labels";
import styles from "./MedalSets.module.css";

type Props = {
  set: RecommendedMedalSet;
  medalById: ReadonlyMap<string, Medal>;
};

const formatMedalName = (name: string) => name.replace(/ Medal$/, "");

export default function MedalSetCard({ set, medalById }: Props) {
  const slots = resolveMedalSetSlots(set, medalById);

  return (
    <article className={styles.card}>
      <Link
        className={styles.cardLink}
        href={`/medal-sets/${set.id}`}
        aria-label={`View ${set.name}`}
      >
        <header className={styles.cardHeader}>
          <div>
            <p className={styles.category}>{medalSetCategoryLabels[set.category]}</p>
            <h2>{set.name}</h2>
          </div>
          {set.description && <p className={styles.description}>{set.description}</p>}
        </header>

        <div className={styles.medals}>
          {slots.map(({ medalId, medal }, index) => (
            <div className={styles.medalSlot} key={`${set.id}-${index}`}>
              {medal ? (
                <>
                  <span className={styles.medalPlate}>
                    <MedalArtwork medal={medal} sizes="82px" className={styles.medalImage} />
                  </span>
                  <strong>{formatMedalName(medal.name)}</strong>
                </>
              ) : (
                <div className={styles.missingMedal}>
                  <span aria-hidden="true">?</span>
                  <strong>{`Medal not found: ${medalId}`}</strong>
                </div>
              )}
            </div>
          ))}
        </div>

        <span className={styles.viewSet}>View Set <span aria-hidden="true">→</span></span>
      </Link>
    </article>
  );
}
