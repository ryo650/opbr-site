"use client";

import Image from "next/image";
import { DragEvent, KeyboardEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { characters } from "@/data/characters";
import type { Character } from "@/data/characters/type";
import styles from "./CreateTierList.module.css";

type TierGrade = "god" | "ss" | "s" | "a" | "b" | "c" | "d";
type TierState = Record<TierGrade, string[]>;
type SortOrder = "default" | "name-asc" | "name-desc";
type DropZone = TierGrade | "pool";
type DropPlacement = "before" | "after";
type DropIntent = { destination: DropZone; targetId?: string; placement: DropPlacement };

const tiers: { id: TierGrade; label: string }[] = [
  { id: "god", label: "GOD" }, { id: "ss", label: "SS" }, { id: "s", label: "S" },
  { id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }, { id: "d", label: "D" },
];
const emptyTiers = (): TierState => ({ god: [], ss: [], s: [], a: [], b: [], c: [], d: [] });
const allCharacters = Object.values(characters);
const allIds = allCharacters.map((character) => character.id);
const grades: Character["grade"][] = ["ex", "bf", "sp", "star-4", "star-3", "star-2", "free", "exchange", "cola", "unknown"];
const longPressDelay = 300;
const scrollMovementThreshold = 10;
const preventTouchScroll = (event: TouchEvent) => event.preventDefault();

function CharacterCard({ character, isDragging, onDragStart, onDragEnd, onPointerStart, onPointerMove, onPointerEnd, onPointerCancel, onSelect }: {
  character: Character; isDragging: boolean; onDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void; onDragEnd: () => void; onPointerStart: (event: PointerEvent<HTMLDivElement>, id: string) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void; onPointerEnd: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void; onSelect: (id: string) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(character.id);
    }
  };
  return <div className={`${styles.characterCard} ${isDragging ? styles.draggingSource : ""}`} draggable role="button" tabIndex={0} onDragStart={(event) => onDragStart(event, character.id)} onDragEnd={onDragEnd}
    onPointerDown={(event) => onPointerStart(event, character.id)} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerCancel} onKeyDown={onKeyDown}
    onContextMenu={(event) => event.preventDefault()}
    aria-label={`Choose a tier for ${character.name}`} title={`${character.name} · ${character.element} · ${character.role} · ${character.grade}`}>
    <Image src={character.image} alt={character.name} width={72} height={72} draggable={false} className={styles.characterImage} />
    {/*<span className={styles.characterName}>{character.name}</span>
    <span className={styles.element}>{character.element}</span> */}
  </div>;
}

export default function CreateTierList() {
  const [title, setTitle] = useState("My OPBR Tier List");
  const [tierState, setTierState] = useState<TierState>(emptyTiers);
  const [poolOrder, setPoolOrder] = useState(allIds);
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<"all" | Character["element"]>("all");
  const [role, setRole] = useState<"all" | "attacker" | "defender" | "runner">("all");
  const [grade, setGrade] = useState<"all" | Character["grade"]>("all");
  const [sort, setSort] = useState<SortOrder>("default");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIntent, setDropIntent] = useState<DropIntent | null>(null);
  const [pointerPreview, setPointerPreview] = useState<{ id: string; x: number; y: number } | null>(null);
  const activeId = useRef<string | null>(null);
  const dragPreviewElement = useRef<HTMLElement | null>(null);
  const pointerStart = useRef<{ x: number; y: number; moved: boolean; id: string; pointerType: string } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const rankedIds = useMemo(() => new Set(Object.values(tierState).flat()), [tierState]);
  const pool = useMemo(() => poolOrder.map((id) => characters[id]).filter((character): character is Character => Boolean(character) && !rankedIds.has(character.id)), [poolOrder, rankedIds]);
  const filteredPool = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = pool.filter((character) => (!normalizedQuery || character.name.toLowerCase().includes(normalizedQuery)) && (element === "all" || character.element === element) && (role === "all" || character.role === role) && (grade === "all" || character.grade === grade));
    return [...result].sort((first, second) => sort === "name-asc" ? first.name.localeCompare(second.name) : sort === "name-desc" ? second.name.localeCompare(first.name) : 0);
  }, [pool, query, element, role, grade, sort]);
  const findZone = (id: string): DropZone => tiers.find((tier) => tierState[tier.id].includes(id))?.id ?? "pool";
  const selectedCharacter = selectedCharacterId ? characters[selectedCharacterId] : null;
  const selectedZone = selectedCharacterId ? findZone(selectedCharacterId) : null;

  useEffect(() => {
    if (!selectedCharacterId) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCharacterId(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedCharacterId]);
;

  const moveCharacter = (id: string, destination: DropZone, targetId?: string, placement: DropPlacement = "after") => {
    if (targetId === id) return;
    setTierState((current) => {
      const next = Object.fromEntries(tiers.map((tier) => [tier.id, current[tier.id].filter((item) => item !== id)])) as TierState;
      if (destination !== "pool") {
        const targetIndex = targetId ? next[destination].indexOf(targetId) : -1;
        const destinationIndex = targetIndex < 0 ? next[destination].length : targetIndex + (placement === "after" ? 1 : 0);
        next[destination].splice(destinationIndex, 0, id);
      }
      return next;
    });
    setPoolOrder((current) => {
      const without = current.filter((item) => item !== id);
      if (destination !== "pool") return without;
      const targetIndex = targetId ? without.indexOf(targetId) : -1;
      const destinationIndex = targetIndex < 0 ? without.length : targetIndex + (placement === "after" ? 1 : 0);
      without.splice(destinationIndex, 0, id);
      return without;
    });
  };
  const clearDragState = () => { dragPreviewElement.current?.remove(); dragPreviewElement.current = null; activeId.current = null; setDraggingId(null); setDropIntent(null); setPointerPreview(null); };
  const getIntent = (destination: DropZone, target: Element | null, clientX: number): DropIntent => {
    const card = target?.closest<HTMLElement>("[data-character-id]");
    if (!card || !card.closest(`[data-zone-container="${destination}"]`)) return { destination, placement: "after" };
    const rect = card.getBoundingClientRect();
    return { destination, targetId: card.dataset.characterId, placement: clientX > rect.left + rect.width / 2 ? "after" : "before" };
  };
  const drop = (intent: DropIntent) => { if (activeId.current) moveCharacter(activeId.current, intent.destination, intent.targetId, intent.placement); clearDragState(); };
  const dragStartHandler = (event: DragEvent<HTMLDivElement>, id: string) => {
    if (pointerStart.current?.pointerType && pointerStart.current.pointerType !== "mouse") { event.preventDefault(); return; }
    activeId.current = id; setDraggingId(id); if (pointerStart.current) pointerStart.current.moved = true;
    event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", id);
    const rect = event.currentTarget.getBoundingClientRect();
    const preview = event.currentTarget.cloneNode(true) as HTMLElement;
    preview.classList.remove(styles.draggingSource); preview.classList.add(styles.nativeDragPreview);
    preview.style.width = `${rect.width}px`; document.body.appendChild(preview); dragPreviewElement.current = preview;
    event.dataTransfer.setDragImage(preview, event.clientX - rect.left, event.clientY - rect.top);
  };
  const dragOverHandler = (event: DragEvent<HTMLElement>, destination: DropZone) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropIntent(getIntent(destination, event.target as Element, event.clientX)); };
  const dragLeaveHandler = (event: DragEvent<HTMLElement>) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropIntent(null); };
  const dropFromDataTransfer = (event: DragEvent<HTMLElement>, destination: DropZone) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); const intent = getIntent(destination, event.target as Element, event.clientX); if (id) moveCharacter(id, destination, intent.targetId, intent.placement); clearDragState(); };
  const pointerStartHandler = (event: PointerEvent<HTMLDivElement>, id: string) => { pointerStart.current = { x: event.clientX, y: event.clientY, moved: false, id, pointerType: event.pointerType }; if (event.pointerType !== "mouse") { activeId.current = id; event.currentTarget.setPointerCapture(event.pointerId); } };
  const pointerMoveHandler = (event: PointerEvent<HTMLDivElement>) => { const start = pointerStart.current; if (!start || start.pointerType === "mouse") return; if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) { start.moved = true; setDraggingId(start.id); setPointerPreview({ id: start.id, x: event.clientX, y: event.clientY }); const element = document.elementFromPoint(event.clientX, event.clientY); const zone = element?.closest<HTMLElement>("[data-zone-container]")?.dataset.zoneContainer as DropZone | undefined; setDropIntent(zone ? getIntent(zone, element, event.clientX) : null); } };
  const pointerEndHandler = (event: PointerEvent<HTMLDivElement>) => { const start = pointerStart.current; pointerStart.current = null; if (!start) return; if (!start.moved) { clearDragState(); setSelectedCharacterId(start.id); return; } if (start.pointerType === "mouse") { clearDragState(); return; } const element = document.elementFromPoint(event.clientX, event.clientY); const zone = element?.closest<HTMLElement>("[data-zone-container]")?.dataset.zoneContainer as DropZone | undefined; if (zone) drop(getIntent(zone, element, event.clientX)); else clearDragState(); };
  const pointerCancelHandler = () => { pointerStart.current = null; clearDragState(); };
  const selectDestination = (destination: DropZone) => { if (!selectedCharacterId) return; moveCharacter(selectedCharacterId, destination); setSelectedCharacterId(null); };
  const reset = () => { if (window.confirm("Reset this tier list? Your current placements and filters will be cleared.")) { setTitle("My OPBR Tier List"); setTierState(emptyTiers()); setPoolOrder(allIds); setQuery(""); setElement("all"); setRole("all"); setGrade("all"); setSort("default"); setSelectedCharacterId(null); } };

  const characterCardProps = { onDragStart: dragStartHandler, onDragEnd: clearDragState, onPointerStart: pointerStartHandler, onPointerMove: pointerMoveHandler, onPointerEnd: pointerEndHandler, onPointerCancel: pointerCancelHandler, onSelect: setSelectedCharacterId };

  return <div className={styles.container}>
    <header className={styles.header}><div><h1>Create Tier List</h1><p>Drag characters into tiers to create your own OPBR ranking.</p></div><button type="button" className={styles.reset} onClick={reset}>Reset</button></header>
    <label className={styles.titleLabel}>Tier List name<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <section aria-label={`${title} tiers`} className={styles.tierList}>{tiers.map((tier) => <div className={styles.tierRow} key={tier.id}><div className={`${styles.tierLabel} ${styles[tier.id]}`}>{tier.label}</div><div className={`${styles.tierContent} ${dropIntent?.destination === tier.id && !dropIntent.targetId ? styles.dropAtEnd : ""}`} data-zone-container={tier.id} onDragOver={(event) => dragOverHandler(event, tier.id)} onDragLeave={dragLeaveHandler} onDrop={(event) => dropFromDataTransfer(event, tier.id)}>{tierState[tier.id].map((id) => { const character = characters[id]; const indicator = dropIntent?.destination === tier.id && dropIntent.targetId === id ? (dropIntent.placement === "before" ? styles.dropBefore : styles.dropAfter) : ""; return character && <div className={`${styles.characterSlot} ${indicator}`} key={id} data-character-id={id}><CharacterCard character={character} isDragging={draggingId === id} {...characterCardProps} /></div>; })}<span className={styles.dropHint}>{tierState[tier.id].length === 0 ? "Drop characters here" : ""}</span></div></div>)}</section>
    <section className={styles.poolSection}><div className={styles.poolHeading}><div><h2>Unranked Characters</h2><p>{pool.length} characters available</p></div></div><div className={styles.filters}><input aria-label="Search characters" placeholder="Search characters..." value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Element filter" value={element} onChange={(event) => setElement(event.target.value as typeof element)}><option value="all">Element: All</option>{["red", "blue", "green", "white", "black"].map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Role filter" value={role} onChange={(event) => setRole(event.target.value as typeof role)}><option value="all">Role: All</option>{["attacker", "defender", "runner"].map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Grade filter" value={grade} onChange={(event) => setGrade(event.target.value as typeof grade)}><option value="all">Grade: All</option>{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Sort characters" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="default">Default</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></div>
    <div className={`${styles.pool} ${dropIntent?.destination === "pool" && !dropIntent.targetId ? styles.dropAtEnd : ""}`} data-zone-container="pool" onDragOver={(event) => dragOverHandler(event, "pool")} onDragLeave={dragLeaveHandler} onDrop={(event) => dropFromDataTransfer(event, "pool")}>{filteredPool.map((character) => { const indicator = dropIntent?.destination === "pool" && dropIntent.targetId === character.id ? (dropIntent.placement === "before" ? styles.dropBefore : styles.dropAfter) : ""; return <div className={`${styles.characterSlot} ${indicator}`} key={character.id} data-character-id={character.id}><CharacterCard character={character} isDragging={draggingId === character.id} {...characterCardProps} /></div>; })}{filteredPool.length === 0 && <p className={styles.empty}>No unranked characters match your search and filters.</p>}</div></section>
    {pointerPreview && characters[pointerPreview.id] && <div className={`${styles.characterCard} ${styles.pointerDragPreview}`} style={{ left: pointerPreview.x, top: pointerPreview.y }} aria-hidden="true"><Image src={characters[pointerPreview.id].image} alt="" width={72} height={72} draggable={false} className={styles.characterImage} /></div>}
    {selectedCharacter && <div className={styles.dialogBackdrop} onPointerDown={(event) => { if (event.target === event.currentTarget) setSelectedCharacterId(null); }}><div className={styles.destinationDialog} role="dialog" aria-modal="true" aria-labelledby="destination-title" aria-describedby="destination-details"><button ref={closeButtonRef} type="button" className={styles.dialogClose} onClick={() => setSelectedCharacterId(null)} aria-label="Close tier selection">×</button><div className={styles.selectedCharacter}><Image src={selectedCharacter.image} alt="" width={88} height={88} draggable={false} /><div><h2 id="destination-title">{selectedCharacter.name}</h2><p id="destination-details">{selectedCharacter.element} · {selectedCharacter.role} · {selectedCharacter.grade}</p></div></div><p className={styles.dialogPrompt}>Choose a destination tier</p><div className={styles.destinationButtons}>{tiers.map((tier) => <button type="button" key={tier.id} className={`${styles.destinationButton} ${styles[tier.id]}`} disabled={selectedZone === tier.id} aria-current={selectedZone === tier.id ? "true" : undefined} onClick={() => selectDestination(tier.id)}>{tier.label}{selectedZone === tier.id && <span>Current</span>}</button>)}</div>{selectedZone !== "pool" && <button type="button" className={styles.unrankedButton} onClick={() => selectDestination("pool")}>Return to Unranked</button>}</div></div>}
  </div>;
}
