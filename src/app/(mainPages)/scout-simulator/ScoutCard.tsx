import Image from "next/image";
import Link from "next/link";
import CharacterFrame from "@/components/character-frame/CharacterFrame";
import type { Character } from "@/data/characters/type";
import type { ScoutBanner } from "@/data/scouts/type";
import styles from "./page.module.css";

type ScoutCardProps = {
  scout: ScoutBanner;
  characters: Record<string, Character>;
};

function formatDateRange(startAt: string, endAt: string): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startAt))} 〜 ${formatter.format(new Date(endAt))}`;
}

export default function ScoutCard({ scout, characters }: ScoutCardProps) {
  const pickupCharacters = scout.pickups.flatMap((pickup) => {
    const character = characters[pickup.characterId];

    return character ? [character] : [];
  });

  return (
    <article className={styles.scoutCard}>
      <div className={styles.banner}>
        <Image
          src={`${scout.bannerImg}`}
          alt={`${scout.name} banner`}
          fill
          sizes="(max-width: 699px) 100vw, 360px"
          className={styles.bannerImage}
        />
        <div className={styles.bannerShade} />
        <h3>{scout.name}</h3>
      </div>

      <div className={styles.details}>
        <div>
          <p className={styles.detailLabel}>PICKUP</p>
          <div className={styles.pickupCharacters} tabIndex={0} role="region" aria-label={`${scout.name} pickup characters`}>
            {pickupCharacters.map((character) => (
              <div className={styles.pickupCharacter} key={character.id}>
                <CharacterFrame character={character} size="compact" />
                <span className={styles.pickupName}>{character.name}</span>
              </div>
            ))}
          </div>
        </div>

        <dl className={styles.scoutFacts}>
          <div>
            <dt>Scout Period</dt>
            <dd>{formatDateRange(scout.startAt, scout.endAt)} JST</dd>
          </div>

        </dl>

        <Link className={styles.simulatorLink} href={`/scout-simulator/${scout.id}`} prefetch={false}>
          Open Simulator
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
