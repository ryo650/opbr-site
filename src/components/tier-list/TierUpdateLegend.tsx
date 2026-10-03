import { tierChangeLabels } from "@/lib/tier-important-updates";
import type { TierChangeKind } from "@/data/tier-important-updates";
import styles from "./TierUpdateBadge.module.css";

const kinds: TierChangeKind[] = ["rise", "fall", "new", "adjustment"];

export default function TierUpdateLegend({ count }: { count: number }) {
  return (
    <aside className={styles.legend} aria-label="Important update markers">
      <div className={styles.legendHeading}>
        <div>
          <p className={styles.legendKicker}>Tier List updated</p>
          <h3>Latest Tier Changes</h3>
          <p className={styles.legendCount}>{count} {count === 1 ? "character" : "characters"} highlighted in the rankings below</p>
        </div>
        <a className={styles.legendLink} href="#tier-important-update">See update details <span aria-hidden="true">↓</span></a>
      </div>
      <ul>{kinds.map((kind) => (
        <li key={kind}>
          <span className={`${styles.legendSymbol} ${styles[kind]}`} aria-hidden="true">{tierChangeLabels[kind].symbol}</span>
          {tierChangeLabels[kind].label}
        </li>
      ))}</ul>
    </aside>
  );
}
