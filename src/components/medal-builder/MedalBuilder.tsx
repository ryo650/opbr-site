"use client";

import Image from "next/image";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Filter, Search, X } from "lucide-react";
import {
  matchesUniqueTraitFilters,
  uniqueTraitCategoryCatalog,
  uniqueTraitCategoryIdsByMedalId,
  type Medal,
  type MedalEffectId,
  type NativeTraitType,
  type StatusEffectType,
  type UniqueTraitCategoryId,
  type UniqueTraitCategoryMatchMode,
} from "@/data/medals";
import type { NativeEffectType } from "@/data/medals/types";
import {
  createTagSetEffectFilterIndex,
  formatMedalEffectCondition,
  formatMedalEffectValue,
  getActiveTagSetEffects,
  getTagSetEffectFilterOptions,
  matchesSelectedTagSetEffects,
  type ActiveTagSetEffect,
  type TagSetEffectFilterOption,
} from "@/data/medals/active-tag-set-effects";
import styles from "./MedalBuilder.module.css";

type Category = "all" | Medal["category"];
type Sort = "default" | "az" | "za" | "category" | "match";
type Tab = "medals" | "analysis" | "set-effects";
type FilterSection = "tag-effects" | "unique-traits" | "traits" | "effects" | "reductions";
type MedalSlots = [Medal | null, Medal | null, Medal | null];

const INITIAL_VISIBLE_MEDALS = 60;
const MEDAL_BATCH_SIZE = 60;
const MOBILE_COLUMNS = 7;
const NARROW_MOBILE_COLUMNS = 6;
const MOBILE_MEDAL_SIZE = 48;
const MOBILE_ROW_GAP = 12;
const getServerMediaSnapshot = () => false;

const traitLabels: Record<NativeTraitType, string> = { atk: "ATK", def: "DEF", hp: "HP", crit: "CRIT" };
const labelId = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const medalImage = (medal: Medal) => `/medals/${medal.id}.webp`;

function MedalArt({ medal, sizes, eager = false }: { medal: Medal; sizes: string; eager?: boolean }) {
  return <span className={styles.medalArt} data-medal-art>
    <span className={styles.medalImageViewport}>
      <Image src={medalImage(medal)} alt="" fill sizes={sizes} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
      <span className={styles.gloss} aria-hidden="true" />
    </span>
  </span>;
}

export default function MedalBuilder({ medals }: { medals: readonly Medal[] }) {
  const [slots, setSlots] = useState<MedalSlots>([null, null, null]);
  const [detailMedal, setDetailMedal] = useState<Medal | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<Sort>("default");
  const [setEffectIds, setSetEffectIds] = useState<MedalEffectId[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [traits, setTraits] = useState<NativeTraitType[]>([]);
  const [nativeEffects, setNativeEffects] = useState<NativeEffectType[]>([]);
  const [reductions, setReductions] = useState<StatusEffectType[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<FilterSection | null>(null);
  const [tagQuery, setTagQuery] = useState("");
  const [uniqueTraitQuery, setUniqueTraitQuery] = useState("");
  const [uniqueTraitCategories, setUniqueTraitCategories] = useState<UniqueTraitCategoryId[]>([]);
  const [uniqueTraitMatchMode, setUniqueTraitMatchMode] = useState<UniqueTraitCategoryMatchMode>("any");
  const [expandedSetEffects, setExpandedSetEffects] = useState<MedalEffectId[]>([]);
  const [tab, setTab] = useState<Tab>("medals");
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_MEDALS);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 700px)");

  const selected = useMemo(() => slots.filter((medal): medal is Medal => medal !== null), [slots]);
  const selectedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    selected.forEach((medal) => counts.set(medal.id, (counts.get(medal.id) ?? 0) + 1));
    return counts;
  }, [selected]);
  const medalById = useMemo(() => new Map(medals.map((medal) => [medal.id, medal])), [medals]);
  const allNativeEffects = useMemo(() => [...new Set(medals.flatMap((medal) => medal.nativeEffects ?? []))].sort(), [medals]);
  const allReductions = useMemo(() => [...new Set(medals.flatMap((medal) => medal.statusReductions ?? []))].sort(), [medals]);
  const tagSetEffectFilterOptions = useMemo(() => getTagSetEffectFilterOptions(medals), [medals]);
  const effectTagIdsById = useMemo(() => createTagSetEffectFilterIndex(tagSetEffectFilterOptions), [tagSetEffectFilterOptions]);
  const filteredTagSetEffectOptions = useMemo(() => {
    const needle = tagQuery.trim().toLocaleLowerCase();
    if (!needle) return tagSetEffectFilterOptions;
    return tagSetEffectFilterOptions.flatMap((option) => {
      const effectMatches = option.label.toLocaleLowerCase().includes(needle);
      const matchingTags = effectMatches
        ? option.tags
        : option.tags.filter((tag) => tag.name.toLocaleLowerCase().includes(needle));
      return effectMatches || matchingTags.length ? [{ ...option, tags: matchingTags }] : [];
    });
  }, [tagQuery, tagSetEffectFilterOptions]);
  const medalFilterIndex = useMemo(() => new Map(medals.map((medal) => [medal.id, {
    name: medal.name.toLocaleLowerCase(),
    tags: medal.tags.map((tag) => tag.name.toLocaleLowerCase()),
    tagIds: new Set(medal.tags.map((tag) => tag.id)),
    uniqueTrait: medal.uniqueTrait.toLocaleLowerCase(),
    uniqueTraitCategoryIds: new Set(uniqueTraitCategoryIdsByMedalId[medal.id] ?? []),
  }])), [medals]);
  const searchNeedle = useMemo(() => query.trim().toLocaleLowerCase(), [query]);
  const uniqueTraitNeedle = useMemo(() => uniqueTraitQuery.trim().toLocaleLowerCase(), [uniqueTraitQuery]);
  const selectedTagIds = useMemo(() => new Set(selected.flatMap((medal) => medal.tags.map((tag) => tag.id))), [selected]);

  const baseFiltered = useMemo(() => {
    return medals.filter((medal) => {
      const index = medalFilterIndex.get(medal.id);
      if (!index) return false;
      if (category !== "all" && medal.category !== category) return false;
      if (searchNeedle && !index.name.includes(searchNeedle) && !index.tags.some((tag) => tag.includes(searchNeedle))) return false;
      if (!matchesUniqueTraitFilters(index.uniqueTrait, index.uniqueTraitCategoryIds, uniqueTraitCategories, uniqueTraitMatchMode, uniqueTraitNeedle)) return false;
      if (!matchesSelectedTagSetEffects(index.tagIds, setEffectIds, effectTagIdsById)) return false;
      if (tags.length && !tags.every((id) => index.tagIds.has(id))) return false;
      if (traits.length && !traits.every((trait) => medal.nativeTraits.includes(trait))) return false;
      if (nativeEffects.length && !nativeEffects.every((effect) => medal.nativeEffects?.includes(effect))) return false;
      if (reductions.length && !reductions.every((effect) => medal.statusReductions?.includes(effect))) return false;
      return true;
    });
  }, [medals, medalFilterIndex, category, searchNeedle, uniqueTraitNeedle, uniqueTraitCategories, uniqueTraitMatchMode, setEffectIds, effectTagIdsById, tags, traits, nativeEffects, reductions]);

  const normallySorted = useMemo(() => {
    if (sort === "default" || sort === "match") return baseFiltered;
    return baseFiltered.map((medal, index) => ({ medal, index })).sort((a, b) => {
      if (sort === "az") return a.medal.name.localeCompare(b.medal.name);
      if (sort === "za") return b.medal.name.localeCompare(a.medal.name);
      if (sort === "category") return a.medal.category.localeCompare(b.medal.category) || a.index - b.index;
      return a.index - b.index;
    }).map(({ medal }) => medal);
  }, [baseFiltered, sort]);

  const filtered = useMemo(() => {
    if (sort !== "match") return normallySorted;
    const matchCount = (medal: Medal) => medal.tags.reduce((total, tag) => total + Number(selectedTagIds.has(tag.id)), 0);
    return baseFiltered.map((medal, index) => ({ medal, index })).sort((a, b) =>
      matchCount(b.medal) - matchCount(a.medal) || a.index - b.index
    ).map(({ medal }) => medal);
  }, [baseFiltered, normallySorted, selectedTagIds, sort]);

  const commonTags = useMemo(() => {
    const matches = new Map<string, { name: string; count: number }>();
    selected.forEach((medal) => medal.tags.forEach((tag) => {
      const current = matches.get(tag.id);
      matches.set(tag.id, { name: tag.name, count: (current?.count ?? 0) + 1 });
    }));
    return [...matches.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [selected]);
  const activeTagSetEffects = useMemo(
    () => getActiveTagSetEffects(selected),
    [selected],
  );
  const visibleMedals = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMoreMedals = visibleCount < filtered.length;

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMoreMedals) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((current) => Math.min(current + MEDAL_BATCH_SIZE, filtered.length));
    }, { rootMargin: "500px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, hasMoreMedals]);

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

  const setMedal = (slotIndex: number, medal: Medal) => {
    setSlots((current) => {
      const next = [...current] as MedalSlots;
      next[slotIndex] = medal;
      return next;
    });
    if (sort === "match") setVisibleCount(INITIAL_VISIBLE_MEDALS);
  };
  const removeMedal = (slotIndex: number) => {
    setSlots((current) => current.map((item, slot) => slot === slotIndex ? null : item) as MedalSlots);
    if (sort === "match") setVisibleCount(INITIAL_VISIBLE_MEDALS);
  };
  const handleDrop = (event: React.DragEvent, slotIndex: number) => {
    event.preventDefault(); setDragSlot(null);
    const medal = medalById.get(event.dataTransfer.getData("text/plain"));
    if (medal) setMedal(slotIndex, medal);
  };
  const toggle = <T extends string>(value: T, values: T[], setValues: (next: T[]) => void) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
    setVisibleCount(INITIAL_VISIBLE_MEDALS);
  };
  const activeFilterCount = setEffectIds.length + tags.length + traits.length + nativeEffects.length + reductions.length + uniqueTraitCategories.length + Number(category !== "all") + Number(Boolean(uniqueTraitNeedle));
  const hasActiveFilterState = activeFilterCount > 0 || uniqueTraitMatchMode !== "any";
  const clearFilters = () => { setCategory("all"); setSetEffectIds([]); setTags([]); setTraits([]); setNativeEffects([]); setReductions([]); setTagQuery(""); setUniqueTraitQuery(""); setUniqueTraitCategories([]); setUniqueTraitMatchMode("any"); setVisibleCount(INITIAL_VISIBLE_MEDALS); };
  const toggleFilterSection = (section: FilterSection) => setExpandedFilter((current) => current === section ? null : section);
  const toggleSetEffectExpansion = (effectId: MedalEffectId) => setExpandedSetEffects((current) => current.includes(effectId) ? current.filter((id) => id !== effectId) : [...current, effectId]);
  const openMedalDetails = useCallback((medal: Medal) => setDetailMedal(medal), []);
  const startMedalDrag = useCallback((event: React.DragEvent<HTMLButtonElement>, medal: Medal) => {
    event.dataTransfer.setData("text/plain", medal.id);
    event.dataTransfer.effectAllowed = "copy";
    const medalArt = event.currentTarget.querySelector<HTMLElement>("[data-medal-art]");
    if (!medalArt) return;
    const dragPreview = document.createElement("div");
    dragPreview.className = styles.dragPreview;
    dragPreview.setAttribute("aria-hidden", "true");
    dragPreview.appendChild(medalArt.cloneNode(true));
    document.body.appendChild(dragPreview);
    const { width, height } = dragPreview.getBoundingClientRect();
    dragPreview.style.left = `${event.clientX - width / 2}px`;
    dragPreview.style.top = `${event.clientY - height / 2}px`;
    event.dataTransfer.setDragImage(dragPreview, width / 2, height / 2);
    requestAnimationFrame(() => dragPreview.remove());
  }, []);

  const filterPanel = <div className={styles.filterPanel}>
    <div className={styles.filterHeading}><div><span className={styles.kicker}>Refine catalog</span><h2>Filters</h2></div><button type="button" className={styles.closeFilters} onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X /></button></div>
    <fieldset><legend>Category</legend><div className={styles.segmented}>{(["all", "character", "event"] as Category[]).map((value) => <button type="button" key={value} className={category === value ? styles.activeSegment : ""} onClick={() => { setCategory(value); setVisibleCount(INITIAL_VISIBLE_MEDALS); }}>{labelId(value)}</button>)}</div></fieldset>
    <div className={styles.filterLaunchers}>
      <FilterLauncher title="Set Effects & Tags" count={setEffectIds.length + tags.length} expanded={expandedFilter === "tag-effects"} onClick={() => toggleFilterSection("tag-effects")} />
      {expandedFilter === "tag-effects" && <TagSetEffectFilter options={filteredTagSetEffectOptions} selectedEffectIds={setEffectIds} selectedTagIds={tags} expandedEffectIds={expandedSetEffects} search={tagQuery} onSearchChange={setTagQuery} onToggleEffect={(id) => toggle(id, setEffectIds, setSetEffectIds)} onToggleTag={(id) => toggle(id, tags, setTags)} onToggleExpanded={toggleSetEffectExpansion} />}
      <FilterLauncher title="Unique Traits" count={uniqueTraitCategories.length + Number(Boolean(uniqueTraitNeedle))} expanded={expandedFilter === "unique-traits"} onClick={() => toggleFilterSection("unique-traits")} />
      {expandedFilter === "unique-traits" && <UniqueTraitFilter query={uniqueTraitQuery} selected={uniqueTraitCategories} matchMode={uniqueTraitMatchMode} onQueryChange={(value) => { setUniqueTraitQuery(value); setVisibleCount(INITIAL_VISIBLE_MEDALS); }} onToggle={(id) => toggle(id, uniqueTraitCategories, setUniqueTraitCategories)} onMatchModeChange={(mode) => { setUniqueTraitMatchMode(mode); setVisibleCount(INITIAL_VISIBLE_MEDALS); }} />}
      <FilterLauncher title="Extra Trait Effects" count={nativeEffects.length} expanded={expandedFilter === "effects"} onClick={() => toggleFilterSection("effects")} />
      {expandedFilter === "effects" && <FilterSelector title="Extra Trait Effects" options={allNativeEffects.map((id) => [id, labelId(id)])} selected={nativeEffects} onToggle={(id) => toggle(id as NativeEffectType, nativeEffects, setNativeEffects)} />}
      <FilterLauncher title="Status Reductions" count={reductions.length} expanded={expandedFilter === "reductions"} onClick={() => toggleFilterSection("reductions")} />
      {expandedFilter === "reductions" && <FilterSelector title="Status Reductions" options={allReductions.map((id) => [id, labelId(id)])} selected={reductions} onToggle={(id) => toggle(id as StatusEffectType, reductions, setReductions)} />}
      <FilterLauncher title="Native Traits" count={traits.length} expanded={expandedFilter === "traits"} onClick={() => toggleFilterSection("traits")} />
      {expandedFilter === "traits" && <FilterSelector title="Native Traits" options={(Object.keys(traitLabels) as NativeTraitType[]).map((id) => [id, traitLabels[id]])} selected={traits} onToggle={(id) => toggle(id as NativeTraitType, traits, setTraits)} />}
    </div>
    <button type="button" className={styles.clearButton} onClick={clearFilters} disabled={!hasActiveFilterState}>Clear all filters</button>
  </div>;

  return <main className={styles.page}><div className={styles.inner}>
    <header className={styles.hero}><p className={styles.kicker}>Build · Compare · Refine</p><h1>Medal Builder</h1><p>Explore every production medal, then build a three-medal set.</p></header>

    <section className={styles.currentSet} aria-labelledby="current-set-title">
      <div className={styles.setHeading}><span className={styles.kicker}>Your loadout</span><h2 id="current-set-title">Current Medal Set</h2><p>Open a medal for details, or drag it into a slot.</p></div>
      <div className={styles.slots}>{slots.map((medal, index) => <div className={styles.slotWrap} key={index}>
        <div className={`${styles.slot} ${medal ? styles.filledSlot : ""} ${dragSlot === index ? styles.dragTarget : ""}`} onDragOver={(event) => { event.preventDefault(); setDragSlot(index); }} onDragLeave={() => setDragSlot(null)} onDrop={(event) => handleDrop(event, index)}>
          {medal ? <button type="button" className={styles.currentMedalButton} onClick={() => setDetailMedal(medal)} aria-label={`View ${medal.name} details`} aria-haspopup="dialog"><MedalArt medal={medal} sizes="110px" eager /></button> : <span className={styles.emptySlot}>{index + 1}</span>}
          {medal && <button type="button" className={styles.removeButton} onClick={() => removeMedal(index)} aria-label={`Remove ${medal.name}`}><X /></button>}
        </div><strong>SLOT {index + 1}</strong>
      </div>)}</div>
    </section>

    <div className={styles.mobileTabs} role="tablist" aria-label="Builder sections"><button role="tab" aria-selected={tab === "medals"} onClick={() => setTab("medals")}>Medals</button><button role="tab" aria-selected={tab === "set-effects"} onClick={() => setTab("set-effects")}>Set Effects</button><button role="tab" aria-selected={tab === "analysis"} onClick={() => setTab("analysis")}>Set Analysis</button></div>

    <div className={styles.workspace}>
      <div className={styles.insights}>
        <SetEffects effects={activeTagSetEffects} tab={tab} />
        <Analysis selected={selected} commonTags={commonTags} tab={tab} />
      </div>
      <section className={`${styles.browser} ${tab !== "medals" ? styles.mobileHidden : ""}`}>
        <div className={styles.browserTop}><div><span className={styles.kicker}>Production catalog</span><h2>Medal Browser</h2><p>{filtered.length} of {medals.length} medals</p></div><button type="button" className={styles.filterButton} onClick={() => setFiltersOpen(true)}><Filter /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}</button></div>
        <div className={styles.controls}><label className={styles.search}><Search /><span className={styles.srOnly}>Search medals</span><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(INITIAL_VISIBLE_MEDALS); }} placeholder="Search name or tag…" /></label><label className={styles.sort}><span>Sort</span><select value={sort} onChange={(event) => { setSort(event.target.value as Sort); setVisibleCount(INITIAL_VISIBLE_MEDALS); }}><option value="default">Default</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="category">Category</option><option value="match">Best Tag Match</option></select></label></div>
        <div className={styles.browserBody}><aside className={styles.desktopFilters}>{filterPanel}</aside>{isMobile
          ? <MobileMedalGrid medals={filtered} selectedCounts={selectedCounts} onOpen={openMedalDetails} onDragStart={startMedalDrag} active={tab === "medals"} />
          : <div className={styles.medalGrid}>
            {visibleMedals.map((medal) => <MedalBrowserItem key={medal.id} medal={medal} selectedCount={selectedCounts.get(medal.id) ?? 0} onOpen={openMedalDetails} onDragStart={startMedalDrag} />)}
            {hasMoreMedals && <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden="true" />}
            {!filtered.length && <EmptyMedalGrid />}
          </div>}
        </div>
      </section>
    </div>
  </div>
  {filtersOpen && <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Medal filters"><button className={styles.backdrop} onClick={() => setFiltersOpen(false)} aria-label="Close filters" />{filterPanel}</div>}
  {detailMedal && <MedalDetails medal={detailMedal} slots={slots} onPlace={setMedal} onRemove={removeMedal} onClose={() => setDetailMedal(null)} />}
  </main>;
}

const MedalBrowserItem = memo(function MedalBrowserItem({ medal, selectedCount, onOpen, onDragStart }: { medal: Medal; selectedCount: number; onOpen: (medal: Medal) => void; onDragStart: (event: React.DragEvent<HTMLButtonElement>, medal: Medal) => void }) {
  return <button type="button" className={`${styles.medalButton} ${selectedCount ? styles.selectedMedal : ""}`} data-name={medal.name} onClick={() => onOpen(medal)} draggable onDragStart={(event) => onDragStart(event, medal)} aria-label={`View ${medal.name} details`} aria-haspopup="dialog" aria-pressed={selectedCount > 0}>
    <MedalArt medal={medal} sizes="(max-width: 700px) 48px, 82px" />
    <span className={styles.tooltip}>{medal.name}</span>
    {selectedCount > 0 && <span className={styles.selectedDot} aria-label={`${selectedCount} in current set`}>{selectedCount > 1 ? `×${selectedCount}` : ""}</span>}
  </button>;
});

function MobileMedalGrid({ medals, selectedCounts, onOpen, onDragStart, active }: { medals: readonly Medal[]; selectedCounts: ReadonlyMap<string, number>; onOpen: (medal: Medal) => void; onDragStart: (event: React.DragEvent<HTMLButtonElement>, medal: Medal) => void; active: boolean }) {
  const isNarrowMobile = useMediaQuery("(max-width: 360px)");
  const columnCount = isNarrowMobile ? NARROW_MOBILE_COLUMNS : MOBILE_COLUMNS;
  const rowCount = Math.ceil(medals.length / columnCount);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const rowVirtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: rowCount,
    estimateSize: () => MOBILE_MEDAL_SIZE,
    gap: MOBILE_ROW_GAP,
    getItemKey: (index) => medals[index * columnCount]?.id ?? index,
    overscan: 2,
    scrollMargin,
    enabled: active,
    useFlushSync: false,
  });

  useEffect(() => {
    const rows = rowsRef.current;
    if (!rows || !active) return;
    const updateScrollMargin = () => setScrollMargin(rows.getBoundingClientRect().top + window.scrollY);
    updateScrollMargin();
    const resizeObserver = new ResizeObserver(updateScrollMargin);
    resizeObserver.observe(rows);
    window.addEventListener("resize", updateScrollMargin);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollMargin);
    };
  }, [active, columnCount, medals.length]);

  if (!medals.length) return <div className={styles.mobileMedalGrid}><EmptyMedalGrid /></div>;

  return <div className={styles.mobileMedalGrid}>
    <div ref={rowsRef} className={styles.mobileVirtualRows} style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowStart = virtualRow.index * columnCount;
        return <div
          key={virtualRow.key}
          className={styles.mobileMedalRow}
          data-index={virtualRow.index}
          style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
        >
          {medals.slice(rowStart, rowStart + columnCount).map((medal) => <MedalBrowserItem key={medal.id} medal={medal} selectedCount={selectedCounts.get(medal.id) ?? 0} onOpen={onOpen} onDragStart={onDragStart} />)}
        </div>;
      })}
    </div>
  </div>;
}

function EmptyMedalGrid() {
  return <div className={styles.empty}><strong>No medals found</strong><span>Try clearing filters or using a different search.</span></div>;
}

function useMediaQuery(query: string) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  }, [query]);
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerMediaSnapshot);
}

function Analysis({ selected, commonTags, tab }: { selected: readonly Medal[]; commonTags: { name: string; count: number }[]; tab: Tab }) {
  return <aside className={`${styles.analysis} ${tab !== "analysis" ? styles.mobileHidden : ""}`}><span className={styles.kicker}>Live breakdown</span><h2>Set Analysis</h2>{!selected.length ? <div className={styles.analysisEmpty}><strong>Your analysis starts here.</strong><p>Open a medal and choose a mini slot.</p></div> : <>
    <section><h3>Common Tags</h3><div className={styles.commonTags}>{commonTags.map((tag) => <div key={tag.name}><span className={styles.dots} aria-hidden="true">{Array.from({ length: selected.length }, (_, index) => <i className={index < tag.count ? styles.dotOn : ""} key={index} />)}</span><strong>{tag.name}</strong><span>{tag.count}/{selected.length}</span></div>)}</div></section>
  </>}</aside>;
}

function SetEffects({ effects, tab }: { effects: readonly ActiveTagSetEffect[]; tab: Tab }) {
  const threeSetEffects = effects.filter((effect) => effect.setSize === 3);
  const twoSetEffects = effects.filter((effect) => effect.setSize === 2);

  return <aside className={`${styles.setEffects} ${tab !== "set-effects" ? styles.mobileHidden : ""}`}><span className={styles.kicker}>Active Tag bonuses</span><h2>Set Effects</h2>
    <SetEffectSection title="3 Set Effects" effects={threeSetEffects} setSize={3} />
    <SetEffectSection title="2 Set Effects" effects={twoSetEffects} setSize={2} />
  </aside>;
}

function SetEffectSection({ title, effects, setSize }: { title: string; effects: readonly ActiveTagSetEffect[]; setSize: 2 | 3 }) {
  return <section className={styles.setEffectSection}><h3>{title}</h3>{effects.length
    ? <div className={styles.setEffectList}>{effects.map((effect) => <article className={`${styles.setEffectEntry} ${setSize === 3 ? styles.threeSetEffect : ""}`} key={`${effect.groupId}:${effect.tagId}`}>
      <strong className={styles.setEffectTag}>{effect.tagName}</strong>
      <div className={styles.setEffectSummary}><span>{effect.effectLabel}</span><strong>{formatMedalEffectValue(effect.value, effect.valueSchema)}</strong></div>
      {effect.condition && <p>{formatMedalEffectCondition(effect.condition)}</p>}
    </article>)}</div>
    : <p className={styles.setEffectEmpty}>No {setSize} Set Effects</p>}
  </section>;
}

function MedalDetails({ medal, slots, onPlace, onRemove, onClose }: { medal: Medal; slots: MedalSlots; onPlace: (slot: number, medal: Medal) => void; onRemove: (slot: number) => void; onClose: () => void }) {
  return <div className={styles.detailsLayer} role="dialog" aria-modal="true" aria-labelledby="medal-detail-title"><button className={styles.backdrop} onClick={onClose} aria-label="Close medal details" /><article className={styles.detailsSheet}>
    <div className={styles.sheetHandle} aria-hidden="true" /><button type="button" className={styles.detailsClose} onClick={onClose} aria-label="Close medal details"><X /></button>
    <header className={styles.detailsHeader}><MedalArt medal={medal} sizes="150px" eager /><div><span>{medal.category}</span><h2 id="medal-detail-title">{medal.name}</h2></div></header>
    <section className={styles.miniSet}><div><span className={styles.kicker}>Current set</span><p>Choose a slot to add or replace.</p></div><div className={styles.miniSlots}>{slots.map((slotMedal, index) => { const current = slotMedal?.id === medal.id; return <button type="button" key={index} className={current ? styles.currentMiniSlot : ""} onClick={() => current ? onRemove(index) : onPlace(index, medal)} aria-label={current ? `${medal.name} is in slot ${index + 1}` : `${slotMedal ? "Replace" : "Add to"} slot ${index + 1}`}><span>{slotMedal ? <MedalArt medal={slotMedal} sizes="64px" /> : index + 1}</span><strong>{current ? "CURRENT" : `SLOT ${index + 1}`}</strong></button>; })}</div></section>
    <div className={styles.detailContent}><DetailSection title="Unique Trait"><p>{medal.uniqueTrait}</p></DetailSection><DetailSection title="Tags"><Pills values={medal.tags.map((tag) => tag.name)} /></DetailSection><DetailSection title="Native Traits"><Pills values={medal.nativeTraits.map((trait) => traitLabels[trait])} /></DetailSection><DetailSection title="Extra Trait Effects"><Pills values={(medal.nativeEffects ?? []).map(labelId)} /></DetailSection><DetailSection title="Status Reductions"><Pills values={(medal.statusReductions ?? []).map(labelId)} /></DetailSection></div>
  </article></div>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className={styles.detailSection}><h3>{title}</h3>{children}</section>; }
function Pills({ values }: { values: readonly string[] }) { return values.length ? <div className={styles.pills}>{values.map((value) => <span key={value}>{value}</span>)}</div> : <em className={styles.none}>None</em>; }
function FilterLauncher({ title, count, expanded, onClick }: { title: string; count: number; expanded: boolean; onClick: () => void }) { return <button type="button" className={styles.filterLauncher} onClick={onClick} aria-expanded={expanded}><span>{title}</span>{count > 0 && <strong>{count}</strong>}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>; }
function UniqueTraitFilter({ query, selected, matchMode, onQueryChange, onToggle, onMatchModeChange }: { query: string; selected: readonly UniqueTraitCategoryId[]; matchMode: UniqueTraitCategoryMatchMode; onQueryChange: (value: string) => void; onToggle: (id: UniqueTraitCategoryId) => void; onMatchModeChange: (mode: UniqueTraitCategoryMatchMode) => void }) {
  return <div className={styles.filterSelector} aria-label="Unique Trait filters">
    <label className={`${styles.filterSearch} ${styles.uniqueTraitSearch}`}><Search /><span className={styles.srOnly}>Search unique traits</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search unique traits…" /></label>
    <div className={styles.matchMode}><span>Category matching</span><div className={styles.segmented}>{(["any", "all"] as UniqueTraitCategoryMatchMode[]).map((mode) => <button type="button" key={mode} className={matchMode === mode ? styles.activeSegment : ""} onClick={() => onMatchModeChange(mode)} aria-pressed={matchMode === mode}>Match {labelId(mode)}</button>)}</div></div>
    <div className={styles.checkList}>{uniqueTraitCategoryCatalog.map(({ id, label }) => <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} /><span>{label}</span></label>)}</div>
  </div>;
}
function TagSetEffectFilter({ options, selectedEffectIds, selectedTagIds, expandedEffectIds, search, onSearchChange, onToggleEffect, onToggleTag, onToggleExpanded }: { options: readonly TagSetEffectFilterOption[]; selectedEffectIds: readonly MedalEffectId[]; selectedTagIds: readonly string[]; expandedEffectIds: readonly MedalEffectId[]; search: string; onSearchChange: (value: string) => void; onToggleEffect: (id: MedalEffectId) => void; onToggleTag: (id: string) => void; onToggleExpanded: (id: MedalEffectId) => void }) {
  const searching = Boolean(search.trim());
  return <div className={styles.filterSelector} aria-label="Tag Set Effect and Tag filters">
    <label className={styles.filterSearch}><Search /><span className={styles.srOnly}>Search Tag Set Effects and Tags</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search effects or tags…" /></label>
    <p className={styles.filterHint}>Each Effect matches any listed Tag. Selected Tags must all match.</p>
    <div className={styles.tagEffectGroups}>{options.map((option) => { const expanded = searching || expandedEffectIds.includes(option.effectId); return <div className={styles.tagEffectGroup} key={option.effectId}>
      <div className={styles.tagEffectHeader}><label><input type="checkbox" checked={selectedEffectIds.includes(option.effectId)} onChange={() => onToggleEffect(option.effectId)} /><span>{option.label}</span></label><button type="button" onClick={() => onToggleExpanded(option.effectId)} aria-label={`${expanded ? "Hide" : "Show"} Tags for ${option.label}`} aria-expanded={expanded}>{expanded ? "−" : "+"}</button></div>
      {expanded && <div className={styles.tagEffectTags}>{option.tags.map((tag) => <label key={tag.id}><input type="checkbox" checked={selectedTagIds.includes(tag.id)} onChange={() => onToggleTag(tag.id)} /><span>{tag.name}</span></label>)}</div>}
    </div>; })}{!options.length && <span className={styles.noFilterOptions}>No matching Effects or Tags</span>}</div>
  </div>;
}
function FilterSelector({ title, options, selected, onToggle, search }: { title: string; options: [string, string][]; selected: readonly string[]; onToggle: (id: string) => void; search?: { value: string; onChange: (value: string) => void } }) { return <div className={styles.filterSelector} aria-label={`${title} filters`}>{search && <label className={styles.filterSearch}><Search /><span className={styles.srOnly}>Search tags</span><input value={search.value} onChange={(event) => search.onChange(event.target.value)} placeholder="Search tags…" /></label>}<div className={styles.checkList}>{options.map(([id, label]) => <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={() => onToggle(id)} /><span>{label}</span></label>)}{!options.length && <span className={styles.noFilterOptions}>No matching tags</span>}</div></div>; }
