import Link from "next/link";
import MedalArtwork from "@/components/medals/MedalArtwork";
import type { RecommendedMedalSet, ResolvedMedalSetSlot } from "@/data/medal-sets";
import { getResolvedMedals } from "@/data/medal-sets";
import {
  formatMedalEffectCondition,
  formatMedalEffectValue,
  getActiveTagSetEffects,
} from "@/data/medals/active-tag-set-effects";
import { medalSetCategoryLabels } from "./labels";
import styles from "./MedalSetDetail.module.css";

type Props = {
  set: RecommendedMedalSet;
  slots: readonly ResolvedMedalSetSlot[];
};

export default function MedalSetDetail({ set, slots }: Props) {
  const selectedMedals = getResolvedMedals(slots);
  const activeTags = getActiveTagSetEffects(selectedMedals);
  const builderHref = `/medal-builder?medals=${encodeURIComponent(set.medalIds.join(","))}`;

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <div className={styles.inner}>
        <Link className={styles.backLink} href="/medal-sets">← Medal Sets</Link>

        <header className={styles.hero}>
          <div>
            <p className={styles.category}>{medalSetCategoryLabels[set.category]}</p>
            <h1>{set.name}</h1>
            <p className={styles.intro}>
              {set.description
                ?? `A recommended OPBR medal combination for ${medalSetCategoryLabels[set.category].toLowerCase()} builds.`}
            </p>
          </div>
          <Link className={styles.builderCta} href={builderHref}>Open in Medal Builder</Link>
        </header>

        <section className={styles.medalSection} aria-labelledby="medals-heading">
          <h2 id="medals-heading">Medals</h2>
          <div className={styles.medalGrid}>
            {slots.map(({ medalId, medal }, index) => (
              <article className={styles.medal} key={`${set.id}-${index}`}>
                {medal ? (
                  <>
                    <span className={styles.medalPlate}>
                      <MedalArtwork medal={medal} sizes="(max-width: 600px) 96px, 156px" className={styles.medalImage} />
                    </span>
                    <h3>{medal.name}</h3>
                  </>
                ) : (
                  <div className={styles.missingMedal}>
                    <span aria-hidden="true">?</span>
                    <h3>{`Medal not found: ${medalId}`}</h3>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <div className={styles.detailsGrid}>
          <section className={styles.detailSection} aria-labelledby="traits-heading">
            <h2 id="traits-heading">Unique Traits</h2>
            <div className={styles.traitList}>
              {slots.map(({ medalId, medal }, index) => (
                <article key={`${set.id}-trait-${index}`}>
                  <h3>{medal?.name ?? `Unknown medal: ${medalId}`}</h3>
                  <p>{medal?.uniqueTrait ?? "No unique trait is available for this medal ID."}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.detailSection} aria-labelledby="tags-heading">
            <h2 id="tags-heading">Active Tags</h2>
            {activeTags.length ? (
              <div className={styles.effectList}>
                {activeTags.map((effect) => (
                  <article key={`${effect.groupId}-${effect.tagId}`}>
                    <h3>{effect.tagName} ×{effect.setSize}</h3>
                    <p>{effect.effectLabel} +{formatMedalEffectValue(effect.value, effect.valueSchema)}</p>
                    {effect.condition && <small>{formatMedalEffectCondition(effect.condition)}</small>}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyDetails}>No active 2- or 3-medal tag effects.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
