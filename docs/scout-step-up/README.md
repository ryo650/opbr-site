# Scout Step-Up vertical slice

2026-10-03。開始時にremote mainをHTTPSで確認・fetchし、`3c57ca8f116fc5f8d7426d90426b9bf0d1fbad2c`から実装。調査基点の`14be87b`と別作業のcharacter-name-audit / Tier更新は取り込んでいない。

## 登録と実装境界

- `src/data/scouts/simulator-type.ts`: `normal | stepUp` union。normalは旧ScoutBannerをadapterで包む。共通summaryを一覧・detail metadata・sitemapで使用する。
- `src/data/scouts/simulator-registry.ts`: 正式公開registry。現在は既存normal 24件のみ。公開登録時はdefinition/poolのfixture sourceを拒否する。source normalデータ、character master、normal roller、normal UI本体/CSS、既存core testsは基点と同一。
- `src/lib/scout-step-up.ts`: 未知入力をvalidation→snapshot/compile→RNG注入draw→pure commit。Step全体の結果が成功した場合だけ費用・報酬・進行を更新。revision照合とsession実行中guardで同Stepの二重実行を拒否。Resetもrevisionを進め、古い操作/outcomeを拒否する。
- `src/components/scout-step-up`: 現在Step/round、cost、pullCount、資格、保証、報酬、pool別割合、全Step結果、累積会計、完走、Resetを表示。normalの操作UIは変更しない。
- `/dev/scout-step-up`: `NODE_ENV=development`だけで架空fixtureを表示。productionでは404、noindex/nofollow、公開一覧・static Scout params・sitemapには登録しない。`npm run dev -- --hostname 127.0.0.1 --port 3212`で閲覧できる。

このSliceは`rainbowDiamonds`費用（0=無料）、`unrestricted`資格、明示したcharacterWeights pool、復元抽出の`independentSlots`、固定保証slot、displayItem報酬、有限maxRoundsを実装する。percent poolは合計100を検証し、relative poolは独立weightsを正規化する。保証率は通常poolから自動生成しない。rarityは各poolの明示値で、character gradeから推測しない。

`minimumMatchRepair`（未達時置換）と`conditionalBatch`（条件付バッチ）は異なるkindとして予約し、実行を拒否する。paidDiamondsOnly、unlimited、round override、未知currency/pool/criterion/reward/追加字段も拒否する。ticket/point/pity/choice/paid currency eligibility/auto-pull/wallet/persistence-resume/OCR拡張は未実装。

RNGは呼出し側から注入できる。アプリはMath.randomを使用し、seed UI・seed状態保存はない。失敗時に会計と進行を更新しないが、外部から渡されたRNG関数自身の状態を巻き戻す機能はない。結果保持はlastOutcomeだけで、累積数は別会計。再読込でセッションは消える。

## 架空fixture

A/E=rarity4 featured、B=rarity4、C=rarity3、D=rarity2。production masterへ追加しない。画像の代わりにDemo A〜Eの文字avatarを表示し、常時開発用・非公式の注意を表示する。

| Step | RD | 排出計画 | 報酬 |
| --- | ---: | --- | --- |
| S1 | 10 | N1通常×3 | なし |
| S2 | 0 | N1通常×10 + G4固定保証×1（11枠内包） | なし |
| S3 | 30 | N3通常×4 + GF固定保証×1（5枠内包） | Demo bonus×1 |

1周完走は3Steps / 19draws / 40RD / reward1。2周ケースは同fixtureのtest変形で6Steps / 38draws / 80RD / reward2。pool sourceは[evidence/demo.json](evidence/demo.json)へ遡れる。

## 検証

検証ログは`qa-*.log`、基点同一性は[normal-preservation.json](normal-preservation.json)、画面記録は[ブラウザQA](browser-results.md)。環境はmacOS、Node v22.12.0、Next 16.3.4 Webpack。共有node_modulesはread-only利用で、install/依存更新は行っていない。build/dev成果物はこのworktree内のみ。

- `npm test`: 69/69 pass。既存core17 tests、全normal golden比較1 test、Step-Up51 tests。
- `node node_modules/typescript/bin/tsc --noEmit`: pass。
- `npm run lint`: pass。
- `npm run scouts:test`: 35/35 pass（既存通常Importerを維持）。
- `npm run build`: pass。
- `TEST_BASE_URL=http://127.0.0.1:3213 TEST_PRODUCTION=1 npm run test:http`: 9/9 pass。公開page/metadata/canonical/sitemap/normal24/fixture非公開を確認。
- CUA Chrome desktop1440、mobile viewport390/320。Step-Up無料/保証/全結果/19・40・1完走/Reset/keyboard focus、normal single→multi=12・55、Pull Until上書き/対象停止/Reset維持を確認。

normal goldenは基点と同一のdata/master/rollerで、LCG32（seed20261003、a1664525、c1013904223、mod2^32）を使用して全24件のsingle、multi11、bulk3000、target出現時停止（最大3000）とRNG消費回数を固定した。これは旧挙動の互換性証拠であり、公式確率の正しさは主張しない。normalのnon-100相対重みとnull skipを維持する。

Safari・iPhone/Android実機は未検証。Chrome viewport QAは実機検証と区別する。CI状況はPR上の実際のchecksを別途確認する。

## スクリーンショットから正式Scoutを追加するための最小資料

1. 名前/識別ID/開催期間、全Step順序、RDcost、pullCount。無料・有償石限定・回数条件をcostとは別に確認する。
2. Stepごとの通常提供割合と全候補ID、各候補weight、rarity、featured集合。Step別に同じ割合なら参照を共用できる。
3. 保証文言、対象ID集合、保証専用割合。「最後固定枠が内包」「追加枠」「未達時置換」「条件付draw」の方式とslot順。未対応方式は別の実装/検証が必要。
4. 最終Step後の遷移、初回込み最大周回、周回ごとの変更、無料Step再利用条件。round overrideはこのSliceで実行不可。
5. bonus報酬の名前/数量/付与タイミング、ticket/points/pity/choice等の連動有無。これらはdisplayItemとして実際の効果を代用しない。

軽い証拠置き場は`docs/scout-step-up/evidence/<scoutId>.json`。各sourceにmanifestの相対pathと画面文脈を持たせ、manifestには撮影日時/画面名/元画像名または保存先/hash/該当Step・pool・guarantee・repeat字段/レビュー結果/不明項目を記録する。正式データの各pool/definitionから追える形を保ち、大きなOCR/importシステムは作らない。不明な通常候補や保証率を推測で埋めない。まずvalidatorを通し、個別fixture testsで公式資料と整合をレビューしてから公開registryに登録する。
