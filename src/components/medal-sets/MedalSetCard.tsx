import Image from "next/image";
import type { Medal } from "@/data/medals";
import {
  formatMedalEffectCondition,
  formatMedalEffectValue,
  getActiveTagSetEffects,
} from "@/data/medals/active-tag-set-effects";
import type { MedalSetCategory, RecommendedMedalSet } from "@/data/medal-sets";
import styles from "./MedalSets.module.css";

export const medalSetCategoryLabels: Record<MedalSetCategory, string> = {
  general: "General",
  attack: "Attack",
  durability: "Durability",
  "capture-speed": "Capture Speed",
  "skill-1": "Skill 1",
  "skill-2": "Skill 2",
  "skill-1-and-2": "Skill 1 & 2",
};

type Props = {
  set: RecommendedMedalSet;
  medalById: ReadonlyMap<string, Medal>;
};

export default function MedalSetCard({ set, medalById }: Props) {
  const slots = set.medalIds.map((medalId) => ({
    medalId,
    medal: medalId ? medalById.get(medalId) : undefined,
  }));
  const selectedMedals = slots.flatMap(({ medal }) => (medal ? [medal] : []));
  const activeTags = getActiveTagSetEffects(selectedMedals);

  return (
    <article className={styles.card}>
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
                <div className={styles.medalImage}>
                  <Image
                    src={`/medals/${medal.id}.webp`}
                    alt={`${medal.name} artwork`}
                    fill
                    sizes="(max-width: 600px) 72px, 92px"
                  />
                </div>
                <strong>{medal.name}</strong>
              </>
            ) : (
              <div className={styles.missingMedal}>
                <span aria-hidden="true">?</span>
                <strong>{medalId ? `Medal not found: ${medalId}` : "Medal ID not set"}</strong>
              </div>
            )}
          </div>
        ))}
      </div>

      <details className={styles.details}>
        <summary>View Details</summary>
        <div className={styles.detailsBody}>
          <section>
            <h3>Unique Traits</h3>
            <div className={styles.traitList}>
              {slots.map(({ medalId, medal }, index) => (
                <div key={`${set.id}-trait-${index}`}>
                  <h4>{medal?.name ?? (medalId ? `Unknown medal: ${medalId}` : `Medal ${index + 1}`)}</h4>
                  <p>{medal?.uniqueTrait ?? "Add a valid medal ID to display its unique trait."}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Active Tags</h3>
            {activeTags.length ? (
              <div className={styles.effectList}>
                {activeTags.map((effect) => (
                  <div className={styles.effect} key={`${effect.groupId}-${effect.tagId}`}>
                    <h4>{effect.tagName} ×{effect.setSize}</h4>
                    <p>
                      {effect.effectLabel} +{formatMedalEffectValue(effect.value, effect.valueSchema)}
                    </p>
                    {effect.condition && <small>{formatMedalEffectCondition(effect.condition)}</small>}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyDetails}>No active 2- or 3-medal tag effects.</p>
            )}
          </section>
        </div>
      </details>
    </article>
  );
}
