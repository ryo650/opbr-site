import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSortedSiteUpdates, type SiteUpdate } from "@/data/site-updates";
import SiteUpdateCard from "@/components/site-updates/SiteUpdateCard";
import styles from "@/components/site-updates/SiteUpdates.module.css";

export default function UpdatesList({ updates }: { updates: readonly SiteUpdate[] }) {
  if (updates.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No updates yet</h2>
        <p>New additions to OPBR Guide will appear here. Explore the site while you wait.</p>
        <Link href="/" className={styles.link}>Explore OPBR Guide <ArrowRight aria-hidden="true" /></Link>
      </div>
    );
  }

  return (
    <ol className={styles.list} aria-label="Site updates, newest first">
      {getSortedSiteUpdates(updates).map((update) => (
        <li key={update.id}><SiteUpdateCard update={update} /></li>
      ))}
    </ol>
  );
}
