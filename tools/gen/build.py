# -*- coding: utf-8 -*-
"""Generator for csv.format-portal.com — tool pages, home hub, sitemap.

Run:  python tools/gen/build.py
"""
import os, json, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://csv.format-portal.com"
LASTMOD = "2026-11-02"


def esc(s):
    return html.escape(s, quote=True)


# ------------------------------------------------------------------ taxonomy
FAM = {
    "edit":  ("編集・行と列", "Edit & columns", "編集・列の整理・並べ替え"),
    "combo": ("分割・結合・比較", "Split, merge & compare", "複数ファイルの出し入れ"),
    "conv":  ("形式変換", "Convert", "文字コード・区切り・JSON・PDF"),
    "clean": ("クレンジング", "Cleanse", "表記ゆれ・形式統一"),
    "gen":   ("抽出・生成", "Extract & generate", "正規表現・SQL"),
}

# 5 族。編集（エディタ）は両言語とも先頭。
FAM_ORDER = {
    "ja": ["edit", "combo", "conv", "clean", "gen"],
    "en": ["edit", "conv", "combo", "gen", "clean"],
}

TOOLS = [
    dict(slug="editor", fam="edit", live=True, external="https://csv-editor.format-portal.com/",
         ja="オンラインエディタ", en="Online editor",
         dja="その場で編集・保存", den="Edit and save in place"),
    dict(slug="row-clean", path="csv-row-clean", fam="edit", live=True,
         ja="空白行の整理", en="Clean blank rows",
         dja="空白行・空列の削除", den="Blank rows and columns"),
    dict(slug="clean", path="csv-clean", fam="clean", live=True,
         ja="クレンジング", en="Cleanse values",
         dja="空白・記号・空セル", den="Spaces, symbols, blanks"),
    dict(slug="normalize", path="csv-normalize", fam="clean", live=True,
         ja="形式統一", en="Normalize formats",
         dja="全角半角・日付・電話", den="Width, dates, phones"),
    dict(slug="column", path="csv-column", fam="edit", live=True,
         ja="列の抽出・削除", en="Pick or drop columns",
         dja="必要な列だけ残す", den="Keep only what you need"),
    dict(slug="split", path="csv-split", fam="combo", live=True,
         ja="大容量分割", en="Split large files",
         dja="行数・ファイル数で分割", den="Split by rows or count"),
    dict(slug="merge", path="csv-merge", fam="combo", live=True,
         ja="CSV 結合", en="Merge CSV files",
         dja="複数ファイルを縦に連結", den="Stack files into one"),
    dict(slug="shift-jis", path="csv-shift-jis", fam="conv", live=True,
         ja="文字コード変換", en="Encoding converter",
         dja="Shift_JIS → UTF-8", den="Shift_JIS to UTF-8"),
    dict(slug="newline", path="csv-newline", fam="conv", live=True,
         ja="改行コード変換", en="Line endings",
         dja="CRLF ⇄ LF", den="CRLF to LF"),
    dict(slug="delimiter", path="csv-delimiter", fam="conv", live=True,
         ja="区切り文字変換", en="Delimiter converter",
         dja="カンマ ⇄ タブ ⇄ ;", den="Comma, tab, semicolon"),
    dict(slug="json", fam="conv", live=True, href="/json.html",
         ja="CSV ⇄ JSON", en="CSV ⇄ JSON",
         dja="相互変換・JSON Lines", den="Convert both ways"),
    dict(slug="pdf", fam="conv", live=True, href="/pdf.html",
         ja="CSV → PDF", en="CSV → PDF",
         dja="表をそのまま印刷", den="Print the table as-is"),
    dict(slug="sql", path="csv-sql", fam="gen", live=True,
         ja="SQL INSERT 生成", en="SQL INSERT",
         dja="INSERT + CREATE TABLE", den="INSERT + CREATE TABLE"),
    dict(slug="sort", path="csv-sort", fam="edit", live=True,
         ja="複数列ソート", en="Sort by multiple columns",
         dja="数値・日付も正しく", den="Numbers and dates too"),
    dict(slug="dedup", path="csv-dedup", fam="combo", live=True,
         ja="重複行削除", en="Remove duplicates",
         dja="重複の抽出も", den="Drop or extract duplicates"),
    dict(slug="diff", path="csv-diff", fam="combo", live=True,
         ja="差分比較", en="Compare two files",
         dja="2ファイルの違いを抽出", den="Added / removed / changed"),
    dict(slug="extract", path="csv-extract", fam="gen", live=True,
         ja="正規表現で抽出", en="Regex extract",
         dja="メール・URL・電話番号", den="Email, URL, phone"),
]

PATH = {t["slug"]: t.get("path", t["slug"]) for t in TOOLS}


def tool_href(t, lang):
    if t.get("external"):
        return t["external"] if lang == "ja" else t["external"].rstrip("/") + "/en/"
    if t.get("href"):
        return t["href"] if lang == "ja" else "/en" + t["href"]
    return ("/%s.html" % PATH[t["slug"]]) if lang == "ja" else ("/en/%s.html" % PATH[t["slug"]])


# ------------------------------------------------------------------ page copy
def _p(slug, script, fam, title, desc, h1, lead, badge, steps, limits, faq, related, multi=False):
    d = dict(slug=slug, script=script, fam=fam, title=title, desc=desc, h1=h1, lead=lead,
             badge=badge, steps=steps, limits=limits, faq=faq, related=related)
    if multi:
        d["multi"] = True
    return d


PAGES = [
 _p("dedup", "dedup.js", "verify",
  ("CSV 重複行削除ツール｜重複の抽出もブラウザだけで【無料・登録不要】",
   "Remove duplicate rows from CSV — free, in your browser"),
  ("重複した行を一括で削除。比較する列を選べるので、同じ会社の複数担当者を残したまま重複だけ消せます。削除した行の書き出し、大文字小文字や前後空白の無視、空白行の除去にも対応。データは送信されません。",
   "Delete duplicate rows from a CSV in one pass. Pick which columns to compare, ignore case or surrounding spaces, drop blank rows, and export the removed rows separately. Nothing is uploaded."),
  ("CSV 重複行削除ツール", "Remove duplicate rows from CSV"),
  ("重複した行を一括で削除します。比較する列を選べるので、「同じ会社の複数担当者」を残したまま重複だけ消す、といった使い方もできます。処理はすべてブラウザ内で完結します。",
   "Remove duplicate rows in one click. Choose which columns define a duplicate, so you can keep several contacts at the same company while dropping true repeats. Everything runs in your browser."),
  ("重複の抽出も可能", "Extract duplicates too"),
  (["CSV をドロップ、または表を貼り付けます。",
    "比較する列にチェックを入れます（未選択なら全列で判定）。",
    "「実行する」を押し、結果を確認して CSV を保存します。"],
   ["Drop a CSV file or paste the table.",
    "Tick the columns that define a duplicate (all columns when none is ticked).",
    "Press Run, check the result, then download the CSV."]),
  ("あいまいな類似判定はしません（「株式会社A」と「A株式会社」は別物として扱います）。表記ゆれを吸収したい場合は、先にクレンジングで統一してください。",
   "Matching is exact — “Acme Inc.” and “Acme, Inc.” count as different. Normalize the values first if you need fuzzy matches."),
  ([("重複の判定は完全一致ですか？",
     "はい。選択した列の値を完全一致で比較します。「前後の空白を無視」「大文字小文字を区別しない」をオンにすると、その範囲で正規化してから比較します。"),
    ("削除した行だけを別ファイルにできますか？",
     "できます。実行後に表示される「削除した行をダウンロード」から、重複として除外された行だけを CSV で保存できます。"),
    ("どの行が残りますか？",
     "既定では最初に出現した行を残します。オプションで「最後の1行を残す」に切り替えると、後から出てきた行が採用されます。"),
    ("何行まで処理できますか？",
     "ブラウザのメモリの範囲内で動作します。数十万行までは通常の PC で扱えますが、プレビューは先頭 60 行のみ表示します。"),
    ("データは送信されますか？",
     "いいえ。読み込み・比較・書き出しのすべてがブラウザ内で行われ、サーバーには一切送信されません。")],
   [("Is the comparison exact?",
     "Yes — values in the selected columns must match exactly. Turn on “ignore surrounding spaces” or “ignore case” to normalize before comparing."),
    ("Can I export only the removed rows?",
     "Yes. After running, use “Download removed rows” to save just the duplicates that were dropped."),
    ("Which row is kept?",
     "The first occurrence by default. Switch to “keep the last row” to keep the later duplicate instead."),
    ("How large a file can it handle?",
     "It runs within browser memory — hundreds of thousands of rows on a normal PC. The preview shows the first 60 rows only."),
    ("Is my data uploaded?",
     "No. Reading, comparing and exporting all happen in your browser; nothing is sent to a server.")]),
  ["diff", "merge", "json"]),

 _p("split", "split.js", "combo",
  ("CSV 分割ツール｜大きいファイルを行数で分割【無料・ブラウザ完結】",
   "Split a large CSV by row count — free, in your browser"),
  ("大きすぎて開けない CSV を行数またはファイル数で分割。各ファイルにヘッダー行を残せるので、分割後もそのまま Excel やシステムに取り込めます。アップロード不要、ブラウザ内で完結します。",
   "Split an oversized CSV by row count or into a fixed number of files. Keep the header in every part so each file still imports cleanly. No upload, no sign-up."),
  ("CSV 分割ツール", "Split a CSV file"),
  ("メール添付やシステム取り込みの上限に収まらない CSV を、行数またはファイル数で分割します。各ファイルにヘッダー行を残せます。",
   "Cut a CSV that exceeds an upload or email limit into parts — by row count, or into a fixed number of files — keeping the header row in each part."),
  ("ヘッダー行を各ファイルに", "Header kept in every part"),
  (["分割したい CSV を選択します。",
    "「行数で分割」か「ファイル数で分割」を選び、数値を指定します。",
    "生成された各ファイルを個別にダウンロードします。"],
   ["Choose the CSV you want to split.",
    "Pick “by row count” or “by number of files” and enter the value.",
    "Download each generated part."]),
  ("分割は行単位です。1 行が巨大な場合でも途中で切ることはありません。圧縮（ZIP）は行わないため、分割後のファイルは個別にダウンロードします。",
   "Splitting is row-based and never cuts a row in half. Files are not zipped — each part downloads separately."),
  ([("何行ずつに分けられますか？",
     "任意の行数を指定できます。たとえば 10 万行の CSV を 3 万行ずつにすると 4 ファイルになります。"),
    ("ヘッダー行は各ファイルに残りますか？",
     "既定でオンです。オフにすると 2 つ目以降のファイルはデータ行のみになります。"),
    ("文字コードは変わりますか？",
     "読み込んだ文字コードを判定し、出力は UTF-8 で書き出します。最新の Excel は UTF-8 の CSV も正しく開けます。"),
    ("データは送信されますか？",
     "いいえ。分割はすべてブラウザ内で実行されます。")],
   [("Can I choose the number of rows per file?",
     "Yes. A 100,000-row CSV split into 30,000-row parts produces four files."),
    ("Does each part keep the header?",
     "Yes, on by default. Turn it off and parts after the first contain data rows only."),
    ("Does the encoding change?",
     "The input encoding is detected and the output is written as UTF-8, which current Excel versions read correctly."),
    ("Is my data uploaded?",
     "No. The split runs entirely in your browser.")]),
  ["merge", "dedup", "json"]),

 _p("merge", "merge.js", "combo",
  ("CSV 結合ツール｜複数ファイルを縦にまとめる【無料・登録不要】",
   "Merge multiple CSV files into one — free, no sign-up"),
  ("複数の CSV を 1 つに縦結合。列名で揃えるので、列の順番や過不足が違うファイルでも崩れません。元ファイル名を列として残すこともでき、結合後の出所が追えます。",
   "Stack multiple CSV files into one. Columns are matched by name, so different column orders or missing columns are handled. Optionally keep the source file name as a column."),
  ("CSV 結合ツール", "Merge CSV files"),
  ("月次ファイルや部署ごとの CSV を 1 つにまとめます。列名で揃えるため、列の順番が違うファイルでもデータがずれません。",
   "Combine monthly exports or per-team CSVs into one file. Matching by column name means files with different column orders still line up."),
  ("列名で自動的に揃える", "Aligned by column name"),
  (["結合したい CSV を 2 つ以上選択します。",
    "「列名で揃える」か「位置で揃える」を選びます。",
    "結果を確認して、結合後の CSV をダウンロードします。"],
   ["Select two or more CSV files.",
    "Choose “align by column name” or “align by position”.",
    "Check the preview and download the merged file."]),
  ("縦方向の結合のみです。キー列で横に結合（JOIN）する用途には対応していません。ヘッダー行がないファイルは、1 行目をヘッダーとして扱います。",
   "Vertical stacking only — this is not a key-based JOIN. Files without a header row treat their first row as the header."),
  ([("列の順番が違うファイルでも結合できますか？",
     "できます。「列名で揃える」を選ぶと、列名をキーに突き合わせます。片方にしかない列は空欄になります。"),
    ("何ファイルまで結合できますか？",
     "一度に 30 ファイルまで選択できます。それ以上は、いくつかに分けて結合してください。"),
    ("元のファイル名を残せますか？",
     "「元ファイル名を列として追加」をオンにすると、各行の先頭にファイル名が入ります。どのファイル由来か追跡したいときに便利です。"),
    ("データは送信されますか？",
     "いいえ。すべてブラウザ内で処理されます。")],
   [("Can I merge files with different column orders?",
     "Yes. “Align by column name” matches on header names; columns present in only one file become blank."),
    ("How many files at once?",
     "Up to 30 per run. Merge in batches if you have more."),
    ("Can I keep the source file name?",
     "Turn on “add the source file name as a column” to prefix each row with its file name — useful for tracing where rows came from."),
    ("Is my data uploaded?",
     "No. Everything is processed in your browser.")]),
  ["split", "diff", "dedup"], multi=True),

 _p("diff", "diff.js", "verify",
  ("CSV 差分比較ツール｜2つのファイルの違いを抽出【無料・登録不要】",
   "Compare two CSV files and list the differences — free"),
  ("2 つの CSV をキー列で突き合わせ、追加・削除・変更された行を一覧にします。変更はセル単位で「変更前 → 変更後」を表示。差分は CSV で書き出せるので、レビューや報告にそのまま使えます。",
   "Match two CSVs on a key column and list added, removed and changed rows. Changes are shown cell by cell (before → after) and the diff exports as CSV."),
  ("CSV 差分比較ツール", "Compare two CSV files"),
  ("変更前と変更後の CSV をキー列で突き合わせ、追加・削除・変更を抽出します。セル単位の差分まで分かるので、レビューや月次報告の確認に使えます。",
   "Match a before/after pair on a key column and see what was added, removed or changed — down to the individual cell."),
  ("セル単位の差分", "Cell-level diff"),
  (["1 つ目に変更前、2 つ目に変更後の CSV を選択します。",
    "突き合わせるキー列を選びます（顧客ID、メールなど）。",
    "追加・削除・変更を確認し、必要なら差分を CSV で保存します。"],
   ["Pick the “before” CSV first, then the “after” file.",
    "Choose the key column to match rows on (customer ID, email, …).",
    "Review added / removed / changed, then export the diff as CSV."]),
  ("キー列の値が重複している場合、最初の 1 行だけを比較対象にします。行の並び順の違いは差分として扱いません。",
   "When a key appears more than once, only the first row is compared. Row order alone is not reported as a difference."),
  ([("キー列は必須ですか？",
     "はい。行を同定するためにキー列が必要です。ID がない場合は、メールアドレスや氏名＋会社名などをキーにしてください。"),
    ("列が増減していても比較できますか？",
     "できます。列名の和集合で比較するため、片方にしかない列も差分として判定されます。"),
    ("並び順が違うだけの場合は？",
     "差分として扱いません。キーで突き合わせるため、行の順番が違っても同一行と判定されます。"),
    ("結果はどう保存できますか？",
     "「差分を CSV でダウンロード」から、type（added / removed / changed）、キー、列名、変更前、変更後の 5 列で出力できます。")],
   [("Is the key column required?",
     "Yes — rows need a key to be matched. If there is no ID, use email, or name plus company."),
    ("What if the column sets differ?",
     "The comparison uses the union of column names, so a column present in only one file still shows up as a difference."),
    ("What about a different row order?",
     "It is not treated as a difference — rows are matched on the key."),
    ("How do I save the result?",
     "“Download the diff as CSV” exports five columns: type (added / removed / changed), key, column, before, after.")]),
  ["dedup", "merge", "split"], multi=True),
]


# ------------------------------------------------------------------ chrome
def head(t, lang, url):
    canon = SITE + url
    ja_url = SITE + t["url_ja"]
    en_url = SITE + t["url_en"]
    title = t["title"][0] if lang == "ja" else t["title"][1]
    desc = t["desc"][0] if lang == "ja" else t["desc"][1]
    ld_app = {
        "@context": "https://schema.org", "@type": "WebApplication",
        "name": title, "url": canon, "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web", "inLanguage": lang,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "JPY"},
        "description": desc,
    }
    faqs = t["faq"][0] if lang == "ja" else t["faq"][1]
    ld_faq = {
        "@context": "https://schema.org", "@type": "FAQPage", "inLanguage": lang,
        "mainEntity": [{"@type": "Question", "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs],
    }
    crumbs = [("ホーム" if lang == "ja" else "Home", SITE + ("/" if lang == "ja" else "/en/")),
              ("ツール" if lang == "ja" else "Tools", SITE + ("/#tools" if lang == "ja" else "/en/#tools")),
              (t["h1"][0] if lang == "ja" else t["h1"][1], canon)]
    ld_crumb = {"@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u}
                                    for i, (n, u) in enumerate(crumbs)]}
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canon}">
<link rel="alternate" hreflang="ja" href="{ja_url}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="alternate" hreflang="x-default" href="{ja_url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:locale" content="{'ja_JP' if lang == 'ja' else 'en_US'}">
<meta name="twitter:card" content="summary">
<meta name="google-site-verification" content="Z1vua0Vo7S6XuQMPogmaM0mN5b5TAKBMX3Vg7AgblTs">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/tools.css">
<link rel="stylesheet" href="/assets/hub.css">
<script type="application/ld+json">{json.dumps(ld_app, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(ld_faq, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(ld_crumb, ensure_ascii=False)}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WERRPRW455"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-WERRPRW455');</script>
</head>
<body>
"""


def header(lang, here="", switch=""):
    home = "/" if lang == "ja" else "/en/"
    guide = "/guide/what-is-csv.html" if lang == "ja" else "/en/guide/what-is-csv.html"
    t_tools = "ツール" if lang == "ja" else "Tools"
    t_guide = "ガイド" if lang == "ja" else "Guides"
    t_lang = "EN" if lang == "ja" else "日本語"
    if not switch:
        # fallback: other-language home; ?setlang makes middleware remember the
        # choice via cookie, otherwise geo routing bounces non-JP IPs back
        switch = "/en/?setlang=en" if lang == "ja" else "/?setlang=ja"
    brand = '<a class="brand" href="%s"><span class="mark">CSV</span>Format Portal</a>' % home
    return f"""<header class="site-head">
  <div class="inner">
    {brand}
    <nav class="head-nav">
      <a href="{home}#tools" class="{'here' if here == 'tools' else ''}">{t_tools}</a>
      <a href="{guide}" class="{'here' if here == 'guide' else ''}">{t_guide}</a>
      <a class="lang" href="{switch}" hreflang="{'en' if lang == 'ja' else 'ja'}">{t_lang}</a>
    </nav>
  </div>
</header>
"""


def footer(lang):
    home = "/" if lang == "ja" else "/en/"
    guide = "/guide/what-is-csv.html" if lang == "ja" else "/en/guide/what-is-csv.html"
    return f"""<footer class="site">
  <div class="inner">
    <div>© 2026 CSV Format Portal</div>
    <div class="links">
      <a href="{home}">{'ツール一覧' if lang == 'ja' else 'All tools'}</a>
      <a href="{guide}">{'CSV ガイド' if lang == 'ja' else 'CSV guides'}</a>
      <a href="{home}#privacy">{'プライバシー' if lang == 'ja' else 'Privacy'}</a>
    </div>
  </div>
</footer>
"""


# batch-2 pages live in their own module to keep this file readable
from pages_extra import PAGES_EXTRA, OPTIONS_EXTRA  # noqa: E402

PAGES = PAGES + PAGES_EXTRA


# ------------------------------------------------------------------ controls
OPTIONS = {
 "dedup": {
  "ja": """      <div class="field">
        <label>比較する列 <span class="hint">（未選択ならすべての列で判定）</span></label>
        <div class="colbox" id="colbox"><span class="drophint">CSV を読み込むと列が表示されます</span></div>
      </div>
      <div class="opts">
        <label>残す行
          <select id="keepMode"><option value="first">最初の 1 行</option><option value="last">最後の 1 行</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="ignoreCase"> 大文字小文字を区別しない</label>
        <label class="chk"><input type="checkbox" id="trimSpaces" checked> 前後の空白を無視</label>
        <label class="chk"><input type="checkbox" id="dropBlank" checked> 空白行も削除</label>
      </div>""",
  "en": """      <div class="field">
        <label>Columns to compare <span class="hint">(all columns when nothing is ticked)</span></label>
        <div class="colbox" id="colbox"><span class="drophint">Load a CSV to see its columns.</span></div>
      </div>
      <div class="opts">
        <label>Keep
          <select id="keepMode"><option value="first">first row</option><option value="last">last row</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="ignoreCase"> ignore case</label>
        <label class="chk"><input type="checkbox" id="trimSpaces" checked> ignore surrounding spaces</label>
        <label class="chk"><input type="checkbox" id="dropBlank" checked> drop blank rows</label>
      </div>""",
 },
 "split": {
  "ja": """      <div class="opts">
        <label>分割方法
          <select id="splitMode"><option value="rows">行数で分割</option><option value="parts">ファイル数で分割</option></select>
        </label>
        <label><input type="number" id="splitSize" value="1000" min="1" step="100" style="width:110px"> ごと</label>
        <label class="chk"><input type="checkbox" id="keepHead" checked> 各ファイルにヘッダー行を含める</label>
      </div>""",
  "en": """      <div class="opts">
        <label>Split by
          <select id="splitMode"><option value="rows">row count</option><option value="parts">number of files</option></select>
        </label>
        <label><input type="number" id="splitSize" value="1000" min="1" step="100" style="width:110px"> per file</label>
        <label class="chk"><input type="checkbox" id="keepHead" checked> keep the header row in every part</label>
      </div>""",
 },
 "merge": {
  "ja": """      <div class="opts">
        <label>列の揃え方
          <select id="mergeAlign"><option value="header">列名で揃える</option><option value="position">位置で揃える</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="mergeSource"> 元ファイル名を列として追加</label>
      </div>""",
  "en": """      <div class="opts">
        <label>Align by
          <select id="mergeAlign"><option value="header">column name</option><option value="position">column position</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="mergeSource"> add the source file name as a column</label>
      </div>""",
 },
 "diff": {
  "ja": """      <div class="opts">
        <label>キー列 <select id="keyCol"></select></label>
        <span class="hint">1 つ目＝変更前、2 つ目＝変更後</span>
      </div>""",
  "en": """      <div class="opts">
        <label>Key column <select id="keyCol"></select></label>
        <span class="hint">first file = before, second = after</span>
      </div>""",
 },
}


OPTIONS.update(OPTIONS_EXTRA)


def tool_shell(t, lang):
    slug = t["slug"]
    multi = t.get("multi", False)
    ja = lang == "ja"
    title = "CSV を処理" if ja else "Process your CSV"
    badge = "処理は端末内で完結" if ja else "Runs on your device"
    drop_title = "CSV をここにドロップ" if ja else "Drop a CSV here"
    if multi:
        drop_sub = ("複数のファイルを選択できます（2 つ以上）" if ja
                    else "Select multiple files (two or more)")
    else:
        drop_sub = ("または クリックして選択 ・ Shift_JIS / UTF-8 自動判定"
                    if ja else "or click to choose · Shift_JIS / UTF-8 detected")
    run_label = "実行する" if ja else "Run"
    sample_label = "サンプルで試す" if ja else "Try a sample"

    tabs = "" if multi else f"""      <div class="tabs">
        <button class="tab on" id="tabFile" type="button">{'ファイル' if ja else 'File'}</button>
        <button class="tab" id="tabPaste" type="button">{'貼り付け' if ja else 'Paste'}</button>
      </div>
"""
    paste = "" if multi else """      <div id="panePaste" class="hidden">
        <textarea id="paste" placeholder="name,email,company&#10;Tanaka,tanaka@example.com,Acme"></textarea>
      </div>
"""
    sample_btn = "" if multi else f' <button class="btn btn-sm" id="sample" type="button">{esc(sample_label)}</button>'
    multiple = " multiple" if multi else ""

    return f"""<section class="toolwrap" id="tool">
  <div class="wrap">
    <div class="toolcard">
      <div class="tc-head">
        <span class="tc-title">{esc(title)}</span>
        <span class="tc-badge">{esc(badge)}</span>
      </div>
      <div class="tc-body">
{tabs}      <div id="paneFile">
        <div class="drop" id="drop">
          <div class="drop-t">{esc(drop_title)}</div>
          <div class="drop-s">{esc(drop_sub)}</div>
        </div>
        <input type="file" id="file" accept=".csv,.tsv,.txt,text/csv"{multiple} class="hidden">
      </div>
{paste}{OPTIONS[slug][lang]}
      <div class="btnrow">
        <button class="btn btn-primary" id="run" type="button">{esc(run_label)}</button>{sample_btn}
        <span class="spacer"></span>
        <span class="drophint" id="fileinfo"></span>
      </div>
      <div class="report hidden" id="report"></div>
      <div id="out" class="hidden"></div>
    </div>
  </div>
</section>
"""


def content_sections(t, lang):
    ja = lang == "ja"
    steps = t["steps"][0] if ja else t["steps"][1]
    faqs = t["faq"][0] if ja else t["faq"][1]
    limits = t["limits"][0] if ja else t["limits"][1]
    step_items = "".join(f"<li>{esc(s)}</li>" for s in steps)
    faq_items = "".join(
        f'<details class="faq-item"><summary>{esc(q)}</summary><div class="faq-body">{esc(a)}</div></details>'
        for q, a in faqs)
    rel_cards = ""
    for slug in t["related"]:
        tool = next(x for x in TOOLS if x["slug"] == slug)
        rel_cards += (f'<a class="rel" href="{tool_href(tool, lang)}"><span class="t">'
                      f'{esc(tool["ja"] if ja else tool["en"])}</span><span class="d">'
                      f'{esc(tool["dja"] if ja else tool["den"])}</span></a>')
    return f"""<section class="sec">
  <div class="wrap">
    <h2>{'使い方' if ja else 'How to use'}</h2>
    <ol class="steps">{step_items}</ol>
    <h3>{'このツールでできないこと' if ja else 'What this tool does not do'}</h3>
    <p>{esc(limits)}</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <h2>{'よくある質問' if ja else 'FAQ'}</h2>
    <div class="faq">{faq_items}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <h2>{'関連ツール' if ja else 'Related tools'}</h2>
    <div class="related">{rel_cards}</div>
  </div>
</section>
"""


def build_page(t, lang):
    url = t["url_en"] if lang == "en" else t["url_ja"]
    ja = lang == "ja"
    h1 = t["h1"][0] if ja else t["h1"][1]
    lead = t["lead"][0] if ja else t["lead"][1]
    badge = t["badge"][0] if ja else t["badge"][1]
    home = "/" if ja else "/en/"
    badges = "".join(f'<span class="badge">{esc(x)}</span>'
                     for x in ("アップロード不要" if ja else "No upload",
                               "登録不要" if ja else "No sign-up", badge))

    page = head(t, lang, url)
    switch = (t["url_en"] if ja else t["url_ja"]) + ("?setlang=en" if ja else "?setlang=ja")
    page += header(lang, "tools", switch)
    page += f"""<section class="hero">
  <div class="wrap">
    <div class="crumbs"><a href="{home}">{'ホーム' if ja else 'Home'}</a><span class="sep">/</span><a href="{home}#tools">{'ツール' if ja else 'Tools'}</a><span class="sep">/</span>{esc(h1)}</div>
    <h1>{esc(h1)}</h1>
    <p class="lead">{esc(lead)}</p>
    <div class="badges">{badges}</div>
  </div>
</section>
"""
    page += tool_shell(t, lang)
    page += content_sections(t, lang)
    page += footer(lang)
    page += """<script src="/assets/vendor/papaparse.min.js"></script>
<script src="/assets/engine/core.js"></script>
<script src="/assets/engine/text.js"></script>
"""
    page += f'<script src="/assets/tools/{t["script"]}"></script>\n</body>\n</html>\n'
    return page


# ------------------------------------------------------------------ hub
def build_hub(lang):
    ja = lang == "ja"
    home = "/" if ja else "/en/"
    t = dict(
        url_ja="/", url_en="/en/",
        h1=("CSV の面倒な処理を、ブラウザだけで。", "Everyday CSV work, done in your browser."),
        title=("CSV ツール一覧｜重複削除・結合・比較・変換をブラウザで",
               "CSV tools that run in your browser — dedupe, merge, compare, convert"),
        desc=("CSV の重複削除・結合・差分比較・分割・文字コード変換などをブラウザだけで処理。インストールも登録も不要で、ファイルはアップロードされません。",
              "Dedupe, merge, compare, split and convert CSV files right in your browser. No install, no sign-up, no upload."),
        faq=([("データは送信されますか？", "いいえ。すべてのツールはブラウザ内で処理され、ファイルはサーバーに送信されません。"),
              ("無料で使えますか？", "はい。すべて無料で、登録もログインも不要です。"),
              ("対応している文字コードは？", "UTF-8 と Shift_JIS を自動判定して読み込みます。書き出しは UTF-8 です。")],
             [("Is my data uploaded?", "No. Every tool runs in the browser and files are never sent to a server."),
              ("Is it free?", "Yes — all tools are free, with no account and no login."),
              ("Which encodings are supported?", "UTF-8 and Shift_JIS are detected on load. Output is written as UTF-8.")]),
    )
    total = len(TOOLS)

    page = head(t, lang, home)
    page += header(lang, "tools", "/en/?setlang=en" if ja else "/?setlang=ja")

    fam_html = ""
    for key in FAM_ORDER[lang]:
        fja, fen, _fdesc = FAM[key]
        items = [x for x in TOOLS if x["fam"] == key]
        if not items:
            continue
        cards = ""
        for x in items:
            name = x["ja"] if ja else x["en"]
            desc = x["dja"] if ja else x["den"]
            if x["live"]:
                ext = ' target="_blank" rel="noopener"' if x.get("external") else ""
                cards += (f'<a class="tcard" href="{tool_href(x, lang)}"{ext}><span class="tn">{esc(name)}</span>'
                          f'<span class="td">{esc(desc)}</span></a>')
            else:
                soon = "準備中" if ja else "Soon"
                cards += (f'<span class="tcard soon"><span class="tn">{esc(name)}<em>{soon}</em></span>'
                          f'<span class="td">{esc(desc)}</span></span>')
        fam_html += f"""    <div class="fam" data-fam="{key}">
      <div class="fam-head"><h2>{esc(fja if ja else fen)}</h2><span class="fam-n">{len(items)}</span></div>
      <div class="grid-t">{cards}</div>
    </div>
"""

    chips = "".join(
        f'<button class="chip" data-fam="{k}" type="button">{esc(FAM[k][0] if ja else FAM[k][1])} '
        f'<b>{len([x for x in TOOLS if x["fam"] == k])}</b></button>'
        for k in FAM_ORDER[lang])

    if ja:
        feats = (
          '<div class="feature-card"><div class="fc-tag">Editor</div>'
          '<div class="fc-title">表のまま、その場で編集して保存</div>'
          '<div class="fc-desc">セル編集・行の追加削除・ダミーデータ生成。Excel / CSV / JSON で書き出せます。</div>'
          '<a class="btn btn-primary btn-sm" href="https://csv-editor.format-portal.com/" target="_blank" rel="noopener">エディタを開く</a></div>'
          '<div class="feature-card"><div class="fc-tag">AI</div>'
          '<div class="fc-title">区切りズレ・文字化け・表記ゆれをまとめて直す</div>'
          '<div class="fc-desc">「電話番号を11桁に揃えて」のように日本語で指示するだけ。</div>'
          '<a class="btn btn-primary btn-sm" href="/ai.html">開く</a></div>'
        )
    else:
        feats = (
          '<div class="feature-card"><div class="fc-tag">Editor</div>'
          '<div class="fc-title">Edit the table in place, then save</div>'
          '<div class="fc-desc">Cell editing, add or remove rows, generate sample data. Export to Excel, CSV or JSON.</div>'
          '<a class="btn btn-primary btn-sm" href="https://csv-editor.format-portal.com/en/" target="_blank" rel="noopener">Open the editor</a></div>'
          '<div class="feature-card"><div class="fc-tag">AI</div>'
          '<div class="fc-title">Fix broken delimiters, mojibake and inconsistent values at once</div>'
          '<div class="fc-desc">Just describe it in plain language — “make phone numbers 11 digits”.</div>'
          '<a class="btn btn-primary btn-sm" href="/en/ai.html">Open</a></div>'
        )

    guides = [
        ("/guide/what-is-csv.html" if ja else "/en/guide/what-is-csv.html",
         "CSVとは？作り方と開き方", "What CSV is, how to create and open it"),
        ("/csv-create.html" if ja else "/en/csv-create.html",
         "CSVファイルの作り方", "Creating a CSV file"),
        ("/excel-convert.html" if ja else "/en/excel-convert.html",
         "Excel との相互変換", "CSV ⇄ Excel conversion"),
        ("/mojibake.html" if ja else "/en/mojibake.html",
         "文字化けの直し方（Shift_JIS）", "Fixing mojibake (Shift_JIS)"),
        ("/reading.html" if ja else "/en/reading.html",
         "Python・pandas での読み書き", "Reading CSV in Python / pandas"),
    ]
    gh = "".join(f'<a href="{u}">{esc(a if ja else b)}</a>' for u, a, b in guides)

    trust = [("アップロード不要", "処理はすべて端末内", "No upload", "Everything runs locally"),
             ("登録不要", "開いてすぐ使える", "No sign-up", "Open and use"),
             ("日本語対応", "Excel 由来の CSV も安全", "Japanese-ready", "Safe with Excel CSVs")]
    th = "".join(f'<div class="trust"><b>{esc(a if ja else c)}</b><span>{esc(b if ja else d)}</span></div>'
                 for a, b, c, d in trust)

    page += f"""<section class="hub-hero">
  <div class="wrap">
    <h1>{esc(t['h1'][0] if ja else t['h1'][1])}</h1>
    <p class="lead">{esc(t['desc'][0] if ja else t['desc'][1])}</p>
    <div class="hub-search">
      <input type="text" id="toolSearch" placeholder="{'ツールを絞り込む（例：重複、PDF、SQL）' if ja else 'Filter tools (e.g. duplicate, PDF, SQL)'}">
    </div>
    <div class="chips" id="chips">
      <button class="chip on" data-fam="all" type="button">{'すべて' if ja else 'All'} <b>{total}</b></button>
{chips}
    </div>
  </div>
</section>

<section class="hub-tools" id="tools">
  <div class="wrap">
    <div class="feature-row">{feats}</div>
{fam_html}  </div>
</section>

<section class="hub-guide" id="guides">
  <div class="wrap">
    <h2>{'CSV の基礎と変換ガイド' if ja else 'CSV guides'}</h2>
    <div class="guide-links">{gh}</div>
  </div>
</section>

<section class="hub-trust" id="privacy">
  <div class="wrap">{th}</div>
</section>
"""
    page += footer(lang)
    page += """<script>
(function(){
  var fams=[].slice.call(document.querySelectorAll('.fam'));
  var input=document.getElementById('toolSearch');
  var chips=[].slice.call(document.querySelectorAll('.chip'));
  var cur='all';
  function apply(){
    var q=(input && input.value||'').trim().toLowerCase();
    fams.forEach(function(f){
      var key=f.getAttribute('data-fam');
      var visible=0;
      [].slice.call(f.querySelectorAll('.tcard')).forEach(function(c){
        var hit=(cur==='all'||cur===key)&&(!q||c.textContent.toLowerCase().indexOf(q)>=0);
        c.style.display=hit?'':'none';
        if(hit)visible++;
      });
      f.style.display=visible?'':'none';
    });
  }
  chips.forEach(function(c){c.onclick=function(){
    chips.forEach(function(x){x.classList.remove('on');});
    c.classList.add('on');cur=c.getAttribute('data-fam');apply();
  };});
  if(input)input.addEventListener('input',apply);
})();
</script>
</body>
</html>
"""
    return page


# ------------------------------------------------------------------ sitemap
def build_sitemap():
    urls = [("/", "1.0", "weekly"), ("/en/", "0.9", "weekly")]
    for p_ in ["csv-create", "excel-convert", "mojibake", "reading", "json", "pdf", "ai"]:
        urls.append((f"/{p_}.html", "0.8", "monthly"))
        urls.append((f"/en/{p_}.html", "0.6", "monthly"))
    urls.append(("/guide/what-is-csv.html", "0.7", "monthly"))
    urls.append(("/en/guide/what-is-csv.html", "0.5", "monthly"))
    for t in PAGES:
        urls.append((t["url_ja"], "0.8", "monthly"))
        urls.append((t["url_en"], "0.6", "monthly"))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for path, prio, freq in urls:
        ja = path if not path.startswith("/en") else (path[3:] or "/")
        en = "/en" + ja if ja != "/" else "/en/"
        out += ["  <url>",
                f"    <loc>{SITE}{path}</loc>",
                f'    <xhtml:link rel="alternate" hreflang="ja" href="{SITE}{ja}"/>',
                f'    <xhtml:link rel="alternate" hreflang="en" href="{SITE}{en}"/>',
                f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}{ja}"/>',
                f"    <lastmod>{LASTMOD}</lastmod>",
                f"    <changefreq>{freq}</changefreq>",
                f"    <priority>{prio}</priority>",
                "  </url>"]
    out.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(out) + "\n")


# ------------------------------------------------------------------ main
def main():
    for p in PAGES:
        p["path"] = PATH[p["slug"]]
        p["url_ja"] = f"/{p['path']}.html"
        p["url_en"] = f"/en/{p['path']}.html"
        ja_html = build_page(p, "ja")
        en_html = build_page(p, "en")
        with open(os.path.join(ROOT, p["path"] + ".html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(ja_html)
        os.makedirs(os.path.join(ROOT, "en"), exist_ok=True)
        with open(os.path.join(ROOT, "en", p["path"] + ".html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(en_html)
        print("tool:", p["path"])

    hub_ja = build_hub("ja")
    hub_en = build_hub("en")
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(hub_ja)
    with open(os.path.join(ROOT, "en", "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(hub_en)
    print("hub: done")

    build_sitemap()
    print("sitemap: done")


if __name__ == "__main__":
    main()
