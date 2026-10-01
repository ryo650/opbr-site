import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteUpdateCategoryLabels, type SiteUpdate } from "@/data/site-updates";
import styles from "./page.module.css";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

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

  const sortedUpdates = [...updates].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ol className={styles.list} aria-label="Site updates, newest first">
      {sortedUpdates.map((update) => (
        <li key={update.id}>
          <article className={styles.card} aria-labelledby={`update-${update.id}`}>
            <div className={styles.meta}>
              <time dateTime={update.date}>
                {dateFormatter.format(new Date(`${update.date}T00:00:00Z`))}
              </time>
              <span className={styles.badge}>{siteUpdateCategoryLabels[update.category]}</span>
            </div>
            <h2 id={`update-${update.id}`}>{update.title}</h2>
            <p className={styles.description}>{update.description}</p>
            <ul className={styles.links} aria-label={`Related pages for ${update.title}`}>
              {update.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label} <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}
