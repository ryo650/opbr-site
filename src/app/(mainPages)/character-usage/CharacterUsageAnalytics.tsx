"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Character } from "@/data/characters/type";
import { buildChartData, filterSnapshotsByRange } from "@/data/character-usage/helpers";
import type { CharacterUsageRankingItem, ProcessedCharacterUsageSnapshot, UsageRange } from "@/data/character-usage/type";
import styles from "./page.module.css";

const ranges: UsageRange[] = ["1M", "3M", "6M", "1Y", "All"];
const colors = ["#fbbf24", "#60a5fa", "#f472b6", "#34d399", "#c084fc", "#fb7185", "#22d3ee", "#f97316", "#a3e635", "#818cf8", "#e879f9"];
const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatDate = (date: string, short = false) => new Intl.DateTimeFormat("en-US", { month: short ? "short" : "long", day: "numeric", year: short ? undefined : "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className={styles.neutral}>No previous data</span>;
  const direction = value > 0 ? styles.positive : value < 0 ? styles.negative : styles.neutral;
  return <span className={direction}>{value > 0 ? "+" : ""}{value.toFixed(1)} pts</span>;
}

function CharacterIdentity({ item, linked }: { item: CharacterUsageRankingItem; linked: boolean }) {
  const content = <><Image src={item.character.image} alt="" width={48} height={48} /><span>{item.character.name}</span></>;
  return linked ? <Link className={styles.identity} href={`/characters/${item.characterId}`}>{content}</Link> : <div className={styles.identity}>{content}</div>;
}

type Props = { snapshots: ProcessedCharacterUsageSnapshot[]; availableCharacters: Character[]; guideCharacterIds: string[] };

export default function CharacterUsageAnalytics({ snapshots, availableCharacters, guideCharacterIds }: Props) {
  const latest = snapshots.at(-1)!;
  const baselineIds = useMemo(() => latest.ranking.slice(0, 10).map((item) => item.characterId), [latest]);
  const [focusedId, setFocusedId] = useState(baselineIds[0] ?? availableCharacters[0]?.id ?? "");
  const [range, setRange] = useState<UsageRange>("All");
  const [query, setQuery] = useState("");
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const visibleIds = useMemo(() => focusedId && !baselineIds.includes(focusedId) ? [...baselineIds, focusedId] : baselineIds, [baselineIds, focusedId]);
  const filteredSnapshots = useMemo(() => filterSnapshotsByRange(snapshots, range), [snapshots, range]);
  const rows = useMemo(() => buildChartData(filteredSnapshots, visibleIds), [filteredSnapshots, visibleIds]);
  const rankingById = new Map(latest.ranking.map((item) => [item.characterId, item]));
  const visibleItems = visibleIds.map((id) => rankingById.get(id)).filter((item): item is CharacterUsageRankingItem => Boolean(item));
  const filteredCharacters = availableCharacters.filter((character) => `${character.name} ${character.element} ${character.role}`.toLowerCase().includes(query.toLowerCase().trim()));
  const availableRanges = new Map(ranges.map((item) => [item, filterSnapshotsByRange(snapshots, item).length]));

  return <>
    <section className={styles.analytics} aria-labelledby="trends-heading">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Usage over time</p><h2 id="trends-heading">Estimated player usage</h2></div><div className={styles.ranges} aria-label="Chart time range">{ranges.map((item) => <button type="button" key={item} aria-pressed={range === item} disabled={!availableRanges.get(item)} onClick={() => setRange(item)}>{item}</button>)}</div></div>
      <div className={styles.selector}>
        <label htmlFor="character-search"><Search aria-hidden="true" />Search tracked characters</label>
        <input id="character-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, element, or role" />
        <div className={styles.selectorList} aria-label="Tracked character results">
          {filteredCharacters.map((character) => {
            const isBaseline = baselineIds.includes(character.id); const isFocused = focusedId === character.id;
            return <button key={character.id} type="button" className={isFocused ? styles.selectedCharacter : ""} aria-pressed={isFocused} onClick={() => setFocusedId(character.id)}><Image src={character.image} alt="" width={42} height={42} /><span><strong>{character.name}</strong><small>{character.element} · {character.role}</small></span><span className={styles.selectorStatus}>{isFocused ? "Focused" : isBaseline ? "Top 10" : ""}</span></button>;
          })}
          {!filteredCharacters.length && <p className={styles.noResults}>No tracked characters match your search.</p>}
        </div>
      </div>
      <UsageChart rows={rows} characters={availableCharacters} visibleIds={visibleIds} focusedId={focusedId} tooltipIndex={tooltipIndex} setTooltipIndex={setTooltipIndex} />
      {rows.length === 1 && <p className={styles.historyNote}>More historical data will appear after future updates.</p>}
      {!rows.length && <p className={styles.empty}>No snapshots are available in this time range.</p>}
      <div className={styles.summaryGrid} aria-label="Characters represented in chart">{visibleItems.map((item, index) => <article key={item.characterId} onClick={() => setFocusedId(item.characterId)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setFocusedId(item.characterId); }} tabIndex={0} className={`${styles.summaryCard} ${focusedId === item.characterId ? styles.focusedCard : ""}`} aria-label={`Focus ${item.character.name}`}><span className={styles.colorDot} style={{ background: colors[index % colors.length] }} /><CharacterIdentity item={item} linked={guideCharacterIds.includes(item.characterId)} /><span className={styles.summaryRank}>#{item.rank}</span><dl><div><dt>Count</dt><dd>{item.count}</dd></div><div><dt>Est. usage</dt><dd>{formatPercent(item.usageRate)}</dd></div><div><dt>Change</dt><dd><Change value={item.changePoints} /></dd></div></dl></article>)}</div>
    </section>
    <section className={styles.rankings} aria-labelledby="ranking-heading">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Latest snapshot · {formatDate(latest.date)}</p><h2 id="ranking-heading">Complete latest ranking</h2><p>{latest.ranking.length} characters recorded across {latest.recordedSlots} team slots.</p></div></div>
      <div className={styles.rankingList}>{latest.ranking.map((item) => <article key={item.characterId} className={`${styles.rankingRow} ${focusedId === item.characterId ? styles.focusedRow : ""}`}><button type="button" className={styles.rankButton} onClick={() => setFocusedId(item.characterId)} aria-label={`Focus ${item.character.name}`}><span className={styles.rank}>#{item.rank}</span></button><CharacterIdentity item={item} linked={guideCharacterIds.includes(item.characterId)} />{baselineIds.includes(item.characterId) && <span className={styles.topBadge}>Top 10</span>}<dl><div><dt>Count</dt><dd>{item.count}</dd></div><div><dt>Est. usage</dt><dd>{formatPercent(item.usageRate)}</dd></div><div><dt>Change</dt><dd><Change value={item.changePoints} /></dd></div></dl></article>)}</div>
    </section>
  </>;
}

function UsageChart({ rows, characters, visibleIds, focusedId, tooltipIndex, setTooltipIndex }: { rows: ReturnType<typeof buildChartData>; characters: Character[]; visibleIds: string[]; focusedId: string; tooltipIndex: number | null; setTooltipIndex: (index: number | null) => void }) {
  if (!rows.length) return null;
  const width = 900, height = 360, left = 54, right = 18, top = 22, bottom = 48;
  const maxValue = Math.max(10, ...rows.flatMap((row) => visibleIds.map((id) => row.values[id]?.usageRate ?? 0)));
  const ceiling = Math.ceil(maxValue / 10) * 10;
  const x = (index: number) => rows.length === 1 ? (left + width - right) / 2 : left + index * (width - left - right) / (rows.length - 1);
  const y = (value: number) => top + (ceiling - value) / ceiling * (height - top - bottom);
  const characterMap = new Map(characters.map((character) => [character.id, character]));
  const activeRow = tooltipIndex === null ? null : rows[tooltipIndex];
  const tooltipItems = activeRow ? visibleIds.map((id, colorIndex) => ({ id, colorIndex, character: characterMap.get(id)!, ...activeRow.values[id] })).sort((a, b) => b.usageRate - a.usageRate || a.character.name.localeCompare(b.character.name)) : [];
  return <div className={styles.chartShell} onMouseLeave={() => setTooltipIndex(null)}>
    <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Estimated player usage by snapshot date">
      {[0, .25, .5, .75, 1].map((ratio) => { const value = ceiling * (1 - ratio); const lineY = top + ratio * (height - top - bottom); return <g key={ratio}><line x1={left} x2={width-right} y1={lineY} y2={lineY} className={styles.gridLine}/><text x={left-10} y={lineY+4} textAnchor="end">{value.toFixed(0)}%</text></g>; })}
      {rows.map((row, index) => <g key={row.date}><line x1={x(index)} x2={x(index)} y1={top} y2={height-bottom} className={styles.hoverColumn} onMouseEnter={() => setTooltipIndex(index)} onFocus={() => setTooltipIndex(index)} tabIndex={0} aria-label={`${formatDate(row.date)} chart details`} /><text x={x(index)} y={height-17} textAnchor="middle">{formatDate(row.date, true)}</text></g>)}
      {visibleIds.map((id, colorIndex) => { const points = rows.map((row, index) => `${x(index)},${y(row.values[id]?.usageRate ?? 0)}`).join(" "); const focused = id === focusedId; return <g key={id} opacity={focused ? 1 : focusedId ? .58 : .85}><polyline points={points} fill="none" stroke={colors[colorIndex % colors.length]} strokeWidth={focused ? 4 : 2.25} strokeLinejoin="round" strokeLinecap="round" />{rows.map((row, index) => <circle key={row.date} cx={x(index)} cy={y(row.values[id]?.usageRate ?? 0)} r={focused ? 5.5 : 4} fill="#202124" stroke={colors[colorIndex % colors.length]} strokeWidth={focused ? 3 : 2} />)}</g>; })}
    </svg>
    {activeRow && <div className={styles.tooltip}><strong>{formatDate(activeRow.date)}</strong>{tooltipItems.map((item) => <div key={item.id} className={item.id === focusedId ? styles.tooltipFocused : ""}><Image src={item.character.image} alt="" width={30} height={30}/><span>{item.character.name}<small>{item.count} recorded</small></span><b style={{ color: colors[item.colorIndex % colors.length] }}>{formatPercent(item.usageRate)}</b></div>)}</div>}
  </div>;
}
