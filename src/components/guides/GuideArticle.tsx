import Image from "next/image";
import type { DraftGuideSection, GuideIntro } from "@/data/guide-section";
import styles from "./GuideArticle.module.css";

export type GuideSectionTreatment =
  | "target"
  | "milestones"
  | "attacker"
  | "runner"
  | "defender"
  | "boost"
  | "extendable";

type GuideArticleProps = {
  intro: GuideIntro;
  sections: DraftGuideSection[];
  treatments?: Partial<Record<number, GuideSectionTreatment>>;
};

const treatmentClasses: Record<GuideSectionTreatment, string> = {
  target: styles.targetSection,
  milestones: styles.milestoneSection,
  attacker: styles.attackerSection,
  runner: styles.runnerSection,
  defender: styles.defenderSection,
  boost: styles.boostSection,
  extendable: styles.extendableSection,
};

export default function GuideArticle({
  intro,
  sections,
  treatments = {},
}: GuideArticleProps) {
  const hasTarget = Boolean(intro.target && intro.targetLabel);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${styles.page} upper-page-background`}
    >
      <div className={styles.inner}>
        <header
          className={`${styles.hero} ${
            hasTarget ? "" : styles.heroWithoutTarget
          }`}
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
            <h1>{intro.title}</h1>
            <p className={styles.introduction}>{intro.description}</p>
          </div>

          {intro.target && intro.targetLabel && (
            <div className={styles.heroTarget} aria-label={intro.targetLabel}>
              <strong>{intro.target}</strong>
              <span>{intro.targetLabel}</span>
            </div>
          )}
        </header>

        <section className={styles.guide} aria-label={intro.eyebrow}>
          {sections.map((section, index) => {
            const sectionNumber = String(index + 1).padStart(2, "0");
            const treatment = treatments[index];

            return (
              <article
                className={`${styles.guideSection} ${
                  section.image ? styles.sectionWithImage : ""
                } ${treatment ? treatmentClasses[treatment] : ""}`}
                key={section.title}
              >
                <div className={styles.sectionNumber} aria-hidden="true">
                  {sectionNumber}
                </div>

                <div className={styles.sectionBody}>
                  <div className={styles.sectionCopy}>
                    <h2>{section.title}</h2>
                    <p className={styles.summary}>{section.summary}</p>

                    <div className={styles.paragraphs}>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {section.terms && section.terms.length > 0 && (
                      <ul className={styles.terms} aria-label="Key terms">
                        {section.terms.map((term) => (
                          <li key={term}>{term}</li>
                        ))}
                      </ul>
                    )}

                    {section.bullets.length > 0 && (
                      <ul className={styles.checklist}>
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {section.callout && (
                      <aside className={styles.callout}>
                        <strong>{section.callout.title}</strong>
                        <p>{section.callout.text}</p>
                      </aside>
                    )}
                  </div>

                  {section.image && (
                    <figure className={styles.imageWrap}>
                      <Image
                        src={section.image.src}
                        alt={section.image.alt}
                        fill
                        sizes="(max-width: 767px) 100vw, 36vw"
                        className={styles.image}
                      />
                    </figure>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
