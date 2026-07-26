import Image from "next/image";
import type { Character } from "@/data/characters/type";
import styles from "./CharacterFrame.module.css";

const gradeLabels: Record<Character["grade"], string> = {
  ex: "EX",
  bf: "BF",
  sp: "SP",
  "star-4": "4★",
  "star-3": "3★",
  "star-2": "2★",
  free: "FREE",
  exchange: "EXCH",
  cola: "COLA",
  unknown: "?",
};

const gradeStyles: Record<Character["grade"], string> = {
  ex: styles.ex,
  bf: styles.bf,
  sp: styles.sp,
  "star-4": styles.star4,
  "star-3": styles.star3,
  "star-2": styles.star2,
  free: styles.free,
  exchange: styles.exchange,
  cola: styles.cola,
  unknown: styles.unknown,
};

type CharacterFrameProps = {
  character: Character;
  size?: "result" | "compact";
};

export default function CharacterFrame({
  character,
  size = "result",
}: CharacterFrameProps) {
  const sizeClass = size === "compact" ? styles.compact : "";
  const imageSize = size === "compact" ? 64 : 112;

  return (
    <div className={`${styles.frame} ${gradeStyles[character.grade]} ${sizeClass}`}>
      <span className={styles.badge}>{gradeLabels[character.grade]}</span>
      <Image
        className={styles.image}
        src={character.image}
        alt={character.name}
        width={imageSize}
        height={imageSize}
        sizes={size === "compact" ? "64px" : "72px"}
      />
    </div>
  );
}
