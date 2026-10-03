"use client";

import { useCallback, useEffect, useState } from "react";
import type { SetStateAction } from "react";
import {
  createShareUrl, emptyDocument, parseDocument, readShareHash, snapshotDocument,
  MAX_DOCUMENT_BYTES, STORAGE_KEY, validateDocument,
} from "@/lib/tier-list-document";
import type { TierListDocument, TierState } from "@/lib/tier-list-document";

type Incoming = { document: TierListDocument; shared: boolean; unsaved?: boolean };
type Session = {
  document: TierListDocument; baseline: string; ready: boolean; shared: boolean;
  saved: TierListDocument | null; pending: Incoming | null; message: string;
  shareUrl: string | null; busy: boolean;
};
const serialize = (document: TierListDocument) => JSON.stringify(document);
const errorMessage = (error: unknown, fallback: string) => error instanceof Error && error.message ? error.message : fallback;
const dirty = (session: Session) => !session.shared && serialize(session.document) !== session.baseline;
const apply = (session: Session, incoming: Incoming): Session => ({
  ...session, document: incoming.document, baseline: incoming.unsaved ? "" : serialize(incoming.document),
  shared: incoming.shared, pending: null, shareUrl: null, busy: false,
  message: incoming.shared ? "Shared snapshot loaded. Your browser save is unchanged." : incoming.unsaved ? "File imported. Save your own copy in this browser." : "Your saved tier list was restored.",
});
const offer = (session: Session, incoming: Incoming): Session => dirty(session)
  ? { ...session, pending: incoming, message: "You have unsaved changes. Load this tier list or keep editing?" }
  : apply(session, incoming);

export function useTierListPersistence(ids: string[]) {
  const [session, setSession] = useState<Session>(() => {
    const document = emptyDocument(ids);
    return { document, baseline: serialize(document), ready: false, shared: false, saved: null, pending: null, message: "", shareUrl: null, busy: false };
  });

  useEffect(() => {
    let active = true;
    let sequence = 0;
    const readSaved = (): { saved: TierListDocument | null; message: string } => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return { saved: raw ? parseDocument(raw, ids) : null, message: "" };
      } catch {
        return { saved: null, message: "Browser storage is unavailable or the saved tier list cannot be read. Download a file to keep a backup." };
      }
    };
    const navigate = async (initial = false) => {
      const request = ++sequence;
      const hash = window.location.hash;
      const { saved, message } = readSaved();
      try {
        const shared = await readShareHash(hash, ids);
        if (!active || request !== sequence) return;
        setSession((current) => {
          let next = { ...current, saved, ready: true };
          if (shared) next = offer(next, { document: shared, shared: true });
          else if (initial || current.shared) next = offer(next, { document: saved ?? emptyDocument(ids), shared: false });
          return { ...next, message: message || next.message };
        });
      } catch (error) {
        if (!active || request !== sequence) return;
        setSession((current) => ({ ...current, saved, ready: true, pending: null, message: `Could not open shared tier list. ${errorMessage(error, "The link is damaged.")} Your current list and browser save are unchanged.` }));
      }
    };
    void navigate(true);
    const onNavigation = () => { void navigate(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const result = readSaved();
      setSession((current) => ({ ...current, saved: result.saved, message: result.message || "Browser save changed in another tab. Your current edits are unchanged." }));
    };
    window.addEventListener("hashchange", onNavigation);
    window.addEventListener("popstate", onNavigation);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false; sequence++;
      window.removeEventListener("hashchange", onNavigation);
      window.removeEventListener("popstate", onNavigation);
      window.removeEventListener("storage", onStorage);
    };
  }, [ids]);

  // Detach only after switching to an editable list or dismissing a pending load.
  // Editing while a hash is decoding must leave the incoming URL intact.
  useEffect(() => {
    if (session.ready && !session.shared && !session.pending && window.location.hash.startsWith("#tier=")) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  }, [session.ready, session.shared, session.pending]);

  const isDirty = dirty(session);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const change = useCallback((update: (document: TierListDocument) => TierListDocument) => {
    setSession((current) => current.shared || !current.ready ? current : { ...current, document: update(current.document), shareUrl: null, message: "" });
  }, []);
  const setTitle = useCallback((title: string) => change((document) => ({ ...document, title })), [change]);
  const setTierState = useCallback((update: SetStateAction<TierState>) => change((document) => {
    const tiers = typeof update === "function" ? update(document.tiers) : update;
    // Pool moves follow in the same React event; keep the existing pool until then.
    return { ...document, tiers };
  }), [change]);
  const setPoolOrder = useCallback((update: SetStateAction<string[]>) => change((document) => {
    const pool = typeof update === "function" ? update(document.pool) : update;
    return snapshotDocument(document.title, document.tiers, pool);
  }), [change]);
  const notify = (message: string) => setSession((current) => ({ ...current, message }));
  const save = () => {
    try {
      const document = validateDocument(session.document, ids);
      window.localStorage.setItem(STORAGE_KEY, serialize(document));
      setSession((current) => ({ ...current, saved: document, baseline: serialize(document), message: "Saved in this browser." }));
    } catch {
      notify("Could not save in this browser (storage blocked or full). Your current list is still here. Download a file as a backup.");
    }
  };
  const restore = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { setSession((current) => ({ ...current, saved: null, message: "There is no saved tier list in this browser." })); return; }
      const document = parseDocument(raw, ids);
      setSession((current) => offer({ ...current, saved: document }, { document, shared: false }));
    } catch { notify("Could not restore the browser save. Your current list is unchanged. You can import a backup file."); }
  };
  const copyForEditing = () => {
    // Remove the snapshot fragment so reloading the editable copy restores its save.
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    setSession((current) => ({ ...current, shared: false, baseline: "", shareUrl: null, message: "Editing your own copy. Save it in this browser when ready." }));
  };
  const share = async () => {
    const document = session.document;
    setSession((current) => ({ ...current, busy: true, shareUrl: null, message: "Creating a share link…" }));
    try {
      const url = await createShareUrl(validateDocument(document, ids), window.location.href);
      setSession((current) => serialize(current.document) === serialize(document)
        ? { ...current, busy: false, shareUrl: url, message: `Share link ready (${url.length.toLocaleString()} characters). Copy the link below.` }
        : { ...current, busy: false, message: "Your list changed while the link was created. Create a new link for the current list." });
    } catch (error) { setSession((current) => ({ ...current, busy: false, message: errorMessage(error, "Could not create a share link. Download a file instead.") })); }
  };
  const copyLink = async () => {
    if (!session.shareUrl) return;
    try { await navigator.clipboard.writeText(session.shareUrl); notify("Share link copied."); }
    catch { notify("Clipboard access failed. Select the link below and copy it manually."); }
  };
  const download = () => {
    try {
      const document = validateDocument(session.document, ids);
      const url = URL.createObjectURL(new Blob([serialize(document)], { type: "application/json" }));
      const anchor = window.document.createElement("a");
      anchor.href = url; anchor.download = "opbr-tier-list.json";
      window.document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Tier list file downloaded. Import it here to restore or edit it.");
    } catch { notify("Could not download this tier list. Your current list is unchanged."); }
  };
  const importFile = async (file: File) => {
    try {
      if (file.size > MAX_DOCUMENT_BYTES) throw new Error("The tier list file is too large.");
      const document = parseDocument(await file.text(), ids);
      setSession((current) => offer(current, { document, shared: false, unsaved: true }));
    } catch (error) { notify(`Could not import the file. ${errorMessage(error, "Invalid tier list file.")} Your current list and browser save are unchanged.`); }
  };
  const loadPending = () => {
    setSession((current) => current.pending ? apply(current, current.pending) : current);
  };
  const keepEditing = () => setSession((current) => ({ ...current, pending: null, message: "Kept your current list. The browser save is unchanged." }));
  return { session, isDirty, setTitle, setTierState, setPoolOrder, save, restore, copyForEditing, share, copyLink, download, importFile, loadPending, keepEditing };
}
