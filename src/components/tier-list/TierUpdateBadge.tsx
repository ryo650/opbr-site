"use client";

import { useEffect, useState } from "react";
import { tierChangeLabels, type TierUpdateBadge as Badge } from "@/lib/tier-important-updates";
import styles from "./TierUpdateBadge.module.css";

export default function TierUpdateBadge({ badge, characterName, preview = false }: { badge: Badge; characterName: string; preview?: boolean }) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (preview) return;
    // Recheck at most daily (avoids the browser's 32-bit timeout overflow).
    let timer: ReturnType<typeof setTimeout>;
    function check() {
      const remaining = badge.expiresAt - Date.now();
      setExpired(remaining <= 0);
      if (remaining > 0) timer = setTimeout(check, Math.min(remaining, 24 * 60 * 60 * 1000));
    }
    check();
    return () => clearTimeout(timer);
  }, [badge.expiresAt, preview]);
  if (expired) return null;
  const { label, symbol } = tierChangeLabels[badge.kind];
  return (
    <span className={`${styles.frame} ${styles[badge.kind]}`}>
      {(badge.kind === "rise" || badge.kind === "fall") && (
        <span className={styles.directionMotion} aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => <span className={styles.lightStreak} key={index} />)}
        </span>
      )}
      <a className={styles.badge} href="#tier-important-update" aria-label={`${characterName}: ${label}. Read important update summary.`}>
        <span className={styles.badgeSymbol} aria-hidden="true">{symbol}</span>
        <span className={styles.badgeLabel} aria-hidden="true">{label}</span>
      </a>
    </span>
  );
}
