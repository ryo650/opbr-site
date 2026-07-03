import TierList from "../../../components/tier-list/TierList"

export default function TierListPage() {
  return (
    <div>

      {/* タイトル */}
      <div>
      <p>OPBR Character Tier List</p>
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
