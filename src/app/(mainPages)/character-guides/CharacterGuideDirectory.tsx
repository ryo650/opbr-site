"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { filterCharacterGuideEntries, type CharacterGuideEntry } from "@/lib/character-guide-directory";
import styles from "./page.module.css";

export default function CharacterGuideDirectory({ entries }: { entries: CharacterGuideEntry[] }) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState("");
  const [role, setRole] = useState("");
  const visibleEntries = filterCharacterGuideEntries(entries, query, element, role);
  const elements = [...new Set(entries.map((entry) => entry.element))].sort();
  const roles = [...new Set(entries.map((entry) => entry.role))].sort();
  const hasFilters = Boolean(query || element || role);
  const resetFilters = () => { setQuery(""); setElement(""); setRole(""); };

  if (!entries.length) {
    return <section className={styles.empty} aria-labelledby="empty-heading">
      <h2 id="empty-heading">No character guides yet</h2>
      <p>Character Guides will appear here as they are published.</p>
      <Link href="/" className={styles.relatedLink}>Explore OPBR Guide</Link>
    </section>;
  }

  return (
    <section className={styles.directory} aria-label="Published character guides">
      <div className={styles.filters}>
        <div className={`${styles.filterField} ${styles.searchLabel}`}>
          <label htmlFor="guide-search">Search characters</label>
          <span className={styles.searchField}>
            <Search aria-hidden="true" />
            <input id="guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Character name or version" />
          </span>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="guide-element">Element</label>
          <select id="guide-element" value={element} onChange={(event) => setElement(event.target.value)}>
            <option value="">All elements</option>
            {elements.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="guide-role">Role</label>
          <select id="guide-role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">All roles</option>
            {roles.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.results}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {hasFilters ? `${visibleEntries.length} of ${entries.length} guides` : `${entries.length} character ${entries.length === 1 ? "guide" : "guides"}`}
        </p>
        {hasFilters && <button type="button" onClick={resetFilters}>Clear filters</button>}
      </div>
      {visibleEntries.length ? (
        <ul className={styles.grid}>
          {visibleEntries.map((entry, index) => (
            <li key={entry.id}>
              <Link href={`/characters/${entry.id}`} className={styles.card}>
                <div className={styles.portraitWrap}>
                  <Image src={entry.image} alt="" width={280} height={280}
                    sizes="(max-width: 719px) 240px, 280px"
                    loading={index < 3 ? "eager" : "lazy"} className={styles.portrait} />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.badges}>
                    <span>{entry.element} element</span><span>{entry.role}</span>
                  </div>
                  <h2>{entry.name}</h2>
                  {entry.notice && <p className={styles.notice}>{entry.notice}</p>}
                  {entry.summary && <p className={styles.summary}>{entry.summary}</p>}
                  <span className={styles.action}>View Character Guide <ArrowRight aria-hidden="true" /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <h2>No matching guides</h2>
          <p>Try another character name, element, or role.</p>
          <button type="button" onClick={resetFilters}>Show all guides</button>
        </div>
      )}
    </section>
  );
}
