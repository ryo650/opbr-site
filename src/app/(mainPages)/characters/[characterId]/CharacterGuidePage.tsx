import Image from "next/image";
import Link from "next/link";
import { CircleCheck, TriangleAlert } from "lucide-react";
import type { Character } from "@/data/characters/type";
import type { CharacterGuide, CounterMatchup, GuidePoint, StrongAgainstMatchup } from "@/data/character-guides/type";
import CharacterGuideSkills from "./CharacterGuideSkills";
import CharacterGuideTableOfContents, { type TableOfContentsItem } from "./CharacterGuideTableOfContents";
import CharacterGuideVideo from "./CharacterGuideVideo";
import styles from "./page.module.css";

const difficultyLabels = ["", "Slight Disadvantage", "Minor Disadvantage", "Disadvantage", "Major Disadvantage", "Severe Disadvantage"];
const advantageLabels = ["", "Slight Advantage", "Minor Advantage", "Advantage", "Major Advantage", "Overwhelming Advantage"];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section className={styles.section} id={id} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>{title}</h2>{children}</section>;
}

function PointGrid({ points }: { points: GuidePoint[] }) {
  return <div className={styles.pointGrid}>{points.map((point) => <article className={styles.card} key={point.title}><h3>{point.title}</h3><p>{point.description}</p></article>)}</div>;
}

function QuickPoints({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
  return <div className={styles.quickPoints}>
    {!!strengths.length && <section className={`${styles.quickList} ${styles.quickStrengths}`} aria-labelledby="quick-strengths-heading">
      <h3 id="quick-strengths-heading"><CircleCheck aria-hidden="true" />Quick Strengths</h3>
      <ul>{strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul>
    </section>}
    {!!weaknesses.length && <section className={`${styles.quickList} ${styles.quickWeaknesses}`} aria-labelledby="quick-weaknesses-heading">
      <h3 id="quick-weaknesses-heading"><TriangleAlert aria-hidden="true" />Quick Weaknesses</h3>
      <ul>{weaknesses.map((weakness) => <li key={weakness}>{weakness}</li>)}</ul>
    </section>}
  </div>;
}

function MatchupList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return <div className={styles.matchupDetails}><h4>{title}</h4><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function MatchupCard({ character, score, label, primaryTitle, primary, secondaryTitle, secondary }: { character: Character; score: number; label: string; primaryTitle: string; primary: string[]; secondaryTitle: string; secondary?: string[] }) {
  return <article className={styles.matchupCard}>
    <div className={styles.matchupHeader}><Image src={character.image} alt="" width={88} height={88} className={styles.matchupImage} /><div><h3>{character.name}</h3><p className={styles.matchupLabel}>{label}</p><div className={styles.meter} role="img" aria-label={`${label}: ${score} out of 5`}>{[1, 2, 3, 4, 5].map((step) => <span key={step} className={step <= score ? styles.meterActive : ""} />)}</div></div></div>
    <MatchupList title={primaryTitle} items={primary} />
    <MatchupList title={secondaryTitle} items={secondary} />
  </article>;
}

function CounterCard({ matchup, character }: { matchup: CounterMatchup; character: Character }) {
  return <MatchupCard character={character} score={matchup.difficulty} label={difficultyLabels[matchup.difficulty]} primaryTitle="Why It Is Difficult" primary={matchup.whyDifficult} secondaryTitle="How to Respond" secondary={matchup.howToRespond} />;
}

function StrongAgainstCard({ matchup, character }: { matchup: StrongAgainstMatchup; character: Character }) {
  return <MatchupCard character={character} score={matchup.advantage} label={advantageLabels[matchup.advantage]} primaryTitle="Why You Win" primary={matchup.whyYouWin} secondaryTitle="Watch Out" secondary={matchup.watchOut} />;
}

export default function CharacterGuidePage({ character, guide, matchupCharacters }: { character: Character; guide: CharacterGuide; matchupCharacters: Record<string, Character> }) {
  const hasStrengthsAndWeaknesses = Boolean(guide.quickStrengths.length || guide.quickWeaknesses.length || guide.strengths?.length || guide.weaknesses?.length);
  const skillGroups = guide.skillGroups?.filter((group) => group.skills.length) ?? [];
  const tableOfContents = [
    guide.overview && ["overview-stats", "Overview Stats"],
    hasStrengthsAndWeaknesses && ["strengths-and-weaknesses", "Strengths & Weaknesses"],
    guide.normalAttacks?.length && ["normal-attacks", "Normal Attacks"],
    skillGroups.length && ["skills", "Skills"],
    guide.howToPlay?.length && ["how-to-play", "How to Play"],
    guide.counters?.length && ["counters", "Counters"],
    guide.strongAgainst?.length && ["strong-against", "Strong Against"],
  ].filter((item): item is [string, string] => Boolean(item)).map(([id, label]): TableOfContentsItem => ({ id, label }));

  return <main className={`${styles.page} upper-page-background`}>
    <article className={styles.content}>
      <header className={styles.hero}><div className={styles.portraitWrap}><Image src={character.image} alt={character.name} width={280} height={280} className={styles.portrait} preload /></div><div><p className={styles.eyebrow}>Character Guide</p><h1>{character.name}</h1><div className={styles.badges}><span>{character.element} element</span><span>{character.role}</span></div></div></header>

      {guide.notice && <aside className={styles.notice}><p className={styles.eyebrow}>{guide.notice.title}</p><p>{guide.notice.description}</p></aside>}

      <section className={styles.introduction} aria-labelledby="guide-overview-heading"><p className={styles.eyebrow}>Guide Overview</p><h2 id="guide-overview-heading">Master {character.name}</h2><p>Review the character&apos;s key strengths, weaknesses, attacks, matchups, and practical game plan.</p></section>

      <div className={styles.guideLayout}>
      <div className={styles.guideSections}>
      {guide.overview && <Section id="overview-stats" title="Overview Stats"><dl className={styles.stats}>{Object.entries(guide.overview).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value.toLocaleString("en-US")}</dd></div>)}</dl></Section>}

      {hasStrengthsAndWeaknesses && <Section id="strengths-and-weaknesses" title="Strengths and Weaknesses">
        <QuickPoints strengths={guide.quickStrengths} weaknesses={guide.quickWeaknesses} />
        {!!guide.strengths?.length && <div className={styles.pointSection}><h3>Strengths</h3><PointGrid points={guide.strengths} /></div>}
        {!!guide.weaknesses?.length && <div className={styles.pointSection}><h3>Weaknesses</h3><PointGrid points={guide.weaknesses} /></div>}
      </Section>}

      {!!guide.normalAttacks?.length && <Section id="normal-attacks" title="Normal Attacks"><div className={styles.mediaGrid}>{guide.normalAttacks.map((attack, index) => <article className={`${styles.card} ${styles.attackCard}`} key={`${attack.label}-${index}`}><div><p className={styles.skillLabel}>{attack.form}</p><h3>{attack.label}</h3></div>{attack.video && <CharacterGuideVideo src={attack.video} label={`${character.name} ${attack.label}`} />}{!!attack.tips.length && <div className={styles.details}><h4>Tips</h4><ul>{attack.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>}</article>)}</div></Section>}
      {!!skillGroups.length && <Section id="skills" title="Skills"><CharacterGuideSkills groups={skillGroups} /></Section>}
      {!!guide.howToPlay?.length && <Section id="how-to-play" title="How to Play"><PointGrid points={guide.howToPlay} /></Section>}
      {!!guide.counters?.length && <Section id="counters" title="Counters"><div className={styles.matchupGrid}>{guide.counters.map((matchup) => <CounterCard key={matchup.characterId} matchup={matchup} character={matchupCharacters[matchup.characterId]} />)}</div></Section>}
      {!!guide.strongAgainst?.length && <Section id="strong-against" title="Strong Against"><div className={styles.matchupGrid}>{guide.strongAgainst.map((matchup) => <StrongAgainstCard key={matchup.characterId} matchup={matchup} character={matchupCharacters[matchup.characterId]} />)}</div></Section>}
      <aside className={styles.cta}><p className={styles.eyebrow}>Explore the meta</p><h2>See how {character.name} compares with the rest of the current meta.</h2><Link href="/tier-list">View OPBR Tier List</Link></aside>
      </div>
      {!!tableOfContents.length && <CharacterGuideTableOfContents items={tableOfContents} />}
      </div>
    </article>
  </main>;
}
