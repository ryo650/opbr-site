# Character Stats Importer v0.1 — ローカル確認・承認付き保存

管理者がゲーム内の最大ステータス画像をまとめて読み込み、領域OCR → 既存Character ID照合 → 個別修正・確認 → 承認後保存を行えるローカルツールを追加します。既存メダルImporterとunboosted Base Stats catalogは変更しません。

- 表示値とLv100/100・Boost52/52・メダル未装備の条件を別catalogへ保存。部分入力、空欄による既存値の消去防止、差分・上書き同意、更新検知、ロック、atomic saveと変更履歴に対応。
- キャラ名＋バージョン名の完全一致だけを自動照合。曖昧なOCRは候補表示で止まり、人がIDと値を確認します。
- 元画像をGitHubに含めません。既存の未pushコミットを再構成し、5枚のPNGと元画像サムネイル入りQA画像を履歴から除外。正解JSON・実測OCR文字データ・検証レポートのみ保持します。
- 通常テストは画像不要。HTTP入力には合成1×1 PNG、実データには保存済みOCR文字データを使用。再OCRは --input-dir でローカル画像を指定した時だけ行います。
- 公開サイトのルート・API・リンクは追加せず、127.0.0.1だけで待受。アカウント認証は追加していません。
- GitHub Actionsで画像なしのImporterテスト、既存回帰テスト、型・lint・catalog検証を実行します。

## 検証

5枚の実測OCRでHP/ATK/DEF/CRIT/総合力の25/25項目とLv/Boost/最大画面条件が一致。ID自動照合は2/5、Wapol/Lucci/Garpは候補からの手動選択が必要です（v0.1で許容）。ID修正・個別承認後の一時catalog保存結果は5/5一致。厳密OCR比較は52/55でexit 1となる点を隠していません。

元画像削除後の新Importer15件、既存メダル94件、既存基礎ステータス20件、core18件の147件が通過。型・full lint・catalog検証・差分チェックも通過しています。

## 残る確認

このMacでは既存Vision helperも失敗したため、実測には新Importer専用Tesseract.js fallbackを使用。Visionが動く環境での確認、他画面レイアウト、サポート効果・計算基準の検証は今後の課題です。未保存draftはサーバー再起動で破棄されます。

詳細と全変更ファイルは scripts/character-stats-importer/README.md、QA.md、CHANGED-FILES.md を参照してください。Draft PRとして提出し、merge・本番deployは行いません。
