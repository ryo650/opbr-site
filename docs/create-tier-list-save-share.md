# Create Tier List — 保存・共有MVP

専用branch: `feat/create-tier-save-share`  
専用worktree: `/tmp/opbr-create-tier-save-share`（実パス `/private/tmp/opbr-create-tier-save-share`）  
基点: `774021265d7f307abdcfd60b1c0c816441b216ee`

編集範囲はCreate Tier List UI、専用フック、編成データのcodec、専用テストと本記録だけ。総合Tier List、news、global navigation、medal、guide、package.json/lockfile、共通設定・SEO metadataは変更していません。元checkoutはmainのまま、開始時・終了時とも差分なし。変更は専用branchへローカルcommitしています。push/PR/merge/deployは行っていません。

## 動作

- `Save in this browser` はlocalStorageの1枠に名前・各Tier内の順序・未配置キャラクターの順序を保存。再読込で復元します。検索・絞り込みは保存対象外です。
- `Restore browser save` は明示的な復元。未保存編集がある場合は `Discard edits & load list` / `Keep editing` で選択します。
- `Create share link` は編成JSONをgzip + base64urlでURL fragmentに埋め込みます。共有リンクは作成時点のコピーで、後の編集とは同期しません。編成データをサーバーへ保存しません。
- 共有URLを開くと閲覧状態になります。`Copy & edit my own list` から編集でき、明示的な保存まで既存ブラウザ保存を変更しません。
- `Download file` / `Import file` はJSONの持ち出しと復元。importも既存の未保存編集を確認し、保存するまでブラウザ保存を変更しません。
- clipboard拒否では手動コピー欄を残し、storage拒否・quota不足では現在の編集を維持し、ファイル保存を案内します。別タブのstorage変更で現在の編成を自動上書きしません。
- hashchange/popstateを処理し、URLの非同期読み込みでは最新の要求を優先。未保存編集を確認し、共有URLの展開中に編集しても読込元URLを消しません。
- 編集中のbeforeunload警告を追加。実際の警告表示はブラウザの通常の制限に従います。

共有URLは基点の360キャラクターを含む初期編成で5,275文字、desktopで2体を配置したQA編成で5,310文字。全キャラクターを逆順でTierに配置し120文字の日本語タイトルにしたケースも8,000文字以内でした。8,000文字を超えるURLでは生成を停止しファイル共有を案内します。

## 入力検証と互換性

version 1、120文字以内の名前、7つのTier、配列構造、カタログに存在する文字列ID、Tier/未配置をまたぐ重複を検証します。配列長は現カタログ件数を上限とし、JSONはUTF-8で256,000 bytesまで。gzip展開も読みながら同じ上限を適用し、圧縮爆弾を防ぎます。未知IDや削除されたIDを含む編成は全体を拒否し、保存済みデータを勝手に削除・変更しません。後から追加されたキャラクターは未配置末尾へ追加します。キャラクターの数値indexは共有形式に使用しません。

CompressionStream/DecompressionStreamがないブラウザにはファイル利用または新しいブラウザを案内します。長いURLを制限するSNS等ではファイル共有を使えます。画像書き出しは今回の範囲外です。

このMVPにDB/Auth/外部サービス・環境変数追加は不要です。アカウント単位での複数端末同期、公開ギャラリー、管理可能な短い公開URL等を追加する場合は永続ストレージと必要に応じた認証・サーバー側の設計が必要になります。

## 検証

最終ソースでPass:

- `npx tsc --noEmit`
- `npm run lint`
- `node --require ./tests/register.cjs --test tests/core.test.cjs tests/create-tier-list.test.cjs` — 既存11 + 新規8 = 19件
- `git diff --check`
- `tests/create-tier-list.hook-browser.cjs` — 最終フックをメモリー内で読み込む実Chromiumテスト。共有URL展開を300ms遅延させ、その間に編集し、URL保持・確認・共有閲覧への切替・既存保存保持を確認。

最終本番buildでPass:

- `npm run build` — 70ページを生成
- `TEST_BASE_URL=http://127.0.0.1:3202 npm run test:http` — 4件、canonical/既存ページ/404/sitemap等
- `tests/create-tier-list.browser.cjs` — 実Chromium desktop 1440x1100 / mobile 390x844。ドラッグ順序、保存と再読込、共有リンク、clipboard成功/拒否、download、未保存編集の確認、共有編成の閲覧とコピー編集、hash/back/forward、壊れたURL/ファイル、import、quota/storage拒否、モバイルtap配置/touchドラッグ/検索/横溢れなし、pageerrorなし。
- 同じブラウザテストで既存footer Aboutリンク→戻ると保存復元を確認。

Fail（環境起因、コード修正を伴わず再実行で解消）:

- 初回buildはGoogle FontsのDNS/ネットワーク制約で失敗。
- ネットワーク許可後の最初のbuildはENOSPCで失敗。自分のworktreeで生成したwebpack cacheだけを削除し、再実行でbuild Pass。他タスクやユーザーファイルは削除していません。

未実施・制約:

- Safari/実機iOSでの検証は未実施。Chromium mobileエミュレーションでtouchドラッグも確認しました。既存のtouch handlerは読み取り状態のガード以外変更していません。
- Mac空き容量が約250MiBに低下したため一度重い作業を停止。その後read-only確認で15GiBまで回復したことを確認し、最終本番build/HTTP/ブラウザ検証を実行してPass。自分以外のデータ削除は行っていません。

## 再検証・プレビュー

依存は元checkoutのnode_modulesへのsymlinkを使っています。npm ciや依存追加は行っていません。プレビューを再起動するとき:

```sh
cd /tmp/opbr-create-tier-save-share
npx tsc --noEmit
npm run lint
node --require ./tests/register.cjs --test tests/core.test.cjs tests/create-tier-list.test.cjs
npm run build
npm run start -- --hostname 127.0.0.1 --port 3202
```

`http://127.0.0.1:3202/create-tier-list` を開きます。Google Fonts取得にはネットワークが必要です。

別ターミナルから:

```sh
TEST_BASE_URL=http://127.0.0.1:3202 npm run test:http
PLAYWRIGHT_MODULE=/Users/sasakiryou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright TEST_BASE_URL=http://127.0.0.1:3202 node --require ./tests/register.cjs tests/create-tier-list.browser.cjs
PLAYWRIGHT_MODULE=/Users/sasakiryou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/create-tier-list.hook-browser.cjs
```

ブラウザテストはテスト用の新規ブラウザcontextを使用し、通常のユーザーブラウザの保存を触りません。hookテストはHTMLをローカルURLでinterceptするためサーバー起動・Next再ビルド不要です。

スクリーンショット: [desktop](create-tier-list-qa/desktop.png)、[mobile共有閲覧](create-tier-list-qa/mobile-shared.png)、[mobile編集](create-tier-list-qa/mobile-edit.png)。最終本番buildで撮影・目視確認しました。
