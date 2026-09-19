import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { beginnerGuideSections } from "@/data/beginner-guide";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/beginner-guide" },
  title: "Beginner Guide",
  description:
    "A practical eight-step roadmap for reaching SS League in ONE PIECE Bounty Rush.",
  robots: { index: false, follow: true },
};

export default function BeginnerGuidePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${styles.page} upper-page-background`}
    >
      <div className={styles.inner}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Beginner Guide</p>
            <h1>How to Reach SS League</h1>
            <p className={styles.introduction}>
              You do not need perfect characters, medals, or Hyper Boost to
              reach SS League. Start with the fundamentals, strengthen your
              account one step at a time, and focus on the choices that have
              the biggest impact in battle.
            </p>
          </div>

          <div className={styles.heroEmblem}>
            <Image
              src="/beginner-guide/ss-league.webp"
              alt="SS League emblem"
              width={656}
              height={600}
              className={styles.emblemImage}
              preload
            />
          </div>
        </header>

        <section className={styles.guide} aria-label="Roadmap to SS League">
          <ol className={styles.roadmap}>
            {beginnerGuideSections.map((section, index) => {
              const stepNumber = String(index + 1).padStart(2, "0");

              return (
                <li className={styles.step} key={section.title}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {stepNumber}
                  </span>

                  <article
                    className={`${styles.stepContent} ${
                      section.image ? styles.stepWithImage : ""
                    }`}
                  >
                    <div className={styles.stepText}>
                      <p className={styles.stepLabel}>Step {stepNumber}</p>
                      <h2>{section.title}</h2>
                      <p className={styles.summary}>{section.summary}</p>

                      {section.paragraphs.map((paragraph) => (
                        <p className={styles.paragraph} key={paragraph}>
                          {paragraph}
                        </p>
                      ))}

                      {section.bullets.length > 0 && (
                        <ul className={styles.bullets}>
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

                      {section.internalLink && (
                        <Link
                          href={section.internalLink.href}
                          className={styles.cta}
                        >
                          {section.internalLink.label}
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      )}
                    </div>

                    {section.image && (
                      <figure className={styles.guideImageWrap}>
                        <Image
                          src={section.image.src}
                          alt={section.image.alt}
                          fill
                          sizes="(max-width: 767px) 100vw, 38vw"
                          className={styles.guideImage}
                        />
                      </figure>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
