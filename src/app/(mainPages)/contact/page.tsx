import type { Metadata } from "next";
import styles from "./page.module.css";

const contactEmail = "opbrsite.contact@gmail.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact OPBR Guide for inquiries, information corrections, and feedback about the ONE PIECE Bounty Rush fan site.",
};

export default function ContactPage() {
  return (
    <main className={`${styles.page} upper-page-background`}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Contact</p>
          <h1>Get in touch</h1>
          <p className={styles.lead}>
            For site inquiries, information corrections, or feedback about OPBR
            Guide, please contact us by email.
          </p>
        </section>

        <section className={styles.content} aria-label="Contact information">
          <article className={styles.card}>
            <h2>Email</h2>
            <p>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
            <p>
              A contact form is not available at this time. Please include the
              page URL and relevant details when requesting a correction.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
