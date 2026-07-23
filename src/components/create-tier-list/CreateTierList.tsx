"use client";

import Image from "next/image";
import { DragEvent, PointerEvent, useMemo, useRef, useState } from "react";
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

function CharacterCard({ character, onDragStart, onTouchStart, onTouchMove, onTouchEnd }: {
  character: Character; onDragStart: (id: string) => void; onTouchStart: (event: PointerEvent<HTMLButtonElement>, id: string) => void;
  onTouchMove: (event: PointerEvent<HTMLButtonElement>) => void; onTouchEnd: (event: PointerEvent<HTMLButtonElement>) => void;
}) {
  return <button type="button" className={styles.characterCard} draggable onDragStart={() => onDragStart(character.id)}
    onPointerDown={(event) => onTouchStart(event, character.id)} onPointerMove={onTouchMove} onPointerUp={onTouchEnd} onPointerCancel={onTouchEnd}
    aria-label={`Move ${character.name}`} title={`${character.name} · ${character.element} · ${character.role} · ${character.grade}`}>
    <Image src={character.image} alt={character.name} width={72} height={72} className={styles.characterImage} />
    <span className={styles.characterName}>{character.name}</span>
    <span className={styles.element}>{character.element}</span>
  </button>;
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
  const activeId = useRef<string | null>(null);
  const touchStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const rankedIds = useMemo(() => new Set(Object.values(tierState).flat()), [tierState]);
  const pool = useMemo(() => poolOrder.map((id) => characters[id]).filter((character): character is Character => Boolean(character) && !rankedIds.has(character.id)), [poolOrder, rankedIds]);
  const filteredPool = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = pool.filter((character) => (!normalizedQuery || character.name.toLowerCase().includes(normalizedQuery)) && (element === "all" || character.element === element) && (role === "all" || character.role === role) && (grade === "all" || character.grade === grade));
    return [...result].sort((first, second) => sort === "name-asc" ? first.name.localeCompare(second.name) : sort === "name-desc" ? second.name.localeCompare(first.name) : 0);
  }, [pool, query, element, role, grade, sort]);

  const findZone = (id: string): DropZone => tiers.find((tier) => tierState[tier.id].includes(id))?.id ?? "pool";
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
  const onDragOver = (event: DragEvent<HTMLElement>) => event.preventDefault();
  const touchStartHandler = (event: PointerEvent<HTMLButtonElement>, id: string) => { if (event.pointerType === "mouse") return; activeId.current = id; touchStart.current = { x: event.clientX, y: event.clientY, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); };
  const touchMoveHandler = (event: PointerEvent<HTMLButtonElement>) => { const start = touchStart.current; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) start.moved = true; };
  const touchEndHandler = (event: PointerEvent<HTMLButtonElement>) => { const start = touchStart.current; touchStart.current = null; if (!start?.moved) { activeId.current = null; return; } const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-drop-zone]"); if (target?.dataset.dropZone) drop(target.dataset.dropZone as DropZone, target.dataset.characterId); else activeId.current = null; };
  const reset = () => { if (window.confirm("Reset this tier list? Your current placements and filters will be cleared.")) { setTitle("My OPBR Tier List"); setTierState(emptyTiers()); setPoolOrder(allIds); setQuery(""); setElement("all"); setRole("all"); setGrade("all"); setSort("default"); } };

  return <div className={styles.container}>
    <header className={styles.header}><div><h1>Create Tier List</h1><p>Drag characters into tiers to create your own OPBR ranking.</p></div><button type="button" className={styles.reset} onClick={reset}>Reset</button></header>
    <label className={styles.titleLabel}>Tier List name<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <section aria-label={`${title} tiers`} className={styles.tierList}>{tiers.map((tier) => <div className={styles.tierRow} key={tier.id}><div className={`${styles.tierLabel} ${styles[tier.id]}`}>{tier.label}</div><div className={styles.tierContent} data-drop-zone={tier.id} onDragOver={onDragOver} onDrop={() => drop(tier.id)}>{tierState[tier.id].map((id) => { const character = characters[id]; return character && <div key={id} data-drop-zone={tier.id} data-character-id={id} onDragOver={onDragOver} onDrop={(event) => { event.stopPropagation(); drop(tier.id, id); }}><CharacterCard character={character} onDragStart={(item) => activeId.current = item} onTouchStart={touchStartHandler} onTouchMove={touchMoveHandler} onTouchEnd={touchEndHandler} /></div>; })}<span className={styles.dropHint}>{tierState[tier.id].length === 0 ? "Drop characters here" : ""}</span></div></div>)}</section>
    <section className={styles.poolSection}><div className={styles.poolHeading}><div><h2>Unranked Characters</h2><p>{pool.length} characters available</p></div></div><div className={styles.filters}><input aria-label="Search characters" placeholder="Search characters..." value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Element filter" value={element} onChange={(event) => setElement(event.target.value as typeof element)}><option value="all">Element: All</option>{["red", "blue", "green", "white", "black"].map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Role filter" value={role} onChange={(event) => setRole(event.target.value as typeof role)}><option value="all">Role: All</option>{["attacker", "defender", "runner"].map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Grade filter" value={grade} onChange={(event) => setGrade(event.target.value as typeof grade)}><option value="all">Grade: All</option>{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select><select aria-label="Sort characters" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="default">Default</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></div>
    <div className={styles.pool} data-drop-zone="pool" onDragOver={onDragOver} onDrop={() => drop("pool")}>{filteredPool.map((character) => <div key={character.id} data-drop-zone="pool" data-character-id={character.id} onDragOver={onDragOver} onDrop={(event) => { event.stopPropagation(); drop("pool", character.id); }}><CharacterCard character={character} onDragStart={(id) => activeId.current = id} onTouchStart={touchStartHandler} onTouchMove={touchMoveHandler} onTouchEnd={touchEndHandler} /></div>)}{filteredPool.length === 0 && <p className={styles.empty}>No unranked characters match your search and filters.</p>}</div></section>
  </div>;
}
