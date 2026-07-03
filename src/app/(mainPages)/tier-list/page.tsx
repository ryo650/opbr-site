import TierList from "../../../components/tier-list/TierList"

export const metadata = {
  title: "OPBR Tier List | Best Characters in One Piece Bounty Rush",
  description:
    "Check the latest OPBR tier list for One Piece Bounty Rush. Find the best characters ranked by current meta strength, league battle performance, roles, and overall usefulness. Stay updated with the top picks for your team.",
}

export default function TierListPage() {
  return (
    <div>

      {/* タイトル */}
      <div>
      <h1>OPBR Character Tier List</h1>
      <p>7/3 10:00 updated</p>
      </div>

      {/* アップデート、上方修正によるランキング変動(最新キャラの) */}
      <div></div>

      {/* Tier List */}
      <div>
        <TierList />
      </div>

      {/* それぞれのキャラのランキング変動 */}
      <div></div>

    </div>
  )
}
