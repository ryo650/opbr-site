import styles from "./TierList.module.css";
import Image from "next/image";
import type { CSSProperties } from "react";
import { characters } from "@/data/characters/index";
import { tierList } from "@/data/tierList";

export default function TierList() {
  return (
    <div className={styles.tierList}>
      {tierList.map((row, tierIndex) => (
        <div key={row.tier} className={styles.tier}>
          <div className={`${styles.tierLabel} ${styles[row.colorClass]}`}>
            <p>{row.tier}</p>
          </div>

          <div className={styles.tierContent}>
            {row.characterIds.map((id, characterIndex) => {
              const character = characters[id];

              if (!character) {
                return null;
              }
              return (
                <div
                  key={character.id}
                  className={styles.characterCard}
                  style={{
                    "--tier-index": tierIndex,
                    "--character-index": characterIndex,
                  } as CSSProperties}
                >
                  <Image
                    src={character.image}
                    alt={character.name}
                    width={84}
                    height={84}
                    className={styles.characterImage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
