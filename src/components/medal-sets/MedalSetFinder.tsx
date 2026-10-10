"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Medal, UniqueTraitCategoryId } from "@/data/medals";
import {
  uniqueTraitCategoryCatalog,
  uniqueTraitCategoryIdsByMedalId,
} from "@/data/medals";
import {
  createTagSetEffectFilterIndex,
  formatMedalEffectValue,
  getActiveTagSetEffects,
  getTagSetEffectFilterOptions,
} from "@/data/medals/active-tag-set-effects";
import {
  countFinderCatalogFilters,
  emptyFinderCatalogFilters,
  matchesFinderCatalogFilters,
  type FinderCatalogFilters,
} from "@/data/medal-sets/finder-catalog-filters";
import {
  createFinderIndex,
  findNextMedals,
  getCommonTags,
  getSharedPurposes,
  removeMedalFromSlots,
  sortFinderCandidates,
  type FinderMode,
  type FinderSort,
} from "@/data/medal-sets/finder";
import MedalArtwork from "@/components/medals/MedalArtwork";
import MedalFinderFilters from "./MedalFinderFilters";
import RecentMedals from "./RecentMedals";
import { getRecentlyAddedMedals } from "@/data/medal-sets/recent-medals";
import styles from "./MedalSetFinder.module.css";

const PAGE_SIZE = 36;
const purposeLabels = new Map<string, string>(
  uniqueTraitCategoryCatalog.map((entry) => [entry.id, entry.label]),
);

type Slots = [string | null, string | null, string | null];

export default function MedalSetFinder({ medals }: { medals: readonly Medal[] }) {
  const [slots, setSlots] = useState<Slots>([null, null, null]);
  const [mode, setMode] = useState<FinderMode>("all");
  const [minTags, setMinTags] = useState(2);
  const [purposeId, setPurposeId] = useState<UniqueTraitCategoryId | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<FinderSort>("default");
  const [catalogFilters, setCatalogFilters] = useState<FinderCatalogFilters>({ ...emptyFinderCatalogFilters });
  const [catalogFiltersOpen, setCatalogFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const index = useMemo(
    () => createFinderIndex(medals, uniqueTraitCategoryIdsByMedalId),
    [medals],
  );
  const medalById = useMemo(() => new Map(medals.map((medal) => [medal.id, medal])), [medals]);
  const recentlyAddedMedals = useMemo(() => getRecentlyAddedMedals(medals), [medals]);
  const indexById = useMemo(() => new Map(index.map((entry) => [entry.medal.id, entry])), [index]);
  const selectedIds = useMemo(() => slots.filter((id): id is string => id !== null), [slots]);
  const chosen = useMemo(
    () => selectedIds.flatMap((id) => {
      const entry = indexById.get(id);
      return entry ? [entry] : [];
    }),
    [selectedIds, indexById],
  );
  const candidates = useMemo(
    () => findNextMedals(index, selectedIds, { mode, minTags, purposeId }),
    [index, selectedIds, mode, minTags, purposeId],
  );
  const search = query.trim().toLocaleLowerCase();
  const filterOptions = useMemo(() => getTagSetEffectFilterOptions(medals), [medals]);
  const effectTagIdsById = useMemo(() => createTagSetEffectFilterIndex(filterOptions), [filterOptions]);
  const activeFilterCount = countFinderCatalogFilters(catalogFilters);
  const recentQuickPicks = useMemo(
    () => recentlyAddedMedals.filter((medal) =>
      (!search ||
        medal.name.toLocaleLowerCase().includes(search) ||
        medal.tags.some((tag) => tag.name.toLocaleLowerCase().includes(search))) &&
      matchesFinderCatalogFilters(medal, catalogFilters, effectTagIdsById)),
    [recentlyAddedMedals, search, catalogFilters, effectTagIdsById],
  );
  const filtered = useMemo(
    () => candidates.filter(({ medal }) =>
      (!search ||
        medal.name.toLocaleLowerCase().includes(search) ||
        medal.tags.some((tag) => tag.name.toLocaleLowerCase().includes(search))) &&
      matchesFinderCatalogFilters(medal, catalogFilters, effectTagIdsById),
    ),
    [candidates, search, catalogFilters, effectTagIdsById],
  );
  const sorted = useMemo(() => sortFinderCandidates(filtered, sort, medals), [filtered, sort, medals]);
  const visible = sorted.slice(0, visibleCount);
  const selectedMedals = chosen.map(({ medal }) => medal);
  const complete = selectedMedals.length === 3;
  const sharedTags = complete ? getCommonTags(selectedMedals) : [];
  const sharedPurposes = complete ? getSharedPurposes(chosen) : [];
  const pairOnlyTags = complete
    ? [...new Map(selectedMedals.flatMap((medal) => medal.tags.map((tag) => [tag.id, tag.name] as const))).entries()]
      .filter(([tagId]) => selectedMedals.filter((medal) => medal.tags.some((tag) => tag.id === tagId)).length === 2)
      .map(([, name]) => name)
    : [];
  const activeTagEffects = complete ? getActiveTagSetEffects(selectedMedals) : [];

  function chooseMedal(id: string) {
    setSlots((previous) => {
      const next = [...previous] as Slots;
      const emptyIndex = next.indexOf(null);
      if (emptyIndex < 0 || next.includes(id)) return previous;
      next[emptyIndex] = id;
      return next;
    });
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  }

  function removeMedal(index: number) {
    setSlots((previous) => removeMedalFromSlots(previous, index));
    if (selectedIds.length === 1) setSort((current) => current === "match" ? "default" : current);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  }

  function resetSet() {
    setSlots([null, null, null]);
    setSort((current) => current === "match" ? "default" : current);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  }

  function changeMode(value: FinderMode) {
    setMode(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className={styles.finder} aria-label="Medal Set Finder">
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Build as you search</span>
          <h2>Medal Set Finder</h2>
          <p>Choose one medal, then another. Each choice updates the available medals for the next slot. No recommendation scores.</p>
        </div>
        <button type="button" className={styles.reset} onClick={resetSet} disabled={!selectedIds.length}>
          Reset set
        </button>
      </header>

      <div className={styles.slots} aria-label="Selected medal slots">
        {slots.map((id, position) => {
          const medal = id ? medalById.get(id) : null;
          return (
            <div className={styles.slot} key={position}>
              <div className={styles.slotNumber}>Slot {position + 1}</div>
              {medal ? (
                <div className={styles.filledSlot}>
                  <button
                    type="button"
                    className={styles.removeMedal}
                    onClick={() => removeMedal(position)}
                    aria-label={"Remove " + medal.name + " from slot " + (position + 1)}
                    title="Remove this medal"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                  <MedalArtwork medal={medal} sizes="64px" className={styles.slotArt} />
                  <span className={styles.slotName}>{medal.name}</span>
                </div>
              ) : (
                <div className={position === selectedIds.length ? styles.activeEmpty : styles.emptySlot}>
                  <span className={styles.plus} aria-hidden="true">+</span>
                  <span>{position === selectedIds.length ? "Choose below" : "Not selected"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className={styles.slotHint}>Remove a medal with × to keep the other selections. Remaining medals move left.</p>

      <div className={styles.controls}>
        <label>
          Search for
          <select value={mode} onChange={(event) => changeMode(event.target.value as FinderMode)}>
            <option value="all">Any matching set</option>
            <option value="tag">Tag focus (4+ common tags)</option>
            <option value="trait">Trait focus (2+ matching traits)</option>
            <option value="hybrid">Hybrid (tags + traits)</option>
          </select>
        </label>
        <label>
          Minimum 3-medal common tags
          <select value={minTags} onChange={(event) => { setMinTags(Number(event.target.value)); setVisibleCount(PAGE_SIZE); }}>
            {[2, 3, 4, 5, 6].map((value) => <option value={value} key={value}>{value}+</option>)}
          </select>
        </label>
        <label>
          Unique trait purpose
          <select value={purposeId ?? ""} onChange={(event) => {
            setPurposeId(event.target.value ? event.target.value as UniqueTraitCategoryId : null);
            setVisibleCount(PAGE_SIZE);
          }}>
            <option value="">Any purpose</option>
            {uniqueTraitCategoryCatalog.map((item) =>
              <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>

      {complete ? (
        <section className={styles.summary} aria-live="polite">
          <div className={styles.summaryHeading}>
            <div><span className={styles.eyebrow}>Set complete</span><h3>Your medal combination</h3></div>
            <Link className={styles.builderLink} href={"/medal-builder?medals=" + encodeURIComponent(selectedIds.join(","))}>
              Analyze in Medal Builder →
            </Link>
          </div>
          <p className={styles.metric}><strong>{sharedTags.length}</strong> tags shared by all 3 medals · <strong>{pairOnlyTags.length}</strong> shared by exactly 2</p>
          <div className={styles.pills}>{sharedTags.map((tag) => <span key={tag.id}>{tag.name}</span>)}</div>
          {sharedTags.length === 0 && <p className={styles.muted}>No tags are shared by all three.</p>}
          <h4>Matching unique-trait purposes</h4>
          {sharedPurposes.length > 0 ? (
            <div className={styles.pills}>{sharedPurposes.map(({ id, count }) =>
              <span key={id}>{purposeLabels.get(id) ?? id} · {count}/3 medals</span>)}</div>
          ) : <p className={styles.muted}>No shared trait purpose detected.</p>}
          <p className={styles.note}>Trait conditions are not evaluated. Matches describe purposes, not guaranteed activation.</p>
          <h4>Activated tag effects</h4>
          {activeTagEffects.length ? (
            <ul className={styles.effects}>
              {activeTagEffects.map((effect) =>
                <li key={effect.groupId + "-" + effect.tagId}>
                  <strong>{effect.tagName}</strong> ({effect.setSize} medals) — {effect.effectLabel}: {formatMedalEffectValue(effect.value, effect.valueSchema)}
                </li>)}
            </ul>
          ) : <p className={styles.muted}>No supported tag effects detected.</p>}
          <p className={styles.note}>Detailed effect caps and stat limits can be checked in Medal Builder.</p>
        </section>
      ) : (
        <section className={styles.results} aria-live="polite">
          {selectedIds.length === 0 && (
            <RecentMedals medals={recentQuickPicks} onChoose={chooseMedal} />
          )}
          <div className={styles.resultsHeader}>
            <div>
              <h3>{selectedIds.length === 0 ? "Choose your first medal" : "Choose medal " + (selectedIds.length + 1)}</h3>
              <p>
                {selectedIds.length === 0
                  ? "Start with any medal. Filters will apply as you build the set."
                  : selectedIds.length === 1
                    ? "Only medals with at least one valid third-medal completion are shown."
                    : "Each listed medal completes a set matching your filters."}
              </p>
            </div>
            <strong className={styles.count}>{filtered.length} medals</strong>
          </div>
          <div className={styles.browserControls}>
            <label className={styles.search}>
              Find a medal by name or tag
              <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search medals or tags…" autoComplete="off" />
            </label>
            <label className={styles.sort}>
              Sort
              <select value={sort} onChange={(event) => { setSort(event.target.value as FinderSort); setVisibleCount(PAGE_SIZE); }}>
                <option value="default">Default</option>
                <option value="az">Name A–Z</option>
                <option value="za">Name Z–A</option>
                <option value="category">Category</option>
                <option value="match" disabled={selectedIds.length === 0}>Best Tag Match</option>
              </select>
            </label>
            <button className={styles.filterButton} type="button" aria-expanded={catalogFiltersOpen}
              onClick={() => setCatalogFiltersOpen((open) => !open)}>
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
          {catalogFiltersOpen && (
            <MedalFinderFilters
              medals={medals}
              filters={catalogFilters}
              onChange={(next) => { setCatalogFilters(next); setVisibleCount(PAGE_SIZE); }}
              onClose={() => setCatalogFiltersOpen(false)}
            />
          )}
          {visible.length > 0 ? (
            <div className={styles.medalGrid}>
              {visible.map(({ medal, commonTagCount, completionCount }) => (
                <button type="button" className={styles.medalCard} key={medal.id}
                  onClick={() => chooseMedal(medal.id)} aria-label={"Choose " + medal.name}>
                  <MedalArtwork medal={medal} sizes="64px" className={styles.candidateArt} />
                  <span className={styles.candidateInfo}>
                    <strong>{medal.name}</strong>
                    {selectedIds.length > 0 && <small>
                      {commonTagCount} shared {selectedIds.length === 1 ? "pair" : "trio"} tags
                      {completionCount !== null && " · " + completionCount + " possible third medals"}
                    </small>}
                  </span>
                  <span className={styles.cardArrow} aria-hidden="true">+</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No medals match these conditions. Try lowering the common-tag threshold or changing a selected medal.</div>
          )}
          {filtered.length > visibleCount &&
            <button type="button" className={styles.more} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              Show more ({filtered.length - visibleCount} remaining)
            </button>}
        </section>
      )}
    </section>
  );
}
