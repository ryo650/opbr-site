"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function CollapsibleText({ children }: { children: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const measure = () => {
      if (!expanded) setCanExpand(text.scrollHeight > text.clientHeight + 1);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(text);

    return () => resizeObserver.disconnect();
  }, [children, expanded]);

  return (
    <div className={styles.collapsibleText}>
      <p
        ref={textRef}
        className={!expanded ? styles.clampedText : undefined}
      >
        {children}
      </p>
      {canExpand && (
        <button
          type="button"
          className={styles.readMoreButton}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
