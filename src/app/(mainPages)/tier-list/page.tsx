import TierList from "../../../components/tier-list/TierList"
import styles from "./page.module.css"
import { connection } from "next/server"
import ImportantTierUpdate from "@/components/tier-list/ImportantTierUpdate"
import { importantTierUpdates } from "@/data/tier-important-updates"
import { tierList } from "@/data/tierList"
import { getImportantTierUpdateState } from "@/lib/tier-important-updates"

export const metadata = {
  alternates: { canonical: "/tier-list" },
  title: "OPBR Tier List | Best Characters in One Piece Bounty Rush",
  description:
    "Check the latest OPBR tier list for One Piece Bounty Rush. Find the best characters ranked by current meta strength, league battle performance, roles, and overall usefulness. Stay updated with the top picks for your team.",
}

export default async function TierListPage() {
  // Empty production data keeps the existing static page. Registered events need request-time dates.
  if (importantTierUpdates.length > 0) await connection()
  // Request-time Server Component, matching the existing scout page clock policy.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const { update, currentTiers, badges } = getImportantTierUpdateState(importantTierUpdates, tierList, now)
  return (
    <main id="main-content" tabIndex={-1} className={`${styles.page} upper-page-background`}>
      <div className={styles.content}>
        {/* タイトル */}
        <section className={styles.introduction}>
          <p className={styles.eyebrow}>One Piece Bounty Rush Guide</p>
          <h1 className={styles.title}>OPBR Character Tier List</h1>
          <p className={styles.updated}>Last updated: September 18, 2026</p>
          <p className={styles.description}>
            This OPBR tier list ranks the best characters in One Piece Bounty Rush
            based on their current meta strength, league battle performance, role value,
            and overall usefulness. Stay updated with the top picks for your team.
          </p>
        </section>

        <ImportantTierUpdate update={update} currentTiers={currentTiers} />

        {/* Tier List */}
        <section className={styles.tierSection} aria-labelledby="tier-list-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionKicker}>Current rankings</p>
            <h2 id="tier-list-heading">Tier List</h2>
            <p>Characters are ranked from strongest to weakest within each tier.</p>
          </div>
          <TierList badges={badges} />
        </section>

        {/* それぞれのキャラのランキング変動 */}

        <section className={styles.criteria} aria-labelledby="criteria-heading">
          <p className={styles.sectionKicker}>How we rank</p>
          <h2 id="criteria-heading">Evaluation Criteria</h2>
          <p className={styles.criteriaText}>
            Characters are ranked based on league battle performance, meta impact,
            role value, versatility, ease of use, and matchup strength in the
            current environment.
          </p>
        </section>
      </div>
    </main>
  )
}
