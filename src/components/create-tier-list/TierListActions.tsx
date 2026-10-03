"use client";

import type { useTierListPersistence } from "./useTierListPersistence";
import styles from "./CreateTierList.module.css";

type Persistence = ReturnType<typeof useTierListPersistence>;

export default function TierListActions({ persistence }: { persistence: Persistence }) {
  const { session, isDirty, save, restore, copyForEditing, share, copyLink, download, importFile, loadPending, keepEditing } = persistence;
  return <section className={styles.persistence} aria-label="Save and share tier list">
    <div className={styles.persistenceHeading}>
      <h2>{session.shared ? "Shared tier list" : "Save & share"}</h2>
      <span className={styles.saveStatus}>{!session.ready ? "Loading…" : session.shared ? "Viewing a snapshot" : isDirty ? "Unsaved changes" : session.saved ? "Saved in this browser" : "No browser save yet"}</span>
    </div>
    <p className={styles.persistenceHelp}>One save is kept in this browser only. Shared links are copies at the time of creation; they do not sync with later edits.</p>
    <div className={styles.persistenceActions}>
      {session.shared ? <button type="button" className={styles.primaryAction} onClick={copyForEditing}>Copy & edit my own list</button>
        : <button type="button" className={styles.primaryAction} disabled={!session.ready} onClick={save}>Save in this browser</button>}
      <button type="button" disabled={!session.ready || !session.saved} onClick={restore}>Restore browser save</button>
      <button type="button" disabled={!session.ready || session.busy} onClick={() => void share()}>{session.busy ? "Creating link…" : "Create share link"}</button>
      <button type="button" disabled={!session.ready} onClick={download}>Download file</button>
      <label className={styles.importAction}>Import file<input type="file" accept=".json,application/json" disabled={!session.ready} onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) void importFile(file);
      }} /></label>
    </div>
    <p className={styles.persistenceMessage} role="status" aria-live="polite">{session.message}</p>
    {session.pending && <div className={styles.pendingLoad} role="group" aria-label="Unsaved changes">
      <p>Loading “{session.pending.document.title || "Untitled tier list"}” will replace your unsaved edits. Your browser save will stay intact.</p>
      <div className={styles.persistenceActions}>
        <button type="button" onClick={loadPending}>Discard edits & load list</button>
        <button type="button" className={styles.primaryAction} onClick={keepEditing}>Keep editing</button>
      </div>
    </div>}
    {session.shareUrl && <div className={styles.shareLink}>
      <label>Share link<input aria-label="Share link" readOnly value={session.shareUrl} onFocus={(event) => event.target.select()} /></label>
      <button type="button" onClick={() => void copyLink()}>Copy link</button>
    </div>}
  </section>;
}
