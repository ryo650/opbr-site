"use client";

import { useMemo, useState } from "react";
import type {
  Medal, MedalEffectId, NativeTraitType, StatusEffectType,
  UniqueTraitCategoryId, UniqueTraitCategoryMatchMode,
} from "@/data/medals";
import { uniqueTraitCategoryCatalog } from "@/data/medals";
import { getTagSetEffectFilterOptions } from "@/data/medals/active-tag-set-effects";
import type { FinderCatalogFilters } from "@/data/medal-sets/finder-catalog-filters";
import { countFinderCatalogFilters, emptyFinderCatalogFilters } from "@/data/medal-sets/finder-catalog-filters";
import styles from "./MedalFinderFilters.module.css";

type Props = {
  medals: readonly Medal[];
  filters: FinderCatalogFilters;
  onChange: (filters: FinderCatalogFilters) => void;
  onClose: () => void;
};

function toggle<T extends string>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function labelId(id: string): string {
  return id.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MedalFinderFilters({ medals, filters, onChange, onClose }: Props) {
  const [tagSearch, setTagSearch] = useState("");
  const [expandedTagEffects, setExpandedTagEffects] = useState<string[]>([]);
  const options = useMemo(() => getTagSetEffectFilterOptions(medals), [medals]);
  const availableNativeEffects = useMemo(
    () => [...new Set(medals.flatMap((medal) => medal.nativeEffects ?? []))].sort(),
    [medals],
  );
  const availableReductions = useMemo(
    () => [...new Set(medals.flatMap((medal) => medal.statusReductions ?? []))].sort(),
    [medals],
  );
  const needle = tagSearch.trim().toLocaleLowerCase();
  const matchingOptions = options.flatMap((option) => {
    if (!needle) return [option];
    if (option.label.toLocaleLowerCase().includes(needle)) return [option];
    const tags = option.tags.filter((tag) => tag.name.toLocaleLowerCase().includes(needle));
    return tags.length ? [{ ...option, tags }] : [];
  });
  const update = <K extends keyof FinderCatalogFilters>(key: K, value: FinderCatalogFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <section className={styles.panel} aria-label="Medal filters">
      <div className={styles.heading}>
        <div>
          <h4>Filter medals</h4>
          <p>Refine the next medal list. Selected slots stay unchanged.</p>
        </div>
        <button type="button" className={styles.close} onClick={onClose}>Close</button>
      </div>

      <fieldset className={styles.category}>
        <legend>Category</legend>
        <div className={styles.segments}>
          {(["all", "character", "event"] as const).map((category) => (
            <button type="button" key={category} aria-pressed={filters.category === category}
              onClick={() => update("category", category)}>{labelId(category)}</button>
          ))}
        </div>
      </fieldset>

      <details className={styles.group}>
        <summary>Set Effects &amp; Tags <span>{filters.setEffectIds.length + filters.tagIds.length || ""}</span></summary>
        <div className={styles.groupBody}>
          <label className={styles.fieldLabel}>Search effects or tags
            <input type="search" value={tagSearch} onChange={(event) => setTagSearch(event.target.value)}
              placeholder="Search effects or tags…" />
          </label>
          <p className={styles.hint}>Each selected effect matches any associated tag. All individually selected tags must match.</p>
          {matchingOptions.map((option) => {
            const expanded = Boolean(needle) || expandedTagEffects.includes(option.effectId);
            return (
              <div className={styles.effectGroup} key={option.effectId}>
                <div className={styles.effectHeading}>
                  <label><input type="checkbox" checked={filters.setEffectIds.includes(option.effectId)}
                    onChange={() => update("setEffectIds", toggle<MedalEffectId>(filters.setEffectIds, option.effectId))} />
                    {option.label}</label>
                  <button type="button" aria-expanded={expanded}
                    aria-label={expanded ? "Hide tags for " + option.label : "Show tags for " + option.label}
                    onClick={() => setExpandedTagEffects(toggle(expandedTagEffects, option.effectId))}>{expanded ? "−" : "+"}</button>
                </div>
                {expanded && <div className={styles.checkGrid}>{option.tags.map((tag) => (
                  <label key={tag.id}><input type="checkbox" checked={filters.tagIds.includes(tag.id)}
                    onChange={() => update("tagIds", toggle(filters.tagIds, tag.id))} />{tag.name}</label>
                ))}</div>}
              </div>
            );
          })}
          {!matchingOptions.length && <p className={styles.hint}>No matching effects or tags.</p>}
        </div>
      </details>

      <details className={styles.group}>
        <summary>Unique Traits <span>{filters.uniqueTraitCategories.length + Number(Boolean(filters.uniqueTraitQuery.trim())) || ""}</span></summary>
        <div className={styles.groupBody}>
          <label className={styles.fieldLabel}>Search trait text
            <input value={filters.uniqueTraitQuery} onChange={(event) => update("uniqueTraitQuery", event.target.value)}
              placeholder="Search unique traits…" />
          </label>
          <fieldset className={styles.mode}>
            <legend>Category matching</legend>
            <div className={styles.segments}>
              {(["any", "all"] as UniqueTraitCategoryMatchMode[]).map((value) => (
                <button type="button" key={value} aria-pressed={filters.uniqueTraitMatchMode === value}
                  onClick={() => update("uniqueTraitMatchMode", value)}>Match {labelId(value)}</button>
              ))}
            </div>
          </fieldset>
          <div className={styles.checkGrid}>{uniqueTraitCategoryCatalog.map(({ id, label }) => (
            <label key={id}><input type="checkbox" checked={filters.uniqueTraitCategories.includes(id)}
              onChange={() => update("uniqueTraitCategories", toggle<UniqueTraitCategoryId>(filters.uniqueTraitCategories, id))} />{label}</label>
          ))}</div>
        </div>
      </details>

      <details className={styles.group}>
        <summary>Extra Trait Effects <span>{filters.nativeEffects.length || ""}</span></summary>
        <div className={styles.checkGrid}>{availableNativeEffects.map((id) => (
          <label key={id}><input type="checkbox" checked={filters.nativeEffects.includes(id)}
            onChange={() => update("nativeEffects", toggle(filters.nativeEffects, id))} />{labelId(id)}</label>
        ))}</div>
      </details>

      <details className={styles.group}>
        <summary>Status Reductions <span>{filters.statusReductions.length || ""}</span></summary>
        <div className={styles.checkGrid}>{availableReductions.map((id) => (
          <label key={id}><input type="checkbox" checked={filters.statusReductions.includes(id)}
            onChange={() => update("statusReductions", toggle<StatusEffectType>(filters.statusReductions, id))} />{labelId(id)}</label>
        ))}</div>
      </details>

      <details className={styles.group}>
        <summary>Native Traits <span>{filters.nativeTraits.length || ""}</span></summary>
        <div className={styles.checkGrid}>{(["atk", "def", "hp", "crit"] as NativeTraitType[]).map((id) => (
          <label key={id}><input type="checkbox" checked={filters.nativeTraits.includes(id)}
            onChange={() => update("nativeTraits", toggle<NativeTraitType>(filters.nativeTraits, id))} />{id.toUpperCase()}</label>
        ))}</div>
      </details>

      <div className={styles.footer}>
        <button type="button" onClick={() => onChange({ ...emptyFinderCatalogFilters })}
          disabled={countFinderCatalogFilters(filters) === 0} className={styles.clear}>Clear all filters</button>
        <button type="button" onClick={onClose} className={styles.done}>Show matching medals</button>
      </div>
    </section>
  );
}
