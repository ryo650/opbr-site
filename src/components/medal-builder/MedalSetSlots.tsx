import Image from "next/image";
import { X } from "lucide-react";
import type { Medal } from "@/data/medals/type";
import styles from "./MedalBuilder.module.css";

export default function MedalSetSlots({ selected, onRemove }: { selected: Medal[]; onRemove: (id: string) => void }) {
  return <section className={styles.setBar} aria-labelledby="current-set"><div className={styles.setHeading}><div><p>Current medal set</p><h2 id="current-set">Your selected medals</h2></div><span>{selected.length} / 3</span></div>
    <div className={styles.slots}>{[0,1,2].map((index) => { const medal=selected[index]; return <div className={`${styles.slot} ${medal ? styles.filledSlot : ""}`} key={index}>{medal ? <><Image src={medal.image} alt="" width={66} height={66}/><span><strong>{medal.name}</strong><small>{medal.category} medal</small></span><button onClick={() => onRemove(medal.id)} aria-label={`Remove ${medal.name}`}><X /></button></> : <><b>{index+1}</b><span><strong>Empty slot</strong><small>Select a medal below</small></span></>}</div>})}</div>
  </section>;
}
