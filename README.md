# OPBR Guide

ONE PIECE Bounty Rush の非公式ファンサイト。英語のTier表、キャラクターガイド、使用率分析、ガチャシミュレーター、Tier表作成機能を提供します。

## 開発

Node.js 24 LTSを推奨します。Next.js自体はより古いNodeでも動作しますが、更新後の開発ツールにはNode 22.13以降を要求する依存関係があります。

```sh
npm ci
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。開発・ビルドは既存のWebpack設定を使用します。

```sh
npm run lint
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

起動したサーバーに対する回帰テストは別ターミナルで実行します。

```sh
npm run test:http
# 別ポートの場合
TEST_BASE_URL=http://127.0.0.1:3000 npm run test:http
```

ビルドは `next/font/google` によるInterフォント取得のため外部ネットワークを必要とします。追加の環境変数やデータベースは不要です。本番URLは `src/lib/site.ts` に定義しています。

## 構成

- `src/app/(mainPages)`：App Routerのページと共通レイアウト。括弧付きフォルダー名はURLに含まれません。
- `src/components`：ヘッダー、フッター、Tier表、キャラクター枠、Tier作成UI、RadixベースのUI部品。
- `src/data/characters`：属性別キャラクター辞書。辞書キーと `id` は一致させます。
- `src/data/scouts`：12件のガチャ定義。日時にはタイムゾーン、ピックアップには既存キャラクターIDを指定します。
- `src/data/character-guides`：ガイド本文、スキル、相性、動画パス。
- `src/data/character-usage`：日付別の手動集計。`processing.ts` がサーバーでランキングを計算し、`helpers.ts` はブラウザでも使う軽量な計算です。
- `src/lib/scout.ts`：抽選ロジック。`createScoutRoller` はカテゴリ別候補を一度だけ準備します。
- `public`：画像・動画。Next Imageで画像を最適化します。
- `tests`：Node組込みテストランナー。既存TypeScriptコンパイラーでアプリのロジックを読み込みます。

## 表示・データの更新

大部分のページはビルド時に生成されます。ガチャ一覧だけはリクエスト時に現在時刻を参照し、開催前・開催中・終了を判定します。ブラウザで開きっぱなしの画面は自動更新しません。新規ガチャやガイドの追加後は再ビルドが必要です。

キャラクター、ピックアップ、Tier配置、ガイドの相性、画像・動画パスを編集したら `npm test` を実行してください。`npm run test:http` は公開ページのHTTP応答、見出し、canonical、未完成ページのnoindex、404、sitemapを検査します。

ガチャの排出率合計が100%ではない既存データは、所有者の指示により維持しています。抽選は設定値を相対的な重みとして正規化します。入力された個別確率と実際のゲーム確率が一致するとは限りません。正しいゲーム内データを確認してから修正してください。テストは不完全な入力を含む従来動作の互換性を検証しており、公式確率の正しさを保証しません。

Tier表作成の内容はReactのメモリー内にあり、再読み込みで消えます。保存・画像出力・共有は未実装です。`Pull Until Featured` は従来どおりセッション統計をその実行結果で置き換えます。

未完成の4ページは `noindex, follow` にしています。公開できる本文を追加するときにnoindexを外し、canonicalとsitemapを追加してください。

## 監査

[2026-09-07の調査・修正・検証記録](docs/project-audit-2026-09-07.md) を参照してください。
