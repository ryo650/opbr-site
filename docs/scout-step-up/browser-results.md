# Browser QA — 2026-10-03

Supported `mcp__cua_repl` Chrome APIで操作。自身dev3212/production3213のみを使用し、既存Tier preview3210には接続・停止・操作していない。Chromeタブを閉じてviewport overrideをreset済み。

| 対象 | 確認結果 | 証拠 |
| --- | --- | --- |
| Step-Up 1440×1000 | S1→S2で3draw/10RD、S2無料で14draw/10RD・最後11枠目がG4保証。全11結果表示 | [desktop-step3.jpg](desktop-step3.jpg) |
| Step-Up完走1440 | キーボードEnterでS3実行。19draw/40RD/reward1、completed、実行button disabled、Resetにfocus。結果5枠目がGF保証 | [desktop-completed.jpg](desktop-completed.jpg) |
| Step-Up390×844 | 完走表示/全結果/報酬、scrollWidth=clientWidth=390。完走後ResetとS1実行後ResetでStep1/round1/全会計0に復帰 | [mobile-completed.jpg](mobile-completed.jpg) |
| Step-Up320×844 | 無料Stepの保証率tableを開きB72.73/A18.18/E9.09%を確認、scrollWidth=clientWidth=320 | [mobile-320-free-rates.jpg](mobile-320-free-rates.jpg) |
| production normal1440 | single→multiで12draw/55RD、直近11件。旧操作を維持 | [normal-desktop-12-pulls.jpg](normal-desktop-12-pulls.jpg) |
| production normal390 | Pull Until Selected Pickupで56draw/280RD・Happy-Halloween-Uta取得時停止。前の12draw/55RDを上書き。Resetで0/0、選択target保持 | [normal-mobile-until.jpg](normal-mobile-until.jpg) |
| production一覧390 | Scout詳細link24件。Fictional文字なし。scrollWidth=clientWidth=390。productionタブconsole error/warnなし | CUA DOM observation |

fullPage撮影時、320px/normal画像には既存共通sticky headerとSkip linkが撮影時scroll位置に写っている。共通headerとnormal UI/CSSは今回変更していない。Safari/iPhone/Android実機、ゲームサーバーの仕様照合は未実施。連打・再投入・再入・失敗時会計はpure/session testsで検証しており、browserの二重click実機テストと同義ではない。
