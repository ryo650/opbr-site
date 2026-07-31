import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import styles from "./page.module.css"

const featuredCards = [
  {
    eyebrow: "Updated rankings",
    title: "OPBR Tier List",
    description:
      "See the strongest characters in the current meta and find the best picks for your team.",
    href: "/tier-list",
    image: "/home/tier-list-2.webp",
    action: "View Tier List",
  },
  {
    eyebrow: "Try your luck",
    title: "Scout Simulator",
    description:
      "Test current scout banners with in-game rates before you spend your diamonds.",
    href: "/scout-simulator",
    image: "/home/scout-simulator-2.webp",
    action: "Open Simulator",
  },
]

const exploreCards = [
  {
    title: "New Characters",
    description: "Latest character releases, traits, and updates.",
    href: "/new-characters",
    image: "/home/new-characters.webp",
  },
  {
    title: "Medal Sets",
    description: "Find practical medal combinations for your characters.",
    href: "/medal-sets",
    image: "/home/medal-sets.webp",
  },
  {
    title: "Beginner Guide",
    description: "Learn the essentials and build a stronger account.",
    href: "/beginner-guide",
    image: "/home/beginner-guide2.webp",
  },
  {
    title: "Create Tier List",
    description: "Build and share your own OPBR character ranking.",
    href: "/create-tier-list",
    image: "/home/create-tier-list.webp",
  },
]

export default function TopPage() {
  return (
    <main className={`${styles.page} upper-page-background`}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>One Piece Bounty Rush Guide</p>
          <h1>
            Build a stronger team.
            <span>Play the meta with confidence.</span>
          </h1>
          <p className={styles.heroDescription}>
            Current tier rankings, scout simulations, medal sets, and practical
            guides—all in one place.
          </p>
          <div className={styles.heroActions}>
            <Link href="/tier-list" className={styles.primaryAction}>
              Explore Tier List <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/scout-simulator" className={styles.secondaryAction}>
              <Sparkles aria-hidden="true" /> Try Scout Simulator
            </Link>
          </div>
        </section>

        <section className={styles.featured} aria-labelledby="featured-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionKicker}>Start here</p>
              <h2 id="featured-heading">Essential OPBR tools</h2>
            </div>
            <p>Quick answers for the decisions that matter most.</p>
          </div>

          <div className={styles.featuredGrid}>
            {featuredCards.map((card) => (
              <Link href={card.href} className={styles.featuredCard} key={card.title}>
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className={styles.featuredImage}
                />
                <span className={styles.featuredOverlay} />
                <span className={styles.featuredContent}>
                  <span className={styles.cardEyebrow}>{card.eyebrow}</span>
                  <strong>{card.title}</strong>
                  <span className={styles.cardDescription}>{card.description}</span>
                  <span className={styles.cardAction}>
                    {card.action} <ArrowRight aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.explore} aria-labelledby="explore-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionKicker}>Explore more</p>
              <h2 id="explore-heading">Guides for every step</h2>
            </div>
          </div>

          <div className={styles.exploreGrid}>
            {exploreCards.map((card) => (
              <Link href={card.href} className={styles.exploreCard} key={card.title}>
                <span className={styles.thumbnail}>
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 116px, 240px"
                    className={styles.exploreImage}
                  />
                </span>
                <span className={styles.exploreContent}>
                  <strong>{card.title}</strong>
                  <span>{card.description}</span>
                  <span className={styles.textLink}>
                    Explore <ArrowRight aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
