# Scout Importer V1

Scout Simulator向けの通常ScoutデータとWebP bannerを、ゲーム内スクリーンショットから生成するmacOS用CLIです。Step Upは再現せず、既存Simulatorと同じ `1 pull / 5 diamonds`、`11 pulls / 50 diamonds` を生成します。

## Medal Importerから再利用した設計

- 元スクリーンショットは変更せず、専用のignored `input/` だけを読む
- Apple Visionのaccurate OCRとbounding box、ImageMagickを使用する
- 画像をdecoded-pixel signatureで検査し、位置がずれる重複入力を停止する
- 曖昧な文字列をfuzzy matchで確定せず、reviewとして停止する
- productionの既存ID・TypeScript・WebPを上書きしない
- 生成前に全validationを行い、一時ディレクトリで画像とTypeScriptをstageする
- index更新を最後に行い、途中失敗時は新規data/WebPをrollbackする

Medal Importerの画面座標やMedal固有のgroupingは再利用せず、Scoutの自然順入力と既存character masterに合わせたparserに分離しています。Scoutのdry-runは要件どおりファイルを一切書きません。

## Requirements

- macOS（OCRはApple Vision + Swift）
- ImageMagick 7 (`magick`)
- Node.js 20 or newer

## inputの置き方

`scripts/scout-importer/input/` に1 Scout分だけを置きます。PNG/JPG/WebPに対応し、ファイル名に役割を持たせません。`IMG_4100.PNG`、`IMG_4101.PNG`のようなゲームcaptureをリネームせず、そのまま自然順で読みます。

```text
scripts/scout-importer/input/
  IMG_4100.PNG  # 1枚目
  IMG_4101.PNG  # 2枚目
  IMG_4102.PNG  # 3枚目
  IMG_4103.PNG  # 4枚目
  IMG_4104.PNG  # 5枚目（必要な場合）
```

1. サイトでそのまま使用する完成済みScout TOP/banner画像。cropや加工はせず、元寸法のままWebP化する。OCRには使用しない
2. Scout終了日時の `to ...` が見えるスクリーンショット。endAt OCR専用でbannerには使わない
3. ScoutタイトルとDrop Rates上部。Scoutタイトルおよび★4/★3/★2の3つが同時に見えるスクリーンショット
4. 以降はCharacter Drop Rates。`Featured Characters` 見出しと全pickup、および通常（非Featured）のBFを最低1体含める

入力は最低4枚必要です。順序が役割を決定し、特定のファイル名やprefixには依存しません。Character画面は中央のDrop Ratesモーダルだけをbounding boxで抽出し、各rateのY座標からrowを復元します。`Featured Characters` は同じrow内の表示有無で判定します。同じ通常BFが複数見える場合はrateをクロスチェックします。

2枚目に `to ...` がない、3枚目に★4/★3/★2が揃わない、4枚目以降が合計rate画面や期間画面に見える、などOCR内容と位置が明らかに矛盾するときは生成せずreview/errorにします。同一画像も自動除外すると位置がずれるためエラーになります。

## 実行方法

`featuredCharacterId` はゲーム内のFeatured Charactersとは別概念です。毎回character masterの既存IDを指定します。Scout NameもOCRせず、実行時に入力します。TTYでは引数を省略するとそれぞれpromptが出ます。

```sh
npm run scouts:import -- --dry-run
```

非対話実行、または明示する場合:

```sh
npm run scouts:import -- --dry-run \
  --featured-character-id unexpected-collaboration-kaku \
  --name "7.5 Anniv. Bounty Festival"
```

validation通過後の実生成:

```sh
npm run scouts:import -- \
  --featured-character-id unexpected-collaboration-kaku \
  --name "7.5 Anniv. Bounty Festival"
```

開始日時override:

```sh
npm run scouts:import -- --dry-run \
  --featured-character-id unexpected-collaboration-kaku \
  --name "7.5 Anniv. Bounty Festival" \
  --start-at "2026-08-28 14:00"
```

Scout Nameは `--name` でも指定できます。character OCRを目視確認したうえでの明示的な補正も可能です。

```sh
npm run scouts:import -- --dry-run \
  --featured-character-id unexpected-collaboration-kaku \
  --name "7.5 Anniv. Bounty Festival" \
  --character-map "Unexpected Collaboration Kaku=unexpected-collaboration-kaku"
```

その他の補正:

- `--end-at "2026-09-15 13:59"`
- `--id some-stable-scout-id`
- `--bf-count 147`

Scout IDは3枚目の `Show Drop Rates` モーダル見出しを基準に、bounding boxで特定した直下のタイトル領域だけから生成します。先頭の `3-Step` / `4-Step` など、末尾の `Step 1` など、括弧や不要な記号を除いてcanonical titleを作り、lowercase kebab-caseへ変換します。領域を一意かつ安全に特定できない場合や既存IDと重複した場合は、巨大なslugやsuffixを生成せず停止します。タイトルを正しく取得できない場合だけ、目視確認後に `--id` でoverrideします。

1枚目のbanner画像にはcrop、resize、位置調整を行いません。メタデータを除去して品質90のWebPへ変換し、入力画像と同じpixel寸法で `public/scouts/<id>.webp` に出力します。生成する `ScoutBanner.bannerImg` も `/scouts/<id>.webp` です。既存の `public/scouts/ex/`・`public/scouts/bf/` 配下の画像と既存Scoutデータは移行しません。

Scout SimulatorのCurrent/Past分類は従来どおりendAtで行い、それぞれの一覧をstartAt降順で表示します。表示順は `src/data/scouts/index.ts` の登録位置には依存しません。

## Validationと計算

pickupはFeatured Characters全員です。通常BF総数は現在の `src/data/characters/{color}.ts` をTypeScript ASTで直接読み、pickupに含まれるBFを除外します。小数は固定小数点（BigInt）で保持し、次を丸めずに計算します。

```text
bfCount = all BF - pickup BF
bfTotal = bfCount * normal BF unit rate
star-4 = ★4 total - pickup total - bfTotal
```

通常ケースでは最新character masterのBF poolからbfCountを自動計算します。過去Scoutや特殊poolだけは `--bf-count <number>` で正の整数を明示し、その値をbfCountとして使用できます。dry-runには由来を `(character master)` または `(override)` と表示します。通常は自動、例外だけoverrideする方針です。

この高精度計算結果はvalidation用に維持します。生成する最終ratesでは、pickup rateはOCRの値を丸めず保持し、BF合計だけを小数第2位へ丸めます。star-4は丸め後のBFを使った残差を小数第2位へ丸めます。star-3とstar-2はOCRの取得値をそのまま使用します。

```text
final bf = round(bfTotal, 2)
final star-4 = round(★4 total - pickup total - final bf, 2)
```

★4/★3/★2、pickup、characterId、通常BF rate、非負のraw BF/star-4、高精度rate合計、最終出力rate合計が正確に100%、入力されたScout名、3枚目から生成したScout ID、endAt、featuredCharacterId、出力競合を生成前に検証します。候補表示は診断のみで、自動選択には使いません。

## V1の制限

- Step Up、確定枠、free step、loop countは無視する
- ゲーム開始前で終了日・Drop Rates・pickupが未確定のScoutは対象外
- 最新BFまで通常排出される前提。例外Scoutや期間別character poolは未対応
- 全排出characterは解析しない。Featured全員と通常BF最低1体だけを使う
- OCRは英語UI向け。曖昧なcharacter名はreviewで停止する
- 1枚目は完成済みbannerであることが前提。Importer内でOCR、crop、レイアウト調整はしない
- 既存Scoutの修正・上書きは行わず、新規追加だけを扱う
