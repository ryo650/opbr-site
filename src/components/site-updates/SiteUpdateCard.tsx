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
  const images = Array.isArray(update.image) ? update.image : [update.image].filter((image) => image !== undefined);
  const paired = images.length === 2;
  const singlePortrait = images.length === 1 && images[0].kind !== "banner";
  const singleImageSizes = compact ? "(max-width: 540px) 96px, 180px" : "(max-width: 540px) 96px, 200px";
  return (
    <article
      className={`${styles.card} ${compact ? styles.compact : ""} ${images.length ? "" : styles.withoutImage}`}
      aria-labelledby={`update-${update.id}`}
    >
      <div className={styles.meta}>
        <time dateTime={update.date}>{dateFormatter.format(new Date(`${update.date}T00:00:00Z`))}</time>
        <span className={styles.badge}>{siteUpdateCategoryLabels[update.category]}</span>
        {compact && update.featuredRank !== undefined && <span className={styles.featuredBadge}>Featured</span>}
      </div>
      <Heading id={`update-${update.id}`} className={styles.title}>{update.title}</Heading>
      {images.length > 0 && (
        <div className={`${styles.media} ${paired ? styles.pairedMedia : ""} ${singlePortrait ? styles.medal : ""}`}>
          {images.map((image) => (
            <div key={image.src} className={styles.imageFrame} style={{ aspectRatio: `${image.width} / ${image.height}` }}>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes={paired ? "96px" : singleImageSizes}
                className={styles.artwork}
              />
            </div>
          ))}
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
