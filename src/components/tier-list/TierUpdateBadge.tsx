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
  return <a className={`${styles.badge} ${styles[badge.kind]}`} href="#tier-important-update" aria-label={`${characterName}: ${label}. Read important update summary.`}><span aria-hidden="true">{symbol}</span></a>;
}
