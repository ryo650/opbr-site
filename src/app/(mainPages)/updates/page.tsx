import type { Metadata } from "next";
import { siteUpdates } from "@/data/site-updates";
import UpdatesList from "./UpdatesList";
import styles from "./page.module.css";

const description = "See what's new on OPBR Guide, including newly added content, guides, and site features.";

export const metadata: Metadata = {
  title: "Updates",
  description,
  alternates: { canonical: "/updates" },
  openGraph: {
    title: "Updates | OPBR Guide",
    description,
    url: "/updates",
    type: "website",
  },
};

export default function UpdatesPage() {
  return (
    <main id="main-content" tabIndex={-1} className={`${styles.page} upper-page-background`}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>What&apos;s new on OPBR Guide</p>
          <h1>Updates</h1>
          <p className={styles.lead}>New content, guides, and improvements to help you explore more of OPBR Guide.</p>
          <p className={styles.dateNote}>Dates show when content was added to this site (UTC).</p>
        </header>
        <UpdatesList updates={siteUpdates} />
      </div>
    </main>
  );
}
