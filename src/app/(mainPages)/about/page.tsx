import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about OPBR Guide, an unofficial fan site offering tier lists, character information, scout simulator tools, and guides for ONE PIECE Bounty Rush players.",
};

export default function AboutPage() {
  return (
    <main className={`${styles.page} upper-page-background`}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>About this site</p>
          <h1>OPBR Guide for players</h1>
          <p className={styles.lead}>
            OPBR Guide is an unofficial fan site created for ONE PIECE Bounty
            Rush players who want practical information for building teams,
            comparing characters, and planning scouts.
          </p>
        </section>

        <section className={styles.content} aria-label="About OPBR Guide">
          <article className={styles.card}>
            <h2>What we provide</h2>
            <p>
              The site shares player-focused resources such as Tier List pages,
              Character information, Scout Simulator tools, medal and beginner
              Guide content, and other references that help players understand
              the game more easily.
            </p>
          </article>

          <article className={styles.card}>
            <h2>Unofficial fan project</h2>
            <p>
              OPBR Guide is not affiliated with, endorsed by, sponsored by, or
              approved by Bandai Namco Entertainment Inc., Bandai Namco
              Entertainment, Toei Animation, Shueisha, Eiichiro Oda, or any
              official ONE PIECE Bounty Rush operator or rights holder.
            </p>
            <p>
              Game names, character names, images, and related trademarks belong
              to their respective owners. This site is maintained as an
              informational fan resource.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
