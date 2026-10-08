import Image from "next/image";
import CharacterGuideLink from "@/components/characters/CharacterGuideLink";
import { characters } from "@/data/characters";
import type { ImportantTierChange, ImportantTierUpdate as Update } from "@/data/tier-important-updates";
import { tierChangeLabels } from "@/lib/tier-important-updates";
import styles from "./ImportantTierUpdate.module.css";
import markerStyles from "./TierUpdateBadge.module.css";

function Change({ change, currentTier }: { change: ImportantTierChange; currentTier?: string }) {
  const character = characters[change.characterId];
  if (!character) return null;
  const { symbol, label } = tierChangeLabels[change.kind];
  const changedSince = currentTier !== change.toTier;
  const sameTierRise = change.kind === "rise" && change.fromTier === change.toTier;
  return (
    <li className={`${styles.change} ${markerStyles[change.kind]}`}>
      <Image src={character.image} alt="" width={44} height={44} className={styles.portrait} />
      <div className={styles.changeContent}>
        <div className={styles.changeHeading}>
          <CharacterGuideLink characterId={character.id} characterName={character.name} className={styles.guideLink}>
            <span className={styles.name}>{character.name}</span>
          </CharacterGuideLink>
          <span className={styles.movement}><span aria-hidden="true">{symbol}</span> {label}</span>
        </div>
        <p className={styles.tiers}>
          {sameTierRise ? (
            <><strong>{change.toTier}</strong><span className={styles.sameTier}> · Higher within tier</span></>
          ) : (
            <><span>{change.fromTier ?? "Unranked"}</span><span aria-hidden="true"> → </span><span className={styles.srOnly}> to </span><strong>{change.toTier}</strong></>
          )}
          {change.kind === "adjustment" && <span className={styles.sameTier}> · Same tier</span>}
        </p>
        <p className={styles.reason}>{change.reason}</p>
        {changedSince && <p className={styles.current}>At publication: {change.toTier}. Current tier: {currentTier ?? "Unranked"}. Rankings above take priority.</p>}
      </div>
    </li>
  );
}

export default function ImportantTierUpdate({ update, currentTiers, demo = false }: {
  update: Update | null;
  currentTiers: Record<string, string>;
  demo?: boolean;
}) {
  if (!update) return null;
  const visible = update.changes.slice(0, 3);
  const additional = update.changes.slice(3);
  const date = new Date(update.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  return (
    <section id="tier-important-update" tabIndex={-1} className={styles.panel} aria-labelledby="important-update-heading">
      <header className={styles.articleHeader}>
        <div className={styles.topline}>
          <p className={styles.kicker}>{demo ? "Demo · Latest important update" : "Latest important update"}</p>
          <time dateTime={update.publishedAt}>{date} <span className={styles.timezone}>(UTC)</span></time>
        </div>
        <h2 id="important-update-heading">{update.title}</h2>
        <p className={styles.summary}>{update.summary}</p>
      </header>
      <div className={styles.assessmentHeading}>
        <h3 className={styles.label}>OPBR Guide assessment</h3>
        <span>{update.changes.length} characters</span>
      </div>
      <ul className={styles.changes}>{visible.map((change) => <Change key={change.characterId} change={change} currentTier={currentTiers[change.characterId]} />)}</ul>
      {additional.length > 0 && (
        // Native disclosure may be toggled before React hydrates; preserve that browser state.
        <details className={styles.more} suppressHydrationWarning>
          <summary><span className={styles.closedLabel}>Show {additional.length} more characters</span><span className={styles.openLabel}>Show fewer characters</span><span className={styles.chevron} aria-hidden="true">⌄</span></summary>
          <ul className={styles.changes}>{additional.map((change) => <Change key={change.characterId} change={change} currentTier={currentTiers[change.characterId]} />)}</ul>
        </details>
      )}
      {update.officialAdjustment && (
        <section className={styles.official} aria-labelledby="official-adjustment-heading">
          <h3 id="official-adjustment-heading" className={styles.label}>{demo ? "Demo official notice · Not a real adjustment" : "Official adjustment · Verified facts"}</h3>
          <p>{update.officialAdjustment.summary}</p>
          <a href={update.officialAdjustment.sourceUrl}>{demo ? "Illustrative source" : "Official source"} · <time dateTime={update.officialAdjustment.date}>{update.officialAdjustment.date}</time> <span aria-hidden="true">↗</span></a>
        </section>
      )}
      <p className={styles.note}>Tiers shown here reflect this review. The table above is the current ranking. <span aria-hidden="true">↑ ↓ + ≈</span> Card markers link to this summary and last up to 14 days, or until the next important update. <a href="#tier-list-heading">Back to Tier List ↑</a></p>
    </section>
  );
}
