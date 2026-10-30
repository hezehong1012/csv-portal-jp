# CSV GUIDE JP — CSV完全ガイド（日本語 SEO サイト）

日本市場向けの CSV 関連キーワードを狙った静的サイト（5 ページ構成、依存ゼロの単一 HTML ファイル）。

## ページ構成（Hub & Spoke）

| ページ | メインキーワード | 内容 |
|---|---|---|
| `index.html` | csv とは（22,200/月・KD 15） | 支柱ページ：定義・作り方・変換・文字化け・違い・公開データ・FAQ 12問 |
| `csv-create.html` | csv ファイル 作り方（1,300/月・KD 12） | 4通りの作成手順・開き方・5大失敗の直し方 |
| `excel-convert.html` | csv エクセル 変換（月間合計約2万） | 双方向の変換手順・形式の選び方・トラブル Top5 |
| `mojibake.html` | csv 文字化け（6,600/月・KD 17） | 原因特定 3 ステップ・修復 3 方法・運用ルール |
| `reading.html` | python/c#/vba csv 読み込み（約3,200/月） | 言語別コード例・encoding 早見表 |

## 機能

- 全ページ `Article` + `FAQPage` + `BreadcrumbList` JSON-LD 対応
- サイト内検索（Ctrl+K / `/`、全ページ共通インデックス）
- 出典リンク：本文中のインラインリンク + 各章末の「出典・参照」ブロック（RFC 4180・Microsoft Learn・pandas・日本郵便・内閣府など一次情報源のみ）
- 自社ツールポータル（5 ツールへの導線を各ページのヒーロー直下に配置）
- レスポンシブ・モバイル目次・閲覧進捗バー・コードコピー

## デプロイ

静的ファイルのみです。任意のホスティング（Vercel / Netlify / GitHub Pages）でルートに置くだけで動作します。

GitHub Pages の場合：

```
Settings → Pages → Branch: main / (root) → Save
```

## 更新履歴

- 2026-10-30: 初版公開（5 ページ + ツールポータル + サイト内検索）
