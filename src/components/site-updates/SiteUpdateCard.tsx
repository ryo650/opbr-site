import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteUpdateCategoryLabels, type SiteUpdate } from "@/data/site-updates";
import styles from "./SiteUpdates.module.css";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function SiteUpdateCard({ update, compact = false }: {
  update: SiteUpdate;
  compact?: boolean;
}) {
  const Heading = compact ? "h3" : "h2";
  return (
    <article
      className={`${styles.card} ${compact ? styles.compact : ""} ${update.image ? "" : styles.withoutImage}`}
      aria-labelledby={`update-${update.id}`}
    >
      <div className={styles.meta}>
        <time dateTime={update.date}>{dateFormatter.format(new Date(`${update.date}T00:00:00Z`))}</time>
        <span className={styles.badge}>{siteUpdateCategoryLabels[update.category]}</span>
        {compact && update.featuredRank !== undefined && <span className={styles.featuredBadge}>Featured</span>}
      </div>
      <Heading id={`update-${update.id}`} className={styles.title}>{update.title}</Heading>
      {update.image && (
        <div
          className={`${styles.media} ${update.image.kind === "medal" ? styles.medal : ""}`}
          style={{ aspectRatio: `${update.image.width} / ${update.image.height}` }}
        >
          <Image
            src={update.image.src}
            alt={update.image.alt}
            width={update.image.width}
            height={update.image.height}
            sizes={compact ? "(max-width: 540px) 96px, 180px" : "(max-width: 540px) 96px, 200px"}
            className={styles.artwork}
          />
        </div>
      )}
      <p className={styles.description}>{update.description}</p>
      <ul className={styles.links} aria-label={`Related pages for ${update.title}`}>
        {update.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.link}>{link.label} <ArrowRight aria-hidden="true" /></Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
