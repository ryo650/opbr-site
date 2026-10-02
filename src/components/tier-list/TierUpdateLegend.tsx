import { tierChangeLabels } from "@/lib/tier-important-updates";
import type { TierChangeKind } from "@/data/tier-important-updates";
import styles from "./TierUpdateBadge.module.css";

const kinds: TierChangeKind[] = ["rise", "fall", "new", "adjustment"];

export default function TierUpdateLegend() {
  return (
    <aside className={styles.legend} aria-label="Important update markers">
      <a className={styles.legendLink} href="#tier-important-update">Important changes · Review below ↓</a>
      <ul>{kinds.map((kind) => (
        <li key={kind}>
          <span className={`${styles.legendSymbol} ${styles[kind]}`} aria-hidden="true">{tierChangeLabels[kind].symbol}</span>
          {tierChangeLabels[kind].label}
        </li>
      ))}</ul>
    </aside>
  );
}
