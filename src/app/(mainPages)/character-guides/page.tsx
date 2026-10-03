import type { Metadata } from "next";
import Link from "next/link";
import { characterGuides } from "@/data/character-guides";
import { characters } from "@/data/characters";
import { createCharacterGuideEntries } from "@/lib/character-guide-directory";
import CharacterGuideDirectory from "./CharacterGuideDirectory";
import styles from "./page.module.css";

const title = "OPBR Character Guides";
const description = "Browse all published One Piece Bounty Rush character guides. Find skills, strengths, weaknesses, counters, and gameplay tips by character, element, or role.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: "/character-guides" },
  openGraph: { type: "website", title, description, url: "/character-guides" },
  twitter: { card: "summary", title, description },
  robots: { index: true, follow: true },
};

export default function CharacterGuidesPage() {
  const entries = createCharacterGuideEntries(characterGuides, characters);
  return (
    <main id="main-content" tabIndex={-1} className={`${styles.page} upper-page-background`}>
      <div className={styles.content}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Character Guides</span>
        </nav>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Find your character</p>
          <h1>Character Guides</h1>
          <p>Explore skills, strengths, weaknesses, counters, and practical gameplay tips.
            All published guides stay here, including earlier releases.</p>
          <Link href="/new-characters" className={styles.relatedLink}>Looking for recent releases? View New Characters</Link>
        </header>
        <CharacterGuideDirectory entries={entries} />
      </div>
    </main>
  );
}
