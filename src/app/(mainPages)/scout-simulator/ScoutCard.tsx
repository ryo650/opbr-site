import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/data/characters/type";
import type { ScoutBanner } from "@/data/scouts/type";
import styles from "./page.module.css";

type ScoutCardProps = {
  scout: ScoutBanner;
  characters: Record<string, Character>;
  showMetaMeter?: boolean;
};

function formatDateRange(startAt: string, endAt: string): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startAt))} 〜 ${formatter.format(new Date(endAt))}`;
}

export default function ScoutCard({ scout, characters, showMetaMeter = false }: ScoutCardProps) {
  const pickupCharacters = scout.pickups.flatMap((pickup) => {
    const character = characters[pickup.characterId];

    return character ? [character] : [];
  });
  const metaCharacterCount = pickupCharacters.filter(
    (character) => character.grade === "ex" || character.grade === "bf",
  ).length;

  return (
    <article className={styles.scoutCard}>
      <div className={styles.banner}>
        <Image
          src={`${scout.bannerImg}.webp`}
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
          <div className={styles.pickupCharacters}>
            {pickupCharacters.map((character) => (
              <div className={styles.pickupCharacter} key={character.id}>
                <Image src={character.image} alt={character.name} width={64} height={64} />
                <span>{character.name}</span>
              </div>
            ))}
          </div>
        </div>

        <dl className={styles.scoutFacts}>
          <div>
            <dt>開催期間</dt>
            <dd>{formatDateRange(scout.startAt, scout.endAt)}</dd>
          </div>
          {showMetaMeter && (
            <div>
              <dt>Pickup内の環境キャラ</dt>
              <dd className={styles.metaMeter}>
                <span aria-hidden="true"><i style={{ width: `${(metaCharacterCount / Math.max(pickupCharacters.length, 1)) * 100}%` }} /></span>
                {metaCharacterCount} / {pickupCharacters.length}
              </dd>
            </div>
          )}
        </dl>

        <Link className={styles.simulatorLink} href={`/scout-simulator/${scout.id}`}>
          シミュレーターへ
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
