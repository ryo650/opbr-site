import type { Medal } from "@/data/medals/type";
import styles from "./MedalBuilder.module.css";

export default function SetAnalysis({ medals }: { medals: Medal[] }) {
  const tags = new Map<string, number>(); medals.forEach(m => m.tags.forEach(tag => tags.set(tag, (tags.get(tag) ?? 0) + 1)));
  const common = [...tags].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  return <aside className={styles.analysis}><div className={styles.panelHeading}><p>Set analysis</p><h2>Synergy at a glance</h2></div>
    <section><h3>Common tags</h3>{common.length ? <ul className={styles.tagAnalysis}>{common.map(([tag,count]) => <li key={tag}><span aria-label={`${count} of 3`}>{[1,2,3].map(n=><i className={n<=count ? styles.on : ""} key={n}/>)}</span><strong>{tag}</strong><small>{count}/3</small></li>)}</ul> : <p className={styles.empty}>Choose a medal to see shared tags.</p>}</section>
    <section><h3>Medal traits</h3>{medals.length ? <div className={styles.traits}>{medals.map(m=><details key={m.id} open><summary>{m.name}</summary><Trait label="Unique trait" values={[m.uniqueTrait]}/><Trait label="Native traits" values={m.nativeTraits}/><Trait label="Native effects" values={m.nativeEffects}/><Trait label="Status reductions" values={m.statusReductions}/></details>)}</div> : <p className={styles.empty}>Trait details will appear here.</p>}</section>
  </aside>;
}
function Trait({label,values}:{label:string;values:string[]}) { return <div className={styles.trait}><b>{label}</b><p>{values.length ? values.join(" · ") : "None"}</p></div> }
