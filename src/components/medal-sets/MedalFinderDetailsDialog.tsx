"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Medal } from "@/data/medals";
import MedalArtwork from "@/components/medals/MedalArtwork";
import MedalInformation from "@/components/medals/MedalInformation";
import styles from "./MedalFinderDetailsDialog.module.css";

type Props = {
  medal: Medal;
  selected: boolean;
  slotNumber: number | null;
  onAdd: () => void;
  onClose: () => void;
};

const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MedalFinderDetailsDialog({
  medal,
  selected,
  slotNumber,
  onAdd,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

  return createPortal(
    <div className={styles.layer}>
      <button type="button" className={styles.backdrop}
        aria-label="Close medal details" onClick={onClose} />
      <section className={styles.dialog} ref={dialogRef} role="dialog"
        aria-modal="true" aria-labelledby="finder-medal-detail-title">
        <div className={styles.handle} aria-hidden="true" />
        <button type="button" className={styles.close} ref={closeRef}
          onClick={onClose} aria-label="Close medal details">×</button>
        <header className={styles.header}>
          <MedalArtwork medal={medal} sizes="(max-width: 650px) 94px, 140px" className={styles.artwork} />
          <div>
            <span className={styles.category}>{medal.category}</span>
            <h2 id="finder-medal-detail-title">{medal.name}</h2>
          </div>
        </header>
        <MedalInformation medal={medal} />
        <footer className={styles.footer}>
          {selected
            ? <span className={styles.state}>Already in your set</span>
            : slotNumber !== null
              ? <button type="button" className={styles.add} onClick={onAdd}>
                  {slotNumber === 1 ? "Add to Slot 1 · Find combinations" : `Add to Slot ${slotNumber}`}
                </button>
              : <span className={styles.state}>Set is complete</span>}
          <button type="button" className={styles.dismiss} onClick={onClose}>Close</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
