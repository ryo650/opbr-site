"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import type { Medal, MedalCategory } from "@/data/medals/type";
import MedalCard from "./MedalCard";
import MedalSetSlots from "./MedalSetSlots";
import SetAnalysis from "./SetAnalysis";
import styles from "./MedalBuilder.module.css";

type Sort = "default" | "az" | "za" | "category" | "match";
type FilterKey = "tags" | "nativeTraits" | "nativeEffects" | "statusReductions";

export default function MedalBuilder({ medals }: { medals: Medal[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState(""); const [category, setCategory] = useState<"all" | MedalCategory>("all");
  const [sort, setSort] = useState<Sort>("default"); const [filtersOpen, setFiltersOpen] = useState(false); const [mobileTab, setMobileTab] = useState<"medals"|"analysis">("medals");
  const [filters, setFilters] = useState<Record<FilterKey,string[]>>({tags:[],nativeTraits:[],nativeEffects:[],statusReductions:[]});
  const selected = useMemo(() => selectedIds.map(id => medals.find(m => m.id === id)).filter((m):m is Medal => Boolean(m)), [selectedIds, medals]);
  const selectedTags = useMemo(() => new Set(selected.flatMap(m=>m.tags)), [selected]);
  const options = useMemo(() => ({ tags: unique(medals.flatMap(m=>m.tags)), nativeTraits: unique(medals.flatMap(m=>m.nativeTraits)), nativeEffects: unique(medals.flatMap(m=>m.nativeEffects)), statusReductions: unique(medals.flatMap(m=>m.statusReductions)) }), [medals]);
  const shown = useMemo(() => medals.map((m,index)=>({m,index})).filter(({m}) => {
    const term=query.trim().toLowerCase(); const searchable=[m.name,...m.tags].join(" ").toLowerCase();
    return (!term || searchable.includes(term)) && (category==="all" || m.category===category) && (Object.keys(filters) as FilterKey[]).every(key => filters[key].length===0 || filters[key].every(value => m[key].includes(value)));
  }).sort((a,b)=> sort==="az" ? a.m.name.localeCompare(b.m.name) : sort==="za" ? b.m.name.localeCompare(a.m.name) : sort==="category" ? a.m.category.localeCompare(b.m.category)||a.m.name.localeCompare(b.m.name) : sort==="match" ? match(b.m,selectedTags)-match(a.m,selectedTags)||a.index-b.index : a.index-b.index).map(x=>x.m), [medals,query,category,filters,sort,selectedTags]);
  const toggleFilter=(key:FilterKey,value:string)=>setFilters(current=>({...current,[key]:current[key].includes(value)?current[key].filter(v=>v!==value):[...current[key],value]}));
  const activeFilters=Object.values(filters).reduce((sum,list)=>sum+list.length,0);
  const toggleMedal=(id:string)=>setSelectedIds(current=>current.includes(id)?current.filter(x=>x!==id):current.length<3?[...current,id]:current);
  return <main className={`${styles.page} upper-page-background`}>
    <div className={styles.content}><header className={styles.hero}><p>Build smarter</p><h1>Medal Builder</h1><span>Build a set of up to three medals, compare shared tags, and review every native trait in one place.</span></header>
      <MedalSetSlots selected={selected} onRemove={id=>setSelectedIds(ids=>ids.filter(x=>x!==id))}/>
      <div className={styles.mobileTabs}><button aria-pressed={mobileTab==="medals"} onClick={()=>setMobileTab("medals")}>Medals</button><button aria-pressed={mobileTab==="analysis"} onClick={()=>setMobileTab("analysis")}>Set Analysis</button></div>
      <div className={styles.workspace}><section className={`${styles.browser} ${mobileTab==="analysis"?styles.mobileHidden:""}`}><div className={styles.browserHeading}><div><p>Medal library</p><h2>Choose your medals</h2></div><span>{shown.length} medals</span></div>
        <div className={styles.controls}><label className={styles.search}><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search medals or tags…" aria-label="Search medals"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X/></button>}</label>
          <select value={sort} onChange={e=>setSort(e.target.value as Sort)} aria-label="Sort medals"><option value="default">Default</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="category">Category</option>{selected.length>0&&<option value="match">Best Tag Match</option>}</select>
          <button className={styles.filterButton} onClick={()=>setFiltersOpen(true)}><Filter/> Filters {activeFilters>0&&<b>{activeFilters}</b>}</button></div>
        <div className={styles.categories}>{(["all","character","event"] as const).map(value=><button key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div>
        {selected.length===3&&<p className={styles.fullNotice}>Your set is full. Remove a medal before choosing another.</p>}
        {shown.length?<div className={styles.grid}>{shown.map(m=><MedalCard key={m.id} medal={m} selected={selectedIds.includes(m.id)} disabled={selected.length===3} onSelect={()=>toggleMedal(m.id)}/>)}</div>:<div className={styles.noResults}><SlidersHorizontal/><h3>No medals found</h3><p>Try removing a filter or changing your search.</p></div>}</section>
        <div className={`${styles.analysisWrap} ${mobileTab==="medals"?styles.mobileHidden:""}`}><SetAnalysis medals={selected}/></div></div>
    </div>
    {filtersOpen&&<div className={styles.drawerBackdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setFiltersOpen(false)}}><aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Medal filters"><header><div><p>Refine medals</p><h2>Filters</h2></div><button onClick={()=>setFiltersOpen(false)} aria-label="Close filters"><X/></button></header><div className={styles.filterScroll}>{([['tags','Tags'],['nativeTraits','Native Traits'],['nativeEffects','Native Effects'],['statusReductions','Status Reductions']] as [FilterKey,string][]).map(([key,label])=><fieldset key={key}><legend>{label}</legend><div>{options[key].map(value=><label key={value}><input type="checkbox" checked={filters[key].includes(value)} onChange={()=>toggleFilter(key,value)}/><span>{value}</span></label>)}</div></fieldset>)}</div><footer><button onClick={()=>setFilters({tags:[],nativeTraits:[],nativeEffects:[],statusReductions:[]})}>Clear all</button><button onClick={()=>setFiltersOpen(false)}>Show {shown.length} medals</button></footer></aside></div>}
  </main>;
}
function unique(values:string[]){return [...new Set(values)].sort((a,b)=>a.localeCompare(b))} function match(m:Medal,tags:Set<string>){return m.tags.reduce((n,t)=>n+(tags.has(t)?1:0),0)}
