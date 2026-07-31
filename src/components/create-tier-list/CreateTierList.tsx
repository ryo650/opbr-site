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

const tiers: { id: TierGrade; label: string }[] = [
  { id: "god", label: "GOD" }, { id: "ss", label: "SS" }, { id: "s", label: "S" },
  { id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }, { id: "d", label: "D" },
];
const emptyTiers = (): TierState => ({ god: [], ss: [], s: [], a: [], b: [], c: [], d: [] });
const allCharacters = Object.values(characters);
const allIds = allCharacters.map((character) => character.id);
const grades: Character["grade"][] = ["ex", "bf", "sp", "star-4", "star-3", "star-2", "free", "exchange", "cola", "unknown"];

function CharacterCard({ character, onDragStart, onPointerStart, onPointerMove, onPointerEnd, onPointerCancel, onSelect }: {
  character: Character; onDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void; onPointerStart: (event: PointerEvent<HTMLDivElement>, id: string) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void; onPointerEnd: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void; onSelect: (id: string) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(character.id);
    }
  };
  return <div className={styles.characterCard} draggable role="button" tabIndex={0} onDragStart={(event) => onDragStart(event, character.id)}
    onPointerDown={(event) => onPointerStart(event, character.id)} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerCancel} onKeyDown={onKeyDown}
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
  const activeId = useRef<string | null>(null);
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

  const moveCharacter = (id: string, destination: DropZone, beforeId?: string) => {
    const source = findZone(id);
    if (source === destination && !beforeId) return;
    setTierState((current) => {
      const next = Object.fromEntries(tiers.map((tier) => [tier.id, current[tier.id].filter((item) => item !== id)])) as TierState;
      if (destination !== "pool") {
        const index = beforeId ? next[destination].indexOf(beforeId) : -1;
        next[destination].splice(index < 0 ? next[destination].length : index, 0, id);
      }
      return next;
    });
    setPoolOrder((current) => {
      const without = current.filter((item) => item !== id);
      if (destination !== "pool") return without;
      const index = beforeId ? without.indexOf(beforeId) : -1;
      without.splice(index < 0 ? without.length : index, 0, id);
      return without;
    });
  };
  const drop = (destination: DropZone, beforeId?: string) => { if (activeId.current) moveCharacter(activeId.current, destination, beforeId); activeId.current = null; };
  const dragStartHandler = (event: DragEvent<HTMLDivElement>, id: string) => { activeId.current = id; if (pointerStart.current) pointerStart.current.moved = true; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", id); };
  const onDragOver = (event: DragEvent<HTMLElement>) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; };
  const dropFromDataTransfer = (event: DragEvent<HTMLElement>, destination: DropZone, beforeId?: string) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); if (id) moveCharacter(id, destination, beforeId); activeId.current = null; };
  const pointerStartHandler = (event: PointerEvent<HTMLDivElement>, id: string) => { pointerStart.current = { x: event.clientX, y: event.clientY, moved: false, id, pointerType: event.pointerType }; if (event.pointerType !== "mouse") { activeId.current = id; event.currentTarget.setPointerCapture(event.pointerId); } };
  const pointerMoveHandler = (event: PointerEvent<HTMLDivElement>) => { const start = pointerStart.current; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) start.moved = true; };
  const pointerEndHandler = (event: PointerEvent<HTMLDivElement>) => { const start = pointerStart.current; pointerStart.current = null; if (!start) return; if (!start.moved) { activeId.current = null; setSelectedCharacterId(start.id); return; } if (start.pointerType === "mouse") return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-drop-zone]"); if (target?.dataset.dropZone) drop(target.dataset.dropZone as DropZone, target.dataset.characterId); else activeId.current = null; };
  const pointerCancelHandler = () => { pointerStart.current = null; activeId.current = null; };
  const selectDestination = (destination: DropZone) => { if (!selectedCharacterId) return; moveCharacter(selectedCharacterId, destination); setSelectedCharacterId(null); };
  const reset = () => { if (window.confirm("Reset this tier list? Your current placements and filters will be cleared.")) { setTitle("My OPBR Tier List"); setTierState(emptyTiers()); setPoolOrder(allIds); setQuery(""); setElement("all"); setRole("all"); setGrade("all"); setSort("default"); setSelectedCharacterId(null); } };

  const characterCardProps = { onDragStart: dragStartHandler, onPointerStart: pointerStartHandler, onPointerMove: pointerMoveHandler, onPointerEnd: pointerEndHandler, onPointerCancel: pointerCancelHandler, onSelect: setSelectedCharacterId };

  return <div className={styles.container}>
    <header className={styles.header}><div><h1>Create Tier List</h1><p>Drag characters into tiers to create your own OPBR ranking.</p></div><button type="button" className={styles.reset} onClick={reset}>Reset</button></header>
    <label className={styles.titleLabel}>Tier List name<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <section aria-label={`${title} tiers`} className={styles.tierList}>{tiers.map((tier) => <div className={styles.tierRow} key={tier.id}><div className={`${styles.tierLabel} ${styles[tier.id]}`}>{tier.label}</div><div className={styles.tierContent} data-drop-zone={tier.id} onDragOver={onDragOver} onDrop={(event) => dropFromDataTransfer(event, tier.id)}>{tierState[tier.id].map((id) => { const character = characters[id]; return character && <div key={id} data-drop-zone={tier.id} data-character-id={id} onDragOver={onDragOver} onDrop={(event) => { event.stopPropagation(); dropFromDataTransfer(event, tier.id, id); }}><CharacterCard character={character} {...characterCardProps} /></div>; })}<span className={styles.dropHint}>{tierState[tier.id].length === 0 ? "Drop characters here" : ""}</span></div></div>)}</section>
    <section className={styles.poolSection}><div className={styles.poolHeading}><div><h2>Unranked Characters</h2><p>{pool.length} characters available</p></div></div><div className={styles.filters}><input aria-label="Search characters" placeholder="Search characters..." value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Element filter" value={element} onChange={(event) => setElement(event.target.value as typeof element)}><option value="all">Element: All</option>{["red", "blue", "green", "white", "black"].map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Role filter" value={role} onChange={(event) => setRole(event.target.value as typeof role)}><option value="all">Role: All</option>{["attacker", "defender", "runner"].map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Grade filter" value={grade} onChange={(event) => setGrade(event.target.value as typeof grade)}><option value="all">Grade: All</option>{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Sort characters" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="default">Default</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></div>
    <div className={styles.pool} data-drop-zone="pool" onDragOver={onDragOver} onDrop={(event) => dropFromDataTransfer(event, "pool")}>{filteredPool.map((character) => <div key={character.id} data-drop-zone="pool" data-character-id={character.id} onDragOver={onDragOver} onDrop={(event) => { event.stopPropagation(); dropFromDataTransfer(event, "pool", character.id); }}><CharacterCard character={character} {...characterCardProps} /></div>)}{filteredPool.length === 0 && <p className={styles.empty}>No unranked characters match your search and filters.</p>}</div></section>
    {selectedCharacter && <div className={styles.dialogBackdrop} onPointerDown={(event) => { if (event.target === event.currentTarget) setSelectedCharacterId(null); }}><div className={styles.destinationDialog} role="dialog" aria-modal="true" aria-labelledby="destination-title" aria-describedby="destination-details"><button ref={closeButtonRef} type="button" className={styles.dialogClose} onClick={() => setSelectedCharacterId(null)} aria-label="Close tier selection">×</button><div className={styles.selectedCharacter}><Image src={selectedCharacter.image} alt="" width={88} height={88} draggable={false} /><div><h2 id="destination-title">{selectedCharacter.name}</h2><p id="destination-details">{selectedCharacter.element} · {selectedCharacter.role} · {selectedCharacter.grade}</p></div></div><p className={styles.dialogPrompt}>Choose a destination tier</p><div className={styles.destinationButtons}>{tiers.map((tier) => <button type="button" key={tier.id} className={`${styles.destinationButton} ${styles[tier.id]}`} disabled={selectedZone === tier.id} aria-current={selectedZone === tier.id ? "true" : undefined} onClick={() => selectDestination(tier.id)}>{tier.label}{selectedZone === tier.id && <span>Current</span>}</button>)}</div>{selectedZone !== "pool" && <button type="button" className={styles.unrankedButton} onClick={() => selectDestination("pool")}>Return to Unranked</button>}</div></div>}
  </div>;
}
