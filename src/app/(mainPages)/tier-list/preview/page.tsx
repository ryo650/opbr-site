import Link from "next/link";
import { notFound } from "next/navigation";
import ImportantTierUpdate from "@/components/tier-list/ImportantTierUpdate";
import TierList from "@/components/tier-list/TierList";
import { tierList } from "@/data/tierList";
import { getImportantTierUpdateState } from "@/lib/tier-important-updates";
import styles from "../page.module.css";
import previewStyles from "./page.module.css";

export const metadata = { title: "Local Tier Update Demo", robots: { index: false, follow: false }, alternates: { canonical: "/tier-list" } };

export default async function TierUpdatePreview({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { getDemoScenario } = await import("../../../../../tests/fixtures/tier-important-updates");
  const { scenario } = await searchParams;
  const { events, now } = getDemoScenario(scenario);
  const { update, currentTiers, badges } = getImportantTierUpdateState(events, tierList, now);
  return (
    <main id="main-content" tabIndex={-1} className={`${styles.page} upper-page-background`}>
      <div className={styles.content}>
        <section className={styles.introduction}>
          <p className={styles.eyebrow}>Local development preview · Demo data</p>
          <h1 className={styles.title}>Important Tier Updates</h1>
          <p className={styles.description}>Fictional movements, dates and reasons for UI testing only. The Tier List below uses the unchanged current rankings. This page is unavailable in production.</p>
          <nav className={previewStyles.scenarios} aria-label="Demo scenarios">
            {[["active", "Active"], ["expired", "14-day boundary"], ["mismatch", "Tier mismatch"], ["draft", "Unpublished"], ["future", "Before publication"], ["empty", "No updates"]].map(([value, label]) => <Link key={value} aria-current={(scenario ?? "active") === value ? "page" : undefined} href={`?scenario=${value}`}>{label}</Link>)}
          </nav>
        </section>
        {!update && <p className={previewStyles.empty}>No published important update at the simulated time. Production renders no update panel or card markers in this state.</p>}
        <section className={styles.tierSection} aria-labelledby="tier-list-heading">
          <div className={styles.sectionHeading}><p className={styles.sectionKicker}>Current rankings · Unchanged</p><h2 id="tier-list-heading" tabIndex={-1}>Tier List</h2><p>Characters are ranked from strongest to weakest within each tier.</p></div>
          <TierList badges={badges} preview />
        </section>

        <ImportantTierUpdate update={update} currentTiers={currentTiers} demo />
      </div>
    </main>
  );
}
