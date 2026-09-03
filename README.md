# 無駄遣い許可証 — 若者無駄遣い審査委員会

「老後のあなた、ちょっと金持ちすぎません？」

あなたが今、罪悪感なく無駄遣いしていい金額を勝手に審査し、証明書っぽい「無駄遣い許可証」を発行する遊びのWebサイトです。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## 構成

- `app/page.tsx` — 画面遷移（ヒーロー → 100万円の価値 → 審査フォーム → 審査中 → 結果）
- `app/layout.tsx` / `app/fonts.ts` — メタ情報と日本語フォント（Noto Sans JP / Shippori Mincho / IBM Plex Mono）
- `lib/constants.ts` — インフレ率・審査ロジックの定数・コピー・おすすめ無駄遣いの一覧（調整はここ）
- `lib/calculations.ts` — 100万円の現在価値と許可額の計算（UIから分離）
- `lib/format.ts` — 円表示・入力パース・日付・許可証番号
- `lib/permitImage.ts` — 許可証を縦長PNG（1080×1620）にCanvasで描画
- `lib/share.ts` — Web Share API / X投稿 / クリップボード / 画像保存
- `lib/storage.ts` — 入力値の localStorage 保存
- `components/` — Hero, MoneyValueSimulator, WasteForm, JudgingAnimation, PermitResult, PermitCard, Recommendations, FutureMeModal, Disclaimer, `ui/`（Button, CurrencyInput, CountUp, Stamp, StepHeader）

旧「存在しない言葉辞典」は `/jisho` に移動しています（API は `/api/search`）。

## 注意

このサイトは娯楽目的の簡易シミュレーションです。特定の金融商品の購入・投資・支出を推奨するものではありません。インフレ計算は年2％を仮定した単純計算です。
