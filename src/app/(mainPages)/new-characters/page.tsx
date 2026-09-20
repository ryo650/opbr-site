import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { characterGuides } from "@/data/character-guides";
import { characters } from "@/data/characters";
import {
  getActiveNewCharacterReleases,
  getNewCharacterExpiry,
} from "@/data/new-characters";
import styles from "./page.module.css";

// Re-check time-based visibility hourly without requiring a new deployment.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/new-characters" },
  title: "New OPBR Characters and Guides",
  description:
    "Explore recently released One Piece Bounty Rush characters, with links to their OPBR skills, strengths, weaknesses, counters, and gameplay guides.",
  openGraph: {
    title: "New OPBR Characters and Guides",
    description:
      "Explore recent One Piece Bounty Rush characters and their gameplay guides.",
    url: "/new-characters",
  },
  robots: { index: true, follow: true },
};

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(typeof date === "string" ? new Date(`${date}T00:00:00.000Z`) : date);

export default function NewCharactersPage() {
  const releases = getActiveNewCharacterReleases().map((release) => {
    const character = characters[release.characterId];
    const guide = characterGuides[release.characterId];

    if (!character) {
      throw new Error(`New character not found in character data: ${release.characterId}`);
    }
    if (!guide) {
      throw new Error(`New character does not have a Character Guide: ${release.characterId}`);
    }

    return { ...release, character };
  });

  return (
    <main id="main-content" tabIndex={-1} className={`${styles.page} upper-page-background`}>
      <div className={styles.content}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Recently released</p>
          <h1>New OPBR Characters</h1>
          <p>
            Meet the latest One Piece Bounty Rush characters and open their guides
            for skills, strengths, weaknesses, counters, and practical gameplay tips.
          </p>
        </header>

        {releases.length ? (
          <section className={styles.grid} aria-label="New character guides">
            {releases.map(({ characterId, releaseDate, character }) => (
              <Link
                className={styles.card}
                href={`/characters/${characterId}`}
                key={characterId}
              >
                <div className={styles.portraitWrap}>
                  <Image
                    className={styles.portrait}
                    src={character.image}
                    alt=""
                    width={320}
                    height={320}
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.releaseDate}>Released {formatDate(releaseDate)}</p>
                  <h2>{character.name}</h2>
                  <p className={styles.characterMeta}>
                    {character.element} element · {character.role}
                  </p>
                  <p className={styles.availability}>
                    Listed until {formatDate(getNewCharacterExpiry(releaseDate))}
                  </p>
                  <span className={styles.action}>View Character Guide <ArrowRight aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className={styles.empty}>
            <h2>No recent releases right now</h2>
            <p>New Character Guides will appear here for two months after release.</p>
          </section>
        )}
      </div>
    </main>
  );
}
