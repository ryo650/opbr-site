import LinkCard from "@/components/tables/LinkCard"
import styles from "./page.module.css"
import { Link } from "lucide-react"

const cards = [
  {
    title: "OPBR Guide",
    description:
      "Your go-to resource for One Piece Bounty Rush guides, character rankings, and meta updates.",
    href: "/",
    image: "/home/guide.webp",
    buttonText: "Explore Guides",
    variant: "large" as const,
  },
  {
    title: "OPBR Tier List",
    description:
      "Check the best characters in One Piece Bounty Rush ranked by current meta strength.",
    href: "/tier-list",
    image: "/home/tier-list-2.webp",
    buttonText: "View Tier List",
    variant: "normal" as const,
  },
  {
    title: "New Characters",
    description:
      "Stay updated with the latest characters added to One Piece Bounty Rush.",
    href: "/new-characters",
    image: "/home/new-characters.webp",
    buttonText: "View New Characters",
    variant: "normal" as const,
  },
  {
    title: "medal sets",
    description:
      "Explore the best medal sets for each character in One Piece Bounty Rush.",
    href: "/medal-sets",
    image: "/home/medal-sets.webp",
    buttonText: "View Medal Sets",
    variant: "normal" as const,
  },
  {
    title: "begginer guide",
    description:
      "A simple and practical guide for beginners in One Piece Bounty Rush.",
    href: "/beginner-guide",
    image: "/home/beginner-guide2.webp",
    buttonText: "View Beginner Guide",
    variant: "normal" as const,
  },
  {
    title: "Create Tier List",
    description:
      "Create your own tier list for One Piece Bounty Rush characters and share it with others.",
    href: "/create-tier-list",
    image: "/home/create-tier-list.webp",
    buttonText: "Create Tier List",
    variant: "normal" as const,
  },
  {
    title: "Scout Simulator",
    description:
      "Simulate scout pulls in One Piece Bounty Rush and see what characters you can get.",
    href: "/scout-simulator",
    image: "/home/scout-simulator-2.webp",
    buttonText: "Try Scout Simulator",
    variant: "normal" as const,
  }
]

export default function TopPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
      <section className={styles.hero}>
        <h1>OPBR Guide</h1>
        <p>
          Simple and practical OPBR guides for characters rankings, meta updates,
          and new characters.
        </p>
      </section>

      <section className={styles.contents}>
        <LinkCard {...cards[0]} />

        <div className={styles.cardGrid}>
          {cards.slice(1).map((card) => (
            <LinkCard key={card.title} {...card} />
          ))}
        </div>
      </section>
      </div>
    </main>
  )
}
