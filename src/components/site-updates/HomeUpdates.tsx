import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomeSiteUpdates, type SiteUpdate } from "@/data/site-updates";
import SiteUpdateCard from "./SiteUpdateCard";
import styles from "./SiteUpdates.module.css";

export default function HomeUpdates({ updates }: { updates: readonly SiteUpdate[] }) {
  const selected = getHomeSiteUpdates(updates);
  return (
    <section className={styles.homeSection} aria-labelledby="home-updates-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Latest &amp; featured</p>
          <h2 id="home-updates-heading">What&apos;s new</h2>
        </div>
        <Link href="/updates" className={styles.link}>View all updates <ArrowRight aria-hidden="true" /></Link>
      </div>
      {selected.length ? (
        <ol className={styles.homeList} aria-label="Featured and recent site updates">
          {selected.map((update) => <li key={update.id}><SiteUpdateCard update={update} compact /></li>)}
        </ol>
      ) : <p className={styles.emptyNote}>New additions to OPBR Guide will appear here.</p>}
      <p className={styles.dateNote}>Dates show when content was added to this site (UTC).</p>
    </section>
  );
}
