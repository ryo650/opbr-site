import Image from "next/image";
import { Check } from "lucide-react";
import type { Medal } from "@/data/medals/type";
import styles from "./MedalBuilder.module.css";

export default function MedalCard({ medal, selected, disabled, onSelect }: { medal: Medal; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return <button className={`${styles.medalCard} ${selected ? styles.selected : ""}`} onClick={onSelect} disabled={disabled && !selected} aria-pressed={selected}>
    <span className={styles.medalArt}><Image src={medal.image} alt="" width={112} height={112} /></span>
    <span className={styles.cardCopy}><strong>{medal.name}</strong><small>{medal.category === "event" ? "Event Medal" : "Character Medal"}</small></span>
    {selected && <span className={styles.selectedMark}><Check aria-hidden="true" /> Selected</span>}
  </button>;
}
