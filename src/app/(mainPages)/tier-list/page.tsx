import TierList from "../../../components/tier-list/TierList"

export const metadata = {
  title: "OPBR Tier List | Best Characters in One Piece Bounty Rush",
  description:
    "Check the latest OPBR tier list for One Piece Bounty Rush. Find the best characters ranked by current meta strength, league battle performance, roles, and overall usefulness. Stay updated with the top picks for your team.",
}

export default function TierListPage() {
  return (
    <main>

      {/* タイトル */}
      <section>
        <h1>OPBR Character Tier List</h1>
        <p>Last updated: July 23, 2026</p>
        <p>
          This OPBR tier list ranks the best characters in One Piece Bounty Rush
          based on their current meta strength, league battle performance, role value,
          and overall usefulness. Stay updated with the top picks for your team.  
        </p>
      </section>

      {/* アップデート、上方修正によるランキング変動(最新キャラの) */}

      {/* Tier List */}
      <section>
        <h2>Tier List</h2>
        <TierList />
      </section>

      {/* それぞれのキャラのランキング変動 */}


      <section>
        <h2>Evaluation Criteria</h2>
        <p>
          Characters are ranked based on league battle performance, meta impact,
          role value, versatility, ease of use, and matchup strength in the
          current environment.
        </p>
      </section>

    </main>
  )
}
