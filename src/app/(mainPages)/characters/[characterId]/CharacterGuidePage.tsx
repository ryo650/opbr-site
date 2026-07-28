import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/data/characters/type";
import type {
  CharacterAdvantage,
  CharacterCounter,
  CharacterGuide,
  GuidePoint,
} from "@/data/character-guides/type";
import styles from "./page.module.css";

const difficultyLabels = ["", "Slight Disadvantage", "Minor Disadvantage", "Disadvantage", "Major Disadvantage", "Severe Disadvantage"];
const advantageLabels = ["", "Slight Advantage", "Minor Advantage", "Advantage", "Major Advantage", "Overwhelming Advantage"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className={styles.section} aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>{title}</h2>{children}</section>;
}

function PointGrid({ points }: { points: GuidePoint[] }) {
  return <div className={styles.pointGrid}>{points.map((point) => <article className={styles.card} key={point.title}><h3>{point.title}</h3><p>{point.description}</p></article>)}</div>;
}

function GuideVideo({ src, label }: { src: string; label: string }) {
  return <video className={styles.video} controls playsInline preload="metadata" aria-label={label}><source src={src} type="video/mp4" />Your browser does not support HTML video.</video>;
}

type MatchupProps = { matchup: CharacterCounter | CharacterAdvantage; character: Character; kind: "counter" | "advantage" };

function MatchupCard({ matchup, character, kind }: MatchupProps) {
  const score = kind === "counter" ? (matchup as CharacterCounter).difficulty : (matchup as CharacterAdvantage).advantage;
  const label = (kind === "counter" ? difficultyLabels : advantageLabels)[score];
  return <article className={styles.matchupCard}>
    <div className={styles.matchupHeader}><Image src={character.image} alt="" width={88} height={88} className={styles.matchupImage} /><div><h3>{character.name}</h3><p className={styles.matchupLabel}>{label}</p><div className={styles.meter} role="img" aria-label={`${label}: ${score} out of 5`}>{[1,2,3,4,5].map((step) => <span key={step} className={step <= score ? styles.meterActive : ""} />)}</div></div></div>
    <p>{matchup.reason}</p>
  </article>;
}

export default function CharacterGuidePage({ character, guide, matchupCharacters }: { character: Character; guide: CharacterGuide; matchupCharacters: Record<string, Character> }) {
  const renderMatchups = (items: (CharacterCounter | CharacterAdvantage)[], kind: "counter" | "advantage") => <div className={styles.matchupGrid}>{items.map((matchup) => <MatchupCard key={matchup.characterId} matchup={matchup} character={matchupCharacters[matchup.characterId]} kind={kind} />)}</div>;

  return <main className={`${styles.page} upper-page-background`}>
    <article className={styles.content}>
      <header className={styles.hero}><div className={styles.portraitWrap}><Image src={character.image} alt={character.name} width={280} height={280} className={styles.portrait} priority /></div><div><p className={styles.eyebrow}>Character Guide</p><h1>{character.name}</h1><div className={styles.badges}><span>{character.element} element</span><span>{character.role}</span></div></div></header>
      {guide.overview && <Section title="Overview Stats"><dl className={styles.stats}>{Object.entries(guide.overview).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value.toLocaleString("en-US")}</dd></div>)}</dl></Section>}
      {!!guide.strengths?.length && <Section title="Strengths"><PointGrid points={guide.strengths} /></Section>}
      {!!guide.weaknesses?.length && <Section title="Weaknesses"><PointGrid points={guide.weaknesses} /></Section>}
      {!!guide.normalAttacks?.length && <Section title="Normal Attacks"><div className={styles.mediaGrid}>{guide.normalAttacks.map((attack, index) => attack.video && <GuideVideo key={attack.video} src={attack.video} label={`${character.name} normal attacks${index ? ` ${index + 1}` : ""}`} />)}</div></Section>}
      {!!guide.skills?.length && <Section title="Skills"><div className={styles.skillGrid}>{guide.skills.map((skill) => <article className={`${styles.card} ${styles.skillCard}`} key={skill.name}><div className={styles.skillTitle}><h3>{skill.name}</h3>{skill.cooldown !== undefined && <span>{skill.cooldown}s cooldown</span>}</div>{skill.video && <GuideVideo src={skill.video} label={`${skill.name} demonstration`} />}<p>{skill.description}</p>{!!skill.quickTips?.length && <div className={styles.tips}><h4>Quick Tips</h4><ul>{skill.quickTips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>}</article>)}</div></Section>}
      {!!guide.howToPlay?.length && <Section title="How to Play"><PointGrid points={guide.howToPlay} /></Section>}
      {!!guide.counters?.length && <Section title="Counters">{renderMatchups(guide.counters, "counter")}</Section>}
      {!!guide.strongAgainst?.length && <Section title="Strong Against">{renderMatchups(guide.strongAgainst, "advantage")}</Section>}
      <aside className={styles.cta}><p className={styles.eyebrow}>Explore the meta</p><h2>See how {character.name} compares with the rest of the current meta.</h2><Link href="/tier-list">View OPBR Tier List</Link></aside>
    </article>
  </main>;
}
