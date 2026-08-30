"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import type { Medal, NativeTraitType, StatusEffectType } from "@/data/medals";
import type { NativeEffectType } from "@/data/medals/types";
import styles from "./MedalBuilder.module.css";

type Category = "all" | Medal["category"];
type Sort = "default" | "az" | "za" | "category" | "match";
type Tab = "medals" | "analysis";
type MedalSlots = [Medal | null, Medal | null, Medal | null];

const traitLabels: Record<NativeTraitType, string> = { atk: "ATK", def: "DEF", hp: "HP", crit: "CRIT" };
const labelId = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const medalImage = (medal: Medal) => `/medals/${medal.id}.webp`;

function MedalArt({ medal, sizes, priority = false }: { medal: Medal; sizes: string; priority?: boolean }) {
  return <span className={styles.medalArt}>
    <Image src={medalImage(medal)} alt="" fill sizes={sizes} priority={priority} />
    <span className={styles.gloss} aria-hidden="true" />
  </span>;
}

export default function MedalBuilder({ medals }: { medals: readonly Medal[] }) {
  const [slots, setSlots] = useState<MedalSlots>([null, null, null]);
  const [detailMedal, setDetailMedal] = useState<Medal | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<Sort>("default");
  const [tags, setTags] = useState<string[]>([]);
  const [traits, setTraits] = useState<NativeTraitType[]>([]);
  const [effects, setEffects] = useState<NativeEffectType[]>([]);
  const [reductions, setReductions] = useState<StatusEffectType[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("medals");
  const [dragSlot, setDragSlot] = useState<number | null>(null);

  const selected = useMemo(() => slots.filter((medal): medal is Medal => medal !== null), [slots]);
  const medalById = useMemo(() => new Map(medals.map((medal) => [medal.id, medal])), [medals]);
  const allTags = useMemo(() => {
    const catalog = new Map<string, string>();
    medals.forEach((medal) => medal.tags.forEach((tag) => catalog.set(tag.id, tag.name)));
    return [...catalog].sort((a, b) => a[1].localeCompare(b[1]));
  }, [medals]);
  const allEffects = useMemo(() => [...new Set(medals.flatMap((medal) => medal.nativeEffects ?? []))].sort(), [medals]);
  const allReductions = useMemo(() => [...new Set(medals.flatMap((medal) => medal.statusReductions ?? []))].sort(), [medals]);
  const selectedTagIds = useMemo(() => new Set(selected.flatMap((medal) => medal.tags.map((tag) => tag.id))), [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const result = medals.filter((medal) => {
      if (category !== "all" && medal.category !== category) return false;
      if (needle && !medal.name.toLocaleLowerCase().includes(needle) && !medal.tags.some((tag) => tag.name.toLocaleLowerCase().includes(needle))) return false;
      if (tags.length && !tags.every((id) => medal.tags.some((tag) => tag.id === id))) return false;
      if (traits.length && !traits.every((trait) => medal.nativeTraits.includes(trait))) return false;
      if (effects.length && !effects.every((effect) => medal.nativeEffects?.includes(effect))) return false;
      if (reductions.length && !reductions.every((effect) => medal.statusReductions?.includes(effect))) return false;
      return true;
    });
    const matchCount = (medal: Medal) => medal.tags.reduce((total, tag) => total + Number(selectedTagIds.has(tag.id)), 0);
    return result.map((medal, index) => ({ medal, index })).sort((a, b) => {
      if (sort === "az") return a.medal.name.localeCompare(b.medal.name);
      if (sort === "za") return b.medal.name.localeCompare(a.medal.name);
      if (sort === "category") return a.medal.category.localeCompare(b.medal.category) || a.index - b.index;
      if (sort === "match") return matchCount(b.medal) - matchCount(a.medal) || a.index - b.index;
      return a.index - b.index;
    }).map(({ medal }) => medal);
  }, [medals, query, category, tags, traits, effects, reductions, sort, selectedTagIds]);

  const commonTags = useMemo(() => {
    const matches = new Map<string, { name: string; count: number }>();
    selected.forEach((medal) => medal.tags.forEach((tag) => {
      const current = matches.get(tag.id);
      matches.set(tag.id, { name: tag.name, count: (current?.count ?? 0) + 1 });
    }));
    return [...matches.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [selected]);

  useEffect(() => {
    if (!detailMedal && !filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDetailMedal(null); setFiltersOpen(false); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [detailMedal, filtersOpen]);

  const placeMedal = (medal: Medal, slotIndex: number) => {
    setSlots((current) => {
      const existingIndex = current.findIndex((item) => item?.id === medal.id);
      if (existingIndex !== -1 && existingIndex !== slotIndex) return current;
      const next = [...current] as MedalSlots;
      next[slotIndex] = medal;
      return next;
    });
  };
  const handleDrop = (event: React.DragEvent, slotIndex: number) => {
    event.preventDefault(); setDragSlot(null);
    const medal = medalById.get(event.dataTransfer.getData("text/plain"));
    if (medal) placeMedal(medal, slotIndex);
  };
  const toggle = <T extends string>(value: T, values: T[], setValues: (next: T[]) => void) => setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const activeFilterCount = tags.length + traits.length + effects.length + reductions.length + Number(category !== "all");
  const clearFilters = () => { setCategory("all"); setTags([]); setTraits([]); setEffects([]); setReductions([]); };

  const filterPanel = <div className={styles.filterPanel}>
    <div className={styles.filterHeading}><div><span className={styles.kicker}>Refine catalog</span><h2>Filters</h2></div><button type="button" className={styles.closeFilters} onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X /></button></div>
    <fieldset><legend>Category</legend><div className={styles.segmented}>{(["all", "character", "event"] as Category[]).map((value) => <button type="button" key={value} className={category === value ? styles.activeSegment : ""} onClick={() => setCategory(value)}>{labelId(value)}</button>)}</div></fieldset>
    <FilterGroup title="Tags" options={allTags} selected={tags} onToggle={(id) => toggle(id, tags, setTags)} />
    <FilterGroup title="Native traits" options={(Object.keys(traitLabels) as NativeTraitType[]).map((id) => [id, traitLabels[id]])} selected={traits} onToggle={(id) => toggle(id as NativeTraitType, traits, setTraits)} />
    <FilterGroup title="Native effects" options={allEffects.map((id) => [id, labelId(id)])} selected={effects} onToggle={(id) => toggle(id as NativeEffectType, effects, setEffects)} />
    <FilterGroup title="Status reductions" options={allReductions.map((id) => [id, labelId(id)])} selected={reductions} onToggle={(id) => toggle(id as StatusEffectType, reductions, setReductions)} />
    <button type="button" className={styles.clearButton} onClick={clearFilters} disabled={!activeFilterCount}>Clear all filters</button>
  </div>;

  return <main className={styles.page}><div className={styles.inner}>
    <header className={styles.hero}><p className={styles.kicker}>Build · Compare · Refine</p><h1>Medal Builder</h1><p>Explore every production medal, then build a three-medal set.</p></header>

    <section className={styles.currentSet} aria-labelledby="current-set-title">
      <div className={styles.setHeading}><span className={styles.kicker}>Your loadout</span><h2 id="current-set-title">Current Medal Set</h2><p>Open a medal for details, or drag it into a slot.</p></div>
      <div className={styles.slots}>{slots.map((medal, index) => <div className={styles.slotWrap} key={index}>
        <div className={`${styles.slot} ${medal ? styles.filledSlot : ""} ${dragSlot === index ? styles.dragTarget : ""}`} onDragOver={(event) => { event.preventDefault(); setDragSlot(index); }} onDragLeave={() => setDragSlot(null)} onDrop={(event) => handleDrop(event, index)}>
          {medal ? <MedalArt medal={medal} sizes="110px" priority /> : <span className={styles.emptySlot}>{index + 1}</span>}
          {medal && <button type="button" onClick={() => setSlots((current) => current.map((item, slot) => slot === index ? null : item) as MedalSlots)} aria-label={`Remove ${medal.name}`}><X /></button>}
        </div><strong>SLOT {index + 1}</strong>
      </div>)}</div>
    </section>

    <div className={styles.mobileTabs} role="tablist" aria-label="Builder sections"><button role="tab" aria-selected={tab === "medals"} onClick={() => setTab("medals")}>Medals</button><button role="tab" aria-selected={tab === "analysis"} onClick={() => setTab("analysis")}>Set Analysis</button></div>

    <div className={styles.workspace}>
      <Analysis selected={selected} commonTags={commonTags} tab={tab} />
      <section className={`${styles.browser} ${tab !== "medals" ? styles.mobileHidden : ""}`}>
        <div className={styles.browserTop}><div><span className={styles.kicker}>Production catalog</span><h2>Medal Browser</h2><p>{filtered.length} of {medals.length} medals</p></div><button type="button" className={styles.filterButton} onClick={() => setFiltersOpen(true)}><Filter /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}</button></div>
        <div className={styles.controls}><label className={styles.search}><Search /><span className={styles.srOnly}>Search medals</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or tag…" /></label><label className={styles.sort}><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="default">Default</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="category">Category</option><option value="match">Best Tag Match</option></select></label></div>
        <div className={styles.browserBody}><aside className={styles.desktopFilters}>{filterPanel}</aside><div className={styles.medalGrid}>
          {filtered.map((medal) => { const isSelected = selected.some((item) => item.id === medal.id); return <button type="button" key={medal.id} className={`${styles.medalButton} ${isSelected ? styles.selectedMedal : ""}`} data-name={medal.name} onClick={() => setDetailMedal(medal)} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", medal.id); event.dataTransfer.effectAllowed = "copy"; }} aria-label={`View ${medal.name} details`} aria-haspopup="dialog"><MedalArt medal={medal} sizes="(max-width: 700px) 72px, 82px" /><span className={styles.tooltip}>{medal.name}</span>{isSelected && <span className={styles.selectedDot} aria-label="In current set" />}</button>; })}
          {!filtered.length && <div className={styles.empty}><strong>No medals found</strong><span>Try clearing filters or using a different search.</span></div>}
        </div></div>
      </section>
    </div>
  </div>
  {filtersOpen && <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Medal filters"><button className={styles.backdrop} onClick={() => setFiltersOpen(false)} aria-label="Close filters" />{filterPanel}</div>}
  {detailMedal && <MedalDetails medal={detailMedal} slots={slots} onPlace={placeMedal} onClose={() => setDetailMedal(null)} />}
  </main>;
}

function Analysis({ selected, commonTags, tab }: { selected: readonly Medal[]; commonTags: { name: string; count: number }[]; tab: Tab }) {
  return <aside className={`${styles.analysis} ${tab !== "analysis" ? styles.mobileHidden : ""}`}><span className={styles.kicker}>Live breakdown</span><h2>Set Analysis</h2>{!selected.length ? <div className={styles.analysisEmpty}><strong>Your analysis starts here.</strong><p>Open a medal and choose a mini slot.</p></div> : <>
    <section><h3>Common Tags</h3><div className={styles.commonTags}>{commonTags.map((tag) => <div key={tag.name}><span className={styles.dots} aria-hidden="true">{Array.from({ length: selected.length }, (_, index) => <i className={index < tag.count ? styles.dotOn : ""} key={index} />)}</span><strong>{tag.name}</strong><span>{tag.count}/{selected.length}</span></div>)}</div></section>
    <section><h3>Medal Traits</h3><div className={styles.traits}>{selected.map((medal) => <article key={medal.id}><header><MedalArt medal={medal} sizes="44px" /><strong>{medal.name}</strong></header><TraitRow title="Unique trait" values={[medal.uniqueTrait]} /><TraitRow title="Native traits" values={medal.nativeTraits.map((trait) => traitLabels[trait])} /><TraitRow title="Native effects" values={(medal.nativeEffects ?? []).map(labelId)} /><TraitRow title="Status reductions" values={(medal.statusReductions ?? []).map(labelId)} /></article>)}</div></section>
  </>}</aside>;
}

function MedalDetails({ medal, slots, onPlace, onClose }: { medal: Medal; slots: MedalSlots; onPlace: (medal: Medal, slot: number) => void; onClose: () => void }) {
  return <div className={styles.detailsLayer} role="dialog" aria-modal="true" aria-labelledby="medal-detail-title"><button className={styles.backdrop} onClick={onClose} aria-label="Close medal details" /><article className={styles.detailsSheet}>
    <div className={styles.sheetHandle} aria-hidden="true" /><button type="button" className={styles.detailsClose} onClick={onClose} aria-label="Close medal details"><X /></button>
    <header className={styles.detailsHeader}><MedalArt medal={medal} sizes="150px" priority /><div><span>{medal.category}</span><h2 id="medal-detail-title">{medal.name}</h2></div></header>
    <section className={styles.miniSet}><div><span className={styles.kicker}>Current set</span><p>Choose a slot to add or replace.</p></div><div className={styles.miniSlots}>{slots.map((slotMedal, index) => { const current = slotMedal?.id === medal.id; const elsewhere = slots.some((item, slot) => slot !== index && item?.id === medal.id); return <button type="button" key={index} className={current ? styles.currentMiniSlot : ""} onClick={() => onPlace(medal, index)} disabled={!current && elsewhere} aria-label={current ? `${medal.name} is in slot ${index + 1}` : `${slotMedal ? "Replace" : "Add to"} slot ${index + 1}`}><span>{slotMedal ? <MedalArt medal={slotMedal} sizes="64px" /> : index + 1}</span><strong>{current ? "CURRENT" : `SLOT ${index + 1}`}</strong></button>; })}</div></section>
    <div className={styles.detailContent}><DetailSection title="Unique Trait"><p>{medal.uniqueTrait}</p></DetailSection><DetailSection title="Tags"><Pills values={medal.tags.map((tag) => tag.name)} /></DetailSection><DetailSection title="Native Traits"><Pills values={medal.nativeTraits.map((trait) => traitLabels[trait])} /></DetailSection><DetailSection title="Native Effects"><Pills values={(medal.nativeEffects ?? []).map(labelId)} /></DetailSection><DetailSection title="Status Reductions"><Pills values={(medal.statusReductions ?? []).map(labelId)} /></DetailSection></div>
  </article></div>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className={styles.detailSection}><h3>{title}</h3>{children}</section>; }
function Pills({ values }: { values: readonly string[] }) { return values.length ? <div className={styles.pills}>{values.map((value) => <span key={value}>{value}</span>)}</div> : <em className={styles.none}>None</em>; }
function FilterGroup({ title, options, selected, onToggle }: { title: string; options: [string, string][]; selected: readonly string[]; onToggle: (id: string) => void }) { return <fieldset><legend>{title}</legend><div className={styles.checkList}>{options.map(([id, label]) => <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} /><span>{label}</span></label>)}</div></fieldset>; }
function TraitRow({ title, values }: { title: string; values: readonly string[] }) { return <div className={styles.traitRow}><span>{title}</span>{values.length ? <div>{values.map((value) => <span key={value}>{value}</span>)}</div> : <em>None</em>}</div>; }
