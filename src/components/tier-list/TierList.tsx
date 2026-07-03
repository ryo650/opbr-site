import styles from "./TierList.module.css";
import Image from "next/image";
import { characters } from "@/data/characters/index";
import { tierList } from "@/data/tierList";

export default function TierList() {
  return (
    <div>

      {/* Tier List */}
      <div className={styles.tierList}>
        {tierList.map((row) => (
          <div key={row.tier} className={styles.tier}>
            <div className={`${styles.tierLabel} ${styles[row.colorClass]}`}>
              <p>{row.tier}</p>
            </div>

            <div className={styles.tierContent}>
              {row.characterIds.map((id) => {
                const character = characters[id];

                if (!character) {
                  return null;
                }
                return (
                <div key={character.id} className={styles.characterCard}>
                  <Image
                    src={character.image}
                    alt={character.name}
                    width={60}
                    height={60}
                    className={styles.characterImage}
                  />
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
