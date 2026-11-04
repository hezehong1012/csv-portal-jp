# -*- coding: utf-8 -*-
"""Page copy + option markup for the ten tool pages added in batch 2.

Imported by build.py. Every page here is fully working in the browser —
no "coming soon" cards should remain on the hub.
"""


def _p(slug, script, fam, title, desc, h1, lead, badge, steps, limits, faq, related):
    return dict(slug=slug, script=script, fam=fam, title=title, desc=desc, h1=h1,
                lead=lead, badge=badge, steps=steps, limits=limits, faq=faq,
                related=related)


PAGES_EXTRA = [

    # ---------------------------------------------------------------- column
    _p("column", "column.js", "col",
       ("CSV 列の抽出・削除ツール｜必要な列だけ残す【無料・登録不要】",
        "Extract or drop CSV columns in your browser — free, no sign-up"),
       ("必要な列だけを残す、不要な列を削除する、連番を振る。列名は読み込むだけで自動表示され、チェックするだけで列を絞り込めます。元の CSV はアップロードされません。",
        "Keep only the columns you need, drop the rest, or add a row number. Column names are read automatically, so you just tick what you want — and the file never leaves your browser."),
       ("CSV の列を抽出・削除", "Extract or drop columns"),
       ("列名をチェックするだけで、必要な列だけを残せます。不要な列を落とす、先頭に連番を付ける、列名の前後の空白を削るといった下ごしらえが、すべてブラウザ内で完結します。",
        "Tick the column names you want to keep. Dropping columns, adding a row number and trimming header spaces all happen inside your browser."),
       ("列名は自動で読み込み", "Column names auto-detected"),
       (["CSV をドロップするか、表を貼り付けます。",
         "残したい列にチェックを入れます（「削除する」に切り替えれば逆になります）。",
         "「実行する」を押して結果を確認し、CSV を保存します。"],
        ["Drop a CSV or paste the table.",
         "Tick the columns you want to keep (switch the mode to drop them instead).",
         "Press Run, check the preview, then download the CSV."]),
       ("列の順番を入れ替えることはできません（元の並び順のまま出力します）。順番を変えたい場合はオンラインエディタで列をドラッグしてください。ヘッダー行のない CSV は 1 行目が列名として扱われます。",
        "Column order is preserved as-is — this tool does not reorder. Use the online editor if you need to drag columns around. A CSV without a header row will lose its first line as the header."),
       ([("列の順番を変えられますか？",
          "このページでは元の並び順のまま出力します。順番を変えたい場合は、関連ツールのオンラインエディタで列をドラッグしてから保存してください。"),
         ("ヘッダーのない CSV でも使えますか？",
          "1 行目を列名として読み込むため、データ行が 1 行失われます。先に「空白行の整理」でヘッダーを付けるか、エディタで 1 行目を追加してください。"),
         ("削除した列だけを別ファイルにできますか？",
          "モードを「選んだ列を削除」に切り替えて実行すると、削除される側だけの CSV が得られます。"),
         ("何列まで扱えますか？",
          "列数の上限は設けていません。ブラウザのメモリの範囲で動作し、数百列の表でも問題ありません。"),
         ("データは送信されますか？",
          "いいえ。読み込み・列の絞り込み・書き出しはすべてブラウザ内で行われ、サーバーには送信されません。")],
        [("Can I reorder the columns?",
          "Not here — the original order is kept. Use the online editor (linked below) to drag columns, then save."),
         ("What about a CSV without a header row?",
          "The first line is treated as the header, so you lose one data row. Add a header first (the row-cleaning tool can help) or use the editor."),
         ("Can I export only the dropped columns?",
          "Switch the mode to “drop the ticked columns” and run again — the output is then the other side of the split."),
         ("How many columns can it handle?",
          "There is no column limit; it runs within your browser's memory and handles tables with hundreds of columns."),
         ("Is my data uploaded?",
          "No. Reading, filtering and exporting all happen locally in the browser.")]),
       ["row-clean", "clean", "editor"]),

    # ------------------------------------------------------------- row-clean
    _p("row-clean", "row-clean.js", "edit",
       ("CSV 空白行削除ツール｜空の列・不要な行の整理も【無料】",
        "Delete blank rows from CSV and tidy up — free, in your browser"),
       ("CSV の空白行と空の列をまとめて削除。先頭の説明行を飛ばす、ヘッダーなしとして扱う、行をシャッフルするといった下ごしらえがブラウザだけで完結します。",
        "Delete blank rows and empty columns in one pass. Skip preamble lines, treat the file as header-less, or shuffle the rows — all inside your browser."),
       ("CSV の空白行・不要な行を整理", "Clean blank rows and columns"),
       ("Excel から書き出した CSV に混ざる空行や、途中で増えた空の列をまとめて削除します。先頭の説明行をスキップしたり、1 行目をデータとして扱ったりと、読み込み前の下ごしらえに向いています。",
        "Remove the blank rows Excel leaves behind, plus any empty columns that crept in. You can also skip a preamble, treat the first line as data, or shuffle rows before splitting a dataset."),
       ("空行・空列を一括削除", "Blank rows and columns"),
       (["CSV をドロップするか、表を貼り付けます。",
         "削除したいもの（空白行・空の列）にチェックを入れます。",
         "「実行する」を押し、削除行数を確認して保存します。"],
        ["Drop a CSV or paste the table.",
         "Tick what should go — blank rows, empty columns.",
         "Press Run, check how many rows were removed, then download."]),
       ("セルの値そのものは書き換えません。表記ゆれを直したい場合は「表記ゆれの統一」を使ってください。空白行の判定は「すべてのセルが空、または空白だけ」の行です。",
        "Cell values are not rewritten here — use the normalizing tool for that. A row counts as blank only when every cell is empty or whitespace."),
       ([("空白行の判定基準は？",
          "すべてのセルが空、または半角・全角スペースだけの行を空白行として削除します。1 つでも値が入っていれば残ります。"),
         ("先頭の説明行を飛ばせますか？",
          "「先頭 N 行をスキップ」に数値を入れてください。タイトル行や出力日時が入った CSV をそのまま表にできます。"),
         ("ヘッダーのない CSV はどう扱われますか？",
          "「1 行目もデータとして扱う」をオンにすると、1 行目を列名にせずデータとして出力します。"),
         ("行のシャッフルは何に使いますか？",
          "テストデータの並びを崩したいときや、機械学習用にデータを分割する前の並べ替えに向いています。"),
         ("データは送信されますか？",
          "いいえ。すべてブラウザ内で処理され、サーバーには送信されません。")],
        [("What counts as a blank row?",
          "A row where every cell is empty or contains only spaces. One non-empty cell keeps the row."),
         ("Can I skip the preamble?",
          "Yes — set “skip the first N lines”. Handy for CSVs that start with a title or an export timestamp."),
         ("What if there is no header row?",
          "Turn on “treat the first line as data” and line one is exported as a data row instead of becoming the header."),
         ("Why shuffle rows?",
          "Useful for breaking an ordered export, or before splitting a dataset for training and testing."),
         ("Is anything uploaded?",
          "No — the whole operation runs in your browser.")]),
       ["column", "clean", "dedup"]),

    # ------------------------------------------------------------------ sort
    _p("sort", "sort.js", "stats",
       ("CSV ソートツール｜複数列・数値・日付で並べ替え【無料】",
        "Sort CSV by one or two columns — numbers and dates handled correctly"),
       ("CSV を指定した列で並べ替え。数値は桁数に関係なく数値として、日付は日付として比較します。第 2 キーも指定でき、Excel を開かずにブラウザだけで完結します。",
        "Sort a CSV by the column you choose. Numbers compare as numbers regardless of digits, dates compare as dates, and a second sort key is supported. No Excel needed."),
       ("CSV の並べ替え（複数列ソート）", "Sort CSV rows"),
       ("「1,200」と「320」が文字列として並んでしまう問題を解消します。数値比較をオンにすれば数値として、日付なら日付として正しく並びます。第 2 キーで同点の行も整います。",
        "Stops “1,200” sorting before “320”. Turn on numeric comparison and values sort by magnitude; dates sort chronologically. Add a second key to break ties."),
       ("数値・日付も正しく並ぶ", "Numbers and dates sort correctly"),
       (["CSV をドロップするか、表を貼り付けます。",
         "並べ替えたい列と昇順・降順を選びます（必要なら第 2 キーも）。",
         "「実行する」を押して結果を確認し、CSV を保存します。"],
        ["Drop a CSV or paste the table.",
         "Pick the column and direction (optionally a second key).",
         "Press Run, check the order, then download."]),
       ("日本語の五十音順はブラウザの照合順序に従うため、ひらがな・カタカナの区別や濁点の扱いが環境によってわずかに異なります。数値と判定できない値（「約1,200」など）は文字列として比較します。",
        "Japanese collation follows the browser, so kana and voicing marks can order slightly differently across environments. Values that are not pure numbers (“approx. 1,200”) are compared as text."),
       ([("「1,200」が「320」より前に来てしまいます",
          "「数値として比較」をオンにしてください。桁区切りのカンマや前後の空白は無視して数値として比較します。"),
         ("第 2 キーは何に使いますか？",
          "1 つ目の列が同じ値だった行を、2 つ目の列で並べ替えます。部署ごとに社員を並べる、といった使い方ができます。"),
         ("日付はどう並びますか？",
          "YYYY-MM-DD 形式だけでなく、2026/1/5 や 2026年1月5日も日付として解釈して並べ替えます。"),
         ("空白セルはどこに入りますか？",
          "昇順・降順どちらでも末尾にまとまります。空欄だらけの行が先頭に来ることはありません。"),
         ("データは送信されますか？",
          "いいえ。並べ替えはブラウザ内で完結し、ファイルは送信されません。")],
        [("“1,200” sorts before “320”",
          "Turn on numeric comparison. Thousands separators and surrounding spaces are ignored so the values compare by magnitude."),
         ("What is the second key for?",
          "It orders rows that tie on the first column — for example, group by department and then sort by name inside each group."),
         ("How are dates handled?",
          "YYYY-MM-DD, 2026/1/5 and 2026年1月5日 are all recognised as dates and sorted chronologically."),
         ("Where do empty cells go?",
          "They collect at the end in both directions, so you never get a wall of blanks at the top."),
         ("Is my file uploaded?",
          "No — sorting happens entirely in your browser.")]),
       ["dedup", "column", "extract"]),

    # ----------------------------------------------------------------- clean
    _p("clean", "clean.js", "clean",
       ("CSV クレンジングツール｜空白・記号・空セルを一括整理【無料】",
        "Clean up CSV values — spaces, symbols and empty cells"),
       ("セルの前後空白、全角スペース、余分な記号、桁区切りカンマをまとめて整理。空セルを指定した値で埋めることもでき、元ファイルはアップロードされません。",
        "Trim spaces, drop full-width blanks and stray symbols, and strip thousands separators across the whole file. You can also fill empty cells with a fixed value — nothing is uploaded."),
       ("CSV のクレンジング（値の整理）", "Cleanse cell values"),
       ("コピー＆ペーストで崩れた表は、前後の空白や全角スペース、全角の記号が混ざりがちです。まとめて整えてから、検索や突合に使える状態にします。",
        "Tables copied out of mail or PDFs carry trailing spaces, full-width blanks and stray brackets. Strip them in one pass so the file is ready for lookups and joins."),
       ("空白・記号・空セルを整理", "Spaces, symbols, empty cells"),
       (["CSV をドロップするか、表を貼り付けます。",
         "整えたい項目（前後の空白・記号・空セルなど）にチェックを入れます。",
         "「実行する」を押し、変更セル数を確認して保存します。"],
        ["Drop a CSV or paste the table.",
         "Tick what should be cleaned — spaces, symbols, empty cells.",
         "Press Run, check how many cells changed, then download."]),
       ("氏名の姓名分割や住所の分解はしません。あいまいな名寄せ（「株式会社A」と「A株式会社」を同一とみなす）も行いません。記号の削除は選んだ範囲の文字だけを対象にします。",
        "This tool does not split names or addresses, and it does not fuzzy-match similar entries. Symbol removal only touches the character set you choose."),
       ([("記号削除はどの範囲ですか？",
          "「ハイフン・括弧」は電話番号や郵便番号の区切りを消す用途、「すべての記号」は句読点まで落として英数字だけにしたい用途です。実行前にプレビューで確認してください。"),
         ("空セルをまとめて埋められますか？",
          "「空セルを埋める」に値を入れてください。0 や「未設定」などで一括補完できます。"),
         ("数値のカンマは消せますか？",
          "「数値の桁区切りを削除」をオンにすると、1,200 が 1200 になります。数値として解釈できない値は変更しません。"),
         ("セル内の改行はどうなりますか？",
          "「セル内の改行・タブを空白に」をオンにすると、1 行 1 レコードの扱いやすい CSV になります。"),
         ("データは送信されますか？",
          "いいえ。すべてブラウザ内で処理されます。")],
        [("What exactly does symbol removal delete?",
          "“Hyphens and brackets” is for phone and postal codes; “all symbols” strips punctuation down to letters and digits. Check the preview before exporting."),
         ("Can I fill every empty cell at once?",
          "Yes — put a value in “fill empty cells” and blanks become 0, “n/a”, or whatever you need."),
         ("Can it strip thousands separators?",
          "Turn on that option and 1,200 becomes 1200. Values that are not numeric are left alone."),
         ("What about line breaks inside cells?",
          "The option converts in-cell newlines and tabs to spaces so every record stays on one line."),
         ("Is anything uploaded?",
          "No, everything runs locally.")]),
       ["normalize", "column", "dedup"]),

    # ------------------------------------------------------------- normalize
    _p("normalize", "normalize.js", "clean",
       ("CSV 表記ゆれ統一ツール｜全角半角・日付・電話番号を整形【無料】",
        "Normalize CSV values — full-width, dates, phone numbers"),
       ("全角の英数字を半角に、半角カナを全角に、日付を YYYY-MM-DD に統一。電話番号のハイフン削除や大文字小文字の統一まで、ブラウザだけで一括処理できます。",
        "Convert full-width letters and digits to half-width, half-width kana to full-width, and unify dates to YYYY-MM-DD. Hyphens in phone numbers and letter case can be normalized too."),
       ("CSV の表記ゆれを統一", "Normalize formatting"),
       ("「ＴＡＮＡＫＡ」「ﾀﾅｶ」「2021/4/1」「2021年4月1日」が混ざった列を、1 つの書式に揃えます。突合やシステム取り込みの前処理に最適です。",
        "Turns a column mixing “ＴＡＮＡＫＡ”, “ﾀﾅｶ”, “2021/4/1” and “2021年4月1日” into one consistent format — exactly what you need before a join or a system import."),
       ("全角半角・日付を統一", "Width, dates and phones"),
       (["CSV をドロップするか、表を貼り付けます。",
         "統一したい項目にチェックを入れます。",
         "「実行する」を押し、変更セル数を確認して保存します。"],
        ["Drop a CSV or paste the table.",
         "Tick the normalizations you want.",
         "Press Run, review the changed-cell count, then download."]),
       ("和暦（令和・平成）から西暦への変換はしません。住所の正規化（旧字体・略称の統一）もしません。電話番号のハイフン削除は、数字とハイフンだけで構成されたセルが対象です。",
        "Japanese era dates are not converted to Western years, and addresses are not normalized. Hyphen removal applies to cells made up only of digits and hyphens."),
       ([("日付はどの形式に対応していますか？",
          "2026/1/5、2026-01-05、2026.1.5、2026年1月5日、20260105 を YYYY-MM-DD に統一します。解釈できない値はそのまま残します。"),
         ("半角カナは全角になりますか？",
          "「半角カナを全角に」をオンにすると、ﾃﾞｰﾀ が データ になります。濁点・半濁点も合成します。"),
         ("電話番号のハイフンは消せますか？",
          "「電話番号のハイフンを削除」をオンにすると、03-1234-0001 が 0312340001 になります。"),
         ("数値の通貨記号は？",
          "「数値の記号・カンマを削除」で ¥1,200 → 1200 になります。"),
         ("データは送信されますか？",
          "いいえ。すべてブラウザ内で完結します。")],
        [("Which date formats are supported?",
          "2026/1/5, 2026-01-05, 2026.1.5, 2026年1月5日 and 20260105 all become YYYY-MM-DD; anything unrecognised is left untouched."),
         ("Does it convert half-width kana?",
          "Yes — with that option on, ﾃﾞｰﾀ becomes データ, including combined voicing marks."),
         ("Can hyphens be removed from phone numbers?",
          "Yes, 03-1234-0001 becomes 0312340001."),
         ("What about currency symbols?",
          "The numeric option turns ¥1,200 into 1200."),
         ("Is my data sent anywhere?",
          "No, it stays in the browser.")]),
       ["clean", "column", "shift-jis"]),

    # ------------------------------------------------------------- shift-jis
    _p("shift-jis", "shift-jis.js", "fmt",
       ("CSV 文字コード変換｜Shift_JIS を UTF-8 に（文字化け修復）【無料】",
        "Convert Shift_JIS CSV to UTF-8 in your browser — fix mojibake"),
       ("Shift_JIS / EUC-JP の CSV を UTF-8 に変換して文字化けを解消します。文字コードは自動判定し、必要なら手動で固定できます。BOM 付き出力にも対応、ファイルは送信されません。",
        "Turn a Shift_JIS or EUC-JP CSV into UTF-8 and clear up the mojibake. Encoding is detected automatically, can be forced by hand, and BOM output is supported."),
       ("CSV の文字コード変換（Shift_JIS → UTF-8）", "Convert CSV encoding"),
       ("Excel で保存した Shift_JIS の CSV を、そのまま UTF-8 に変換します。文字コードは自動判定。化けている箇所は件数で知らせます。",
        "Takes the Shift_JIS CSV your version of Excel wrote and returns clean UTF-8. Encoding is detected automatically and garbled cells are counted so you know whether it worked."),
       ("文字コードを自動判定", "Encoding auto-detected"),
       (["CSV をドロップします（貼り付けでも可）。",
         "必要なら「入力の文字コード」を Shift_JIS / EUC-JP に固定します。",
         "「実行する」を押し、文字化けが 0 件になったことを確認して保存します。"],
        ["Drop the CSV (pasting works too).",
         "If needed, force the input encoding to Shift_JIS or EUC-JP.",
         "Press Run, confirm the mojibake count is 0, then download."]),
       ("UTF-8 から Shift_JIS への書き出しはできません。ブラウザで扱える文字コードの制約で、変換は「Shift_JIS / EUC-JP → UTF-8」の一方向です。Shift_JIS で受け取る必要がある場合は、UTF-8 で保存してから Excel 側で「CSV（コンマ区切り）」として保存し直してください。",
        "Writing Shift_JIS is not possible — browsers can only encode UTF-8, so conversion is one-way. If a system insists on Shift_JIS, save the UTF-8 file and re-export it from Excel as CSV."),
       ([("文字化けが直りません",
          "「入力の文字コード」を Shift_JIS または EUC-JP に固定して、もう一度実行してください。自動判定が外れている場合はこれで直ります。"),
         ("BOM は付けたほうがいいですか？",
          "Excel でそのまま開きたい場合は BOM 付きが安全です。プログラムで読む場合は BOM なしを選んでください。"),
         ("Excel で開くと日本語が化けます",
          "UTF-8 の CSV を Excel が Shift_JIS と誤認するためです。「BOM を付ける」をオンにして保存し直すと解消します。"),
         ("EUC-JP にも対応していますか？",
          "はい。自動判定の対象で、手動でも選べます。"),
         ("データは送信されますか？",
          "いいえ。変換はブラウザ内の TextDecoder で行われ、ファイルは送信されません。")],
        [("The text is still garbled",
          "Force the input encoding to Shift_JIS or EUC-JP and run again — that fixes a wrong auto-detection."),
         ("Should I add a BOM?",
          "Yes if you want Excel to open it cleanly. Leave it off when a script will read the file."),
         ("Excel shows mojibake for my UTF-8 file",
          "Excel guesses Shift_JIS. Re-save with the BOM option on and it opens correctly."),
         ("Is EUC-JP supported?",
          "Yes, both for auto-detection and as a manual choice."),
         ("Is anything uploaded?",
          "No — decoding happens in your browser with TextDecoder.")]),
       ["newline", "delimiter", "clean"]),

    # --------------------------------------------------------------- newline
    _p("newline", "newline.js", "fmt",
       ("CSV 改行コード変換ツール｜CRLF ⇄ LF をブラウザで【無料】",
        "Convert CSV line endings — CRLF to LF and back, in your browser"),
       ("CRLF・LF・CR の改行コードを相互変換。現在の改行コードを自動判定して表示し、BOM の有無や末尾改行の扱いも選べます。ファイルはアップロードされません。",
        "Convert between CRLF, LF and CR line endings. The current ending is detected and shown, BOM and trailing-newline behaviour are configurable, and nothing is uploaded."),
       ("CSV の改行コード変換（CRLF / LF）", "Convert line endings"),
       ("Windows で作った CSV を Linux のツールに渡すと、改行コードの違いで 1 行として読まれることがあります。ここで CRLF ⇄ LF を変換しておけば、そうした事故を防げます。",
        "A CSV written on Windows can be read as a single line by Linux tooling. Convert CRLF to LF here and that class of bug disappears."),
       ("改行コードを自動判定", "Line ending detected"),
       (["CSV をドロップするか、表を貼り付けます。",
         "出力したい改行コード（CRLF / LF / CR）を選びます。",
         "「実行する」を押し、判定結果を確認して保存します。"],
        ["Drop a CSV or paste the table.",
         "Choose the output ending (CRLF, LF or CR).",
         "Press Run, check the detected value, then download."]),
       ("セル内の改行（引用符で囲まれた改行）はそのまま保持し、レコード区切りだけを変換します。改行コードの混在したファイルは、多数決で判定します。",
        "Newlines inside quoted cells are preserved; only record separators change. A file with mixed endings is classified by the majority."),
       ([("CRLF と LF はどちらを選べばいいですか？",
          "Windows の Excel やメモ帳で開くなら CRLF、Linux・macOS・Git・Web サーバー向けなら LF を選んでください。"),
         ("今の改行コードは分かりますか？",
          "実行後に「入力」として判定結果を表示します。混在している場合もその旨を出します。"),
         ("セル内の改行は壊れませんか？",
          "引用符で囲まれた改行は保持します。CSV の規格どおりの扱いです。"),
         ("末尾の改行は消せますか？",
          "「末尾の改行を入れない」をオンにすると、最終行の後ろに改行を付けません。"),
         ("データは送信されますか？",
          "いいえ。変換はブラウザ内で完結します。")],
        [("CRLF or LF — which one?",
          "CRLF for Windows Excel and Notepad, LF for Linux, macOS, Git and web servers."),
         ("How do I know the current ending?",
          "The result panel shows what was detected, including mixed endings."),
         ("Will in-cell line breaks be damaged?",
          "No — newlines inside quoted cells are preserved, as the CSV spec requires."),
         ("Can I drop the trailing newline?",
          "Yes, there is an option to omit the final line break."),
         ("Is my file uploaded?",
          "No, conversion happens locally.")]),
       ["shift-jis", "delimiter", "row-clean"]),

    # ------------------------------------------------------------- delimiter
    _p("delimiter", "delimiter.js", "conv",
       ("CSV 区切り文字変換｜カンマ ⇄ タブ ⇄ セミコロン【無料】",
        "Convert CSV delimiters — comma, tab and semicolon"),
       ("カンマ区切りをタブ（TSV）やセミコロン区切りに変換。ヨーロッパ式のセミコロン CSV も読み込めます。区切りは自動判定し、引用符の中の区切りは壊しません。",
        "Turn comma-separated data into TSV or semicolon-separated CSV — and read the semicolon files European Excel produces. Delimiters are auto-detected and quoted values stay intact."),
       ("CSV の区切り文字を変換", "Convert the delimiter"),
       ("タブ区切りを求められるシステム、カンマを含む住所データ、ヨーロッパから届くセミコロン CSV。区切り文字の違いで起きる取り込みエラーを、ブラウザだけで解消します。",
        "Some systems demand tabs, addresses contain commas, and European exports arrive semicolon-separated. Fix the delimiter mismatch here before the import fails."),
       ("カンマ・タブ・セミコロン対応", "Comma, tab and semicolon"),
       (["CSV / TSV をドロップするか、表を貼り付けます。",
         "入力と出力の区切り文字を選びます（通常は入力は「自動判定」のままで構いません）。",
         "「実行する」を押して列数を確認し、保存します。"],
        ["Drop a CSV / TSV or paste the table.",
         "Pick the input and output delimiters (leave the input on auto in most cases).",
         "Press Run, check the column count, then download."]),
       ("区切り文字そのものを含む値は自動で引用符で囲みますが、もとの引用符の使い方が壊れている場合は修復しません。列数が合わない行は、そのまま出力されます。",
        "Values containing the delimiter are quoted automatically, but broken quoting in the source is not repaired. Rows with a different column count are passed through unchanged."),
       ([("TSV に変換できますか？",
          "はい。出力の区切りで「タブ」を選ぶと .tsv として保存できます。"),
         ("セミコロン区切りの CSV を読めますか？",
          "読めます。ヨーロッパ版 Excel が出力するセミコロン区切りに対応しています。入力は「自動判定」のままで構いません。"),
         ("自動判定は何を基準にしていますか？",
          "先頭 6 行を各候補で解析し、列数がそろっている区切りを優先します。誤判定する場合は手動で指定してください。"),
         ("値の中にカンマがある場合は？",
          "自動で引用符で囲みます。Excel で開き直しても列がずれません。"),
         ("データは送信されますか？",
          "いいえ。変換はブラウザ内で完結します。")],
        [("Can it produce TSV?",
          "Yes — choose tab as the output delimiter and the file is saved as .tsv."),
         ("Can it read semicolon CSVs?",
          "Yes, including what European Excel writes. Leave the input on auto-detect."),
         ("How does auto-detection work?",
          "The first six lines are parsed with each candidate delimiter and the one giving a consistent column count wins. Set it manually if it guesses wrong."),
         ("What if a value contains a comma?",
          "It gets quoted automatically, so the columns still line up in Excel."),
         ("Is my data uploaded?",
          "No, the conversion is local.")]),
       ["json", "newline", "shift-jis"]),

    # ------------------------------------------------------------------- sql
    _p("sql", "sql.js", "sql",
       ("CSV → SQL INSERT 生成ツール｜CREATE TABLE も同時に【無料】",
        "Generate SQL INSERT statements from CSV — CREATE TABLE included"),
       ("CSV から MySQL / PostgreSQL / SQLite 用の INSERT 文を生成。列名から型を推定して CREATE TABLE も作れます。値はエスケープ済みで、データは送信されません。",
        "Generate INSERT statements for MySQL, PostgreSQL or SQLite straight from a CSV, with an inferred CREATE TABLE. Values are escaped and nothing is uploaded."),
       ("CSV から SQL INSERT 文を生成", "CSV to SQL INSERT"),
       ("テストデータの投入や、Excel で管理していたマスタの移行に。列名と値から型を推定し、CREATE TABLE と INSERT をまとめて出力します。",
        "For seeding a database from a spreadsheet, or migrating a master table kept in Excel. Column types are inferred from the values and both CREATE TABLE and INSERT are emitted."),
       ("型を自動推定", "Types inferred"),
       (["CSV をドロップするか、表を貼り付けます。",
         "テーブル名とデータベースの種類を指定します。",
         "「実行する」を押し、.sql をダウンロードして実行します。"],
        ["Drop a CSV or paste the table.",
         "Set the table name and the database dialect.",
         "Press Run, download the .sql and execute it."]),
       ("外部キー・インデックス・既定値は生成しません。型は値から推定するため、必要に応じて生成後に調整してください。既存テーブルへの追記を想定している場合は CREATE TABLE を外してください。",
        "No foreign keys, indexes or defaults are generated. Types are inferred, so review them before running. Untick CREATE TABLE when inserting into an existing table."),
       ([("対応しているデータベースは？",
          "MySQL / MariaDB、PostgreSQL、SQLite に対応しています。識別子の引用符とデータ型を方言に合わせて出力します。"),
         ("型はどう決まりますか？",
          "すべて整数なら INT/BIGINT、小数を含めば DECIMAL/NUMERIC、日付形式なら DATE、それ以外は VARCHAR（最大長から算出）です。"),
         ("大量の行でも大丈夫ですか？",
          "100 行ずつまとめた複数行 INSERT を出力します。数千行でも 1 ファイルに収まります。"),
         ("空のセルはどうなりますか？",
          "既定では空文字として出力します。「空セルを NULL にする」をオンにすると NULL になります。"),
         ("データは送信されますか？",
          "いいえ。生成はブラウザ内で完結し、CSV は送信されません。")],
        [("Which databases are supported?",
          "MySQL / MariaDB, PostgreSQL and SQLite — identifier quoting and data types follow the dialect."),
         ("How are column types chosen?",
          "All integers become INT/BIGINT, decimals become DECIMAL/NUMERIC, ISO dates become DATE, everything else VARCHAR sized from the longest value."),
         ("Does it handle large files?",
          "Yes — rows are batched 100 at a time into multi-row INSERT statements."),
         ("What about empty cells?",
          "They become empty strings by default; enable the NULL option to emit NULL instead."),
         ("Is my CSV uploaded?",
          "No, generation happens in your browser.")]),
       ["column", "json", "sort"]),

    # --------------------------------------------------------------- extract
    _p("extract", "extract.js", "gen",
       ("CSV 正規表現抽出ツール｜メール・URL・電話番号を抜き出す【無料】",
        "Extract emails, URLs and phone numbers from CSV with regex"),
       ("正規表現で CSV のセルからメールアドレス・URL・電話番号などを抽出。一致した行だけ残す、抽出結果を列として追加する、値の一覧を作る、3 つの使い方ができます。",
        "Pull emails, URLs or phone numbers out of CSV cells with a regular expression. Keep only matching rows, add the match as a new column, or produce a unique list of values."),
       ("CSV から正規表現で抽出", "Extract values with regex"),
       ("問い合わせ一覧からメールアドレスだけを抜く、アクセスログから URL だけを取り出す。正規表現を 1 つ書けば、数千行でも一瞬で抽出できます。",
        "Pull just the email addresses out of an enquiry list, or the URLs out of a log export. One pattern, applied to every row, in your browser."),
       ("メール・URL・電話番号に対応", "Email, URL and phone"),
       (["CSV をドロップするか、表を貼り付けます。",
         "正規表現と対象列、動作（行を残す／列を追加／一覧を作る）を指定します。",
         "「実行する」を押し、結果を確認して保存します。"],
        ["Drop a CSV or paste the table.",
         "Set the pattern, the target column and the mode (filter rows / add a column / build a list).",
         "Press Run, review the matches, then download."]),
       ("複数行にまたがる値は抽出しません（1 セル内で完結する一致のみ）。後読み（lookbehind）は一部の古いブラウザで動作しません。パターンが正しくない場合はエラーを表示します。",
        "Matches must fit inside a single cell. Lookbehind patterns do not work in some older browsers. An invalid pattern shows an error instead of guessing."),
       ([("よく使うパターンはありますか？",
          "メールは [\\w.+-]+@[\\w-]+\\.[\\w.-]+、URL は https?://[^\\s]+、日本の電話番号は 0\\d{1,4}-?\\d{1,4}-?\\d{3,4} で抽出できます。"),
         ("「一覧を作る」は何が違いますか？",
          "行を残さず、一致した値だけを 1 列の CSV にします。「重複を除く」をオンにすると重複のないリストになります。"),
         ("一致した行だけ残せますか？",
          "はい。動作で「一致した行だけ残す」を選ぶと、条件に合う行だけの CSV になります。"),
         ("大文字小文字は区別されますか？",
          "既定では区別します。「大文字小文字を無視」をオンにすると区別しません。"),
         ("データは送信されますか？",
          "いいえ。抽出はブラウザ内で完結し、CSV は送信されません。")],
        [("Any ready-made patterns?",
          "Email: [\\w.+-]+@[\\w-]+\\.[\\w.-]+ · URL: https?://[^\\s]+ · Japanese phone: 0\\d{1,4}-?\\d{1,4}-?\\d{3,4}."),
         ("What does the list mode do?",
          "It drops the rows and returns just the matched values as a one-column CSV; enable dedupe for a unique list."),
         ("Can I keep only matching rows?",
          "Yes — choose the filter mode and the output contains only rows with at least one match."),
         ("Is the search case-sensitive?",
          "By default yes; turn on “ignore case” to relax it."),
         ("Is my data uploaded?",
          "No, extraction is local.")]),
       ["dedup", "clean", "column"]),
]


# ------------------------------------------------------------------ options
OPTIONS_EXTRA = {
 "column": {
  "ja": """      <div class="field">
        <label>残す列 <span class="hint">（CSV を読み込むと列名が表示されます）</span></label>
        <div class="colbox" id="colbox"><span class="drophint">CSV を読み込むと列が表示されます</span></div>
      </div>
      <div class="opts">
        <label>動作
          <select id="colMode"><option value="keep">選んだ列だけ残す</option><option value="drop">選んだ列を削除</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="colSerial"> 先頭に連番列を追加</label>
        <label class="chk"><input type="checkbox" id="colTrim"> 列名の前後の空白を削除</label>
      </div>""",
  "en": """      <div class="field">
        <label>Columns <span class="hint">(names appear once you load a CSV)</span></label>
        <div class="colbox" id="colbox"><span class="drophint">Load a CSV to see its columns.</span></div>
      </div>
      <div class="opts">
        <label>Action
          <select id="colMode"><option value="keep">keep ticked columns</option><option value="drop">drop ticked columns</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="colSerial"> add a row-number column</label>
        <label class="chk"><input type="checkbox" id="colTrim"> trim spaces around column names</label>
      </div>""",
 },
 "row-clean": {
  "ja": """      <div class="opts">
        <label class="chk"><input type="checkbox" id="rcBlank" checked> 空白行を削除</label>
        <label class="chk"><input type="checkbox" id="rcEmptyCol"> 完全に空の列を削除</label>
        <label class="chk"><input type="checkbox" id="rcNoHead"> 1 行目もデータとして扱う</label>
        <label class="chk"><input type="checkbox" id="rcShuffle"> 行をランダムに並べ替え</label>
        <label>先頭 <input type="number" id="rcSkip" value="0" min="0" max="100" style="width:70px"> 行をスキップ</label>
      </div>""",
  "en": """      <div class="opts">
        <label class="chk"><input type="checkbox" id="rcBlank" checked> drop blank rows</label>
        <label class="chk"><input type="checkbox" id="rcEmptyCol"> drop entirely empty columns</label>
        <label class="chk"><input type="checkbox" id="rcNoHead"> treat the first line as data</label>
        <label class="chk"><input type="checkbox" id="rcShuffle"> shuffle the rows</label>
        <label>skip the first <input type="number" id="rcSkip" value="0" min="0" max="100" style="width:70px"> lines</label>
      </div>""",
 },
 "sort": {
  "ja": """      <div class="opts">
        <label>1 つ目の列 <select id="sortA"></select></label>
        <label>順序 <select id="sortDirA"><option value="asc">昇順</option><option value="desc">降順</option></select></label>
        <label>2 つ目の列 <select id="sortB"></select></label>
        <label>順序 <select id="sortDirB"><option value="asc">昇順</option><option value="desc">降順</option></select></label>
        <label class="chk"><input type="checkbox" id="sortNum" checked> 数値として比較</label>
        <label class="chk"><input type="checkbox" id="sortCase"> 大文字小文字を無視</label>
      </div>""",
  "en": """      <div class="opts">
        <label>First column <select id="sortA"></select></label>
        <label>Order <select id="sortDirA"><option value="asc">ascending</option><option value="desc">descending</option></select></label>
        <label>Second column <select id="sortB"></select></label>
        <label>Order <select id="sortDirB"><option value="asc">ascending</option><option value="desc">descending</option></select></label>
        <label class="chk"><input type="checkbox" id="sortNum" checked> compare as numbers</label>
        <label class="chk"><input type="checkbox" id="sortCase"> ignore case</label>
      </div>""",
 },
 "clean": {
  "ja": """      <div class="opts">
        <label class="chk"><input type="checkbox" id="clTrim" checked> 前後の空白を削除</label>
        <label class="chk"><input type="checkbox" id="clSqueeze"> 連続する空白を 1 つに</label>
        <label class="chk"><input type="checkbox" id="clZenkaku"> 全角スペースを削除</label>
        <label class="chk"><input type="checkbox" id="clBreak"> セル内の改行・タブを空白に</label>
        <label class="chk"><input type="checkbox" id="clComma"> 数値の桁区切りを削除</label>
        <label>記号
          <select id="clSymbols"><option value="none">削除しない</option><option value="basic">ハイフン・括弧を削除</option><option value="all">すべての記号を削除</option></select>
        </label>
        <label>空セルを埋める <input type="text" id="clFill" placeholder="例: 未設定" style="width:110px"></label>
      </div>""",
  "en": """      <div class="opts">
        <label class="chk"><input type="checkbox" id="clTrim" checked> trim surrounding spaces</label>
        <label class="chk"><input type="checkbox" id="clSqueeze"> collapse repeated spaces</label>
        <label class="chk"><input type="checkbox" id="clZenkaku"> remove full-width spaces</label>
        <label class="chk"><input type="checkbox" id="clBreak"> turn in-cell newlines into spaces</label>
        <label class="chk"><input type="checkbox" id="clComma"> strip thousands separators</label>
        <label>Symbols
          <select id="clSymbols"><option value="none">keep</option><option value="basic">drop hyphens and brackets</option><option value="all">drop all symbols</option></select>
        </label>
        <label>Fill empty cells <input type="text" id="clFill" placeholder="e.g. n/a" style="width:110px"></label>
      </div>""",
 },
 "normalize": {
  "ja": """      <div class="opts">
        <label class="chk"><input type="checkbox" id="nmHalf" checked> 全角英数記号 → 半角</label>
        <label class="chk"><input type="checkbox" id="nmKana" checked> 半角カナ → 全角</label>
        <label class="chk"><input type="checkbox" id="nmDate" checked> 日付を YYYY-MM-DD に統一</label>
        <label class="chk"><input type="checkbox" id="nmNum"> 数値の記号・カンマを削除</label>
        <label class="chk"><input type="checkbox" id="nmPhone"> 電話番号のハイフンを削除</label>
        <label>英字
          <select id="nmCase"><option value="keep">変更しない</option><option value="upper">大文字に統一</option><option value="lower">小文字に統一</option></select>
        </label>
      </div>""",
  "en": """      <div class="opts">
        <label class="chk"><input type="checkbox" id="nmHalf" checked> full-width to half-width</label>
        <label class="chk"><input type="checkbox" id="nmKana" checked> half-width kana to full-width</label>
        <label class="chk"><input type="checkbox" id="nmDate" checked> dates to YYYY-MM-DD</label>
        <label class="chk"><input type="checkbox" id="nmNum"> strip currency symbols and separators</label>
        <label class="chk"><input type="checkbox" id="nmPhone"> remove hyphens from phone numbers</label>
        <label>Letters
          <select id="nmCase"><option value="keep">leave as is</option><option value="upper">upper case</option><option value="lower">lower case</option></select>
        </label>
      </div>""",
 },
 "shift-jis": {
  "ja": """      <div class="opts">
        <label>入力の文字コード
          <select id="encForce"><option value="auto">自動判定</option><option value="shift_jis">Shift_JIS に固定</option><option value="euc-jp">EUC-JP に固定</option><option value="utf-8">UTF-8 に固定</option></select>
        </label>
        <label>出力の改行 <select id="encNl"><option value="CRLF">CRLF</option><option value="LF">LF</option></select></label>
        <label class="chk"><input type="checkbox" id="encBom" checked> BOM を付ける（Excel 用）</label>
      </div>""",
  "en": """      <div class="opts">
        <label>Input encoding
          <select id="encForce"><option value="auto">auto-detect</option><option value="shift_jis">force Shift_JIS</option><option value="euc-jp">force EUC-JP</option><option value="utf-8">force UTF-8</option></select>
        </label>
        <label>Output line endings <select id="encNl"><option value="CRLF">CRLF</option><option value="LF">LF</option></select></label>
        <label class="chk"><input type="checkbox" id="encBom" checked> add a BOM (for Excel)</label>
      </div>""",
 },
 "newline": {
  "ja": """      <div class="opts">
        <label>出力の改行コード
          <select id="nlOut"><option value="CRLF">CRLF（Windows）</option><option value="LF">LF（Mac / Linux）</option><option value="CR">CR（旧 Mac）</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="nlNoTrail"> 末尾の改行を入れない</label>
        <label class="chk"><input type="checkbox" id="nlBom"> BOM を付ける</label>
      </div>""",
  "en": """      <div class="opts">
        <label>Output line endings
          <select id="nlOut"><option value="CRLF">CRLF (Windows)</option><option value="LF">LF (macOS / Linux)</option><option value="CR">CR (classic Mac)</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="nlNoTrail"> omit the trailing newline</label>
        <label class="chk"><input type="checkbox" id="nlBom"> add a BOM</label>
      </div>""",
 },
 "delimiter": {
  "ja": """      <div class="opts">
        <label>入力の区切り
          <select id="dlIn"><option value="auto">自動判定</option><option value=",">カンマ (,)</option><option value="&#9;">タブ</option><option value=";">セミコロン (;)</option><option value="|">パイプ (|)</option></select>
        </label>
        <label>出力の区切り
          <select id="dlOut"><option value=",">カンマ (,)</option><option value="&#9;">タブ（TSV）</option><option value=";">セミコロン (;)</option><option value="|">パイプ (|)</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="dlBom"> BOM を付ける</label>
      </div>""",
  "en": """      <div class="opts">
        <label>Input delimiter
          <select id="dlIn"><option value="auto">auto-detect</option><option value=",">comma (,)</option><option value="&#9;">tab</option><option value=";">semicolon (;)</option><option value="|">pipe (|)</option></select>
        </label>
        <label>Output delimiter
          <select id="dlOut"><option value=",">comma (,)</option><option value="&#9;">tab (TSV)</option><option value=";">semicolon (;)</option><option value="|">pipe (|)</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="dlBom"> add a BOM</label>
      </div>""",
 },
 "sql": {
  "ja": """      <div class="opts">
        <label>テーブル名 <input type="text" id="sqlTable" value="my_table" style="width:140px"></label>
        <label>データベース
          <select id="sqlDialect"><option value="mysql">MySQL / MariaDB</option><option value="postgres">PostgreSQL</option><option value="sqlite">SQLite</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="sqlCreate" checked> CREATE TABLE を含める</label>
        <label class="chk"><input type="checkbox" id="sqlNull"> 空セルを NULL にする</label>
      </div>""",
  "en": """      <div class="opts">
        <label>Table name <input type="text" id="sqlTable" value="my_table" style="width:140px"></label>
        <label>Database
          <select id="sqlDialect"><option value="mysql">MySQL / MariaDB</option><option value="postgres">PostgreSQL</option><option value="sqlite">SQLite</option></select>
        </label>
        <label class="chk"><input type="checkbox" id="sqlCreate" checked> include CREATE TABLE</label>
        <label class="chk"><input type="checkbox" id="sqlNull"> empty cells become NULL</label>
      </div>""",
 },
 "extract": {
  "ja": """      <div class="field">
        <label>正規表現 <span class="hint">（既定はメールアドレス）</span></label>
        <input type="text" id="exPat" value="[\\w.+-]+@[\\w-]+\\.[\\w.-]+">
      </div>
      <div class="opts">
        <label>対象列 <select id="exCol"></select></label>
        <label>動作
          <select id="exMode">
            <option value="column">抽出結果を列として追加</option>
            <option value="filter">一致した行だけ残す</option>
            <option value="list">一致した値の一覧を作る</option>
          </select>
        </label>
        <label class="chk"><input type="checkbox" id="exUniq"> 重複を除く</label>
        <label class="chk"><input type="checkbox" id="exCase"> 大文字小文字を無視</label>
      </div>""",
  "en": """      <div class="field">
        <label>Regular expression <span class="hint">(email by default)</span></label>
        <input type="text" id="exPat" value="[\\w.+-]+@[\\w-]+\\.[\\w.-]+">
      </div>
      <div class="opts">
        <label>Target column <select id="exCol"></select></label>
        <label>Mode
          <select id="exMode">
            <option value="column">add the match as a column</option>
            <option value="filter">keep only matching rows</option>
            <option value="list">build a list of matches</option>
          </select>
        </label>
        <label class="chk"><input type="checkbox" id="exUniq"> drop duplicates</label>
        <label class="chk"><input type="checkbox" id="exCase"> ignore case</label>
      </div>""",
 },
}


# ---------------------------------------------------------------- json-edit
# Custom page: the tool body is not the CSV shell — three tabs (editor,
# JSON→CSV, diff) rendered by json-edit.js. Body markup is built here.
def _je_body(lang):
    ja = lang == "ja"
    L = dict(
        title="JSON エディタ" if ja else "JSON editor",
        badge="処理は端末内で完結" if ja else "Runs on your device",
        tab1="エディタ" if ja else "Editor",
        tab2="JSON → CSV" ,
        tab3="JSON Diff",
        paste="JSON を貼り付け" if ja else "Paste JSON",
        file="ファイルを選択" if ja else "Choose a file",
        sample="サンプル" if ja else "Sample",
        clear="クリア" if ja else "Clear",
        drop="またはファイルをドロップ" if ja else "or drop a file here",
        treebtn="解析してツリー表示" if ja else "Parse & show tree",
        pretty="整形" if ja else "Beautify",
        min="圧縮" if ja else "Minify",
        esc="エスケープ" if ja else "Escape",
        unesc="エスケープ解除" if ja else "Unescape",
        uni="Unicode デコード" if ja else "Decode \\uXXXX",
        copy="コピー" if ja else "Copy",
        out="出力" if ja else "Output",
        treeview="ツリービュー" if ja else "Tree view",
        expand="展開全部" if ja else "Expand all",
        collapse="折りたたみ全部" if ja else "Collapse all",
        treehint="「解析してツリー表示」を押すとここに構造が表示されます" if ja else "Press “Parse & show tree” to render the structure here",
        jc_in="JSON を貼り付け（配列・オブジェクト・JSON Lines 対応）" if ja else "Paste JSON (array, object or JSON Lines)",
        jc_flat="ネストをドット記法で平坦化" if ja else "Flatten nesting with dot notation",
        jc_bom="Excel 向け BOM を付ける" if ja else "Add BOM for Excel",
        jc_head="ヘッダー行を含める" if ja else "Include header row",
        jc_delim="区切り文字" if ja else "Delimiter",
        jc_comma="カンマ" if ja else "Comma",
        jc_semi="セミコロン" if ja else "Semicolon",
        jc_tab="タブ" if ja else "Tab",
        jc_run="変換する" if ja else "Convert",
        jc_stat="まだ変換していません" if ja else "Not converted yet",
        jc_out="出力（CSV）" if ja else "Output (CSV)",
        jc_dl=".csv をダウンロード" if ja else "Download .csv",
        jd_a="JSON A（変更前）" if ja else "JSON A (before)",
        jd_b="JSON B（変更後）" if ja else "JSON B (after)",
        jd_run="比較する" if ja else "Compare",
        jd_stat="まだ比較していません" if ja else "Not compared yet",
        jd_add="追加" if ja else "added",
        jd_del="削除" if ja else "removed",
        jd_chg="変更" if ja else "changed",
        jd_none="差分はありません（同一のデータです）" if ja else "No differences — the data is identical.",
        jd_txt="差分をテキストでコピー" if ja else "Copy diff as text",
    )
    ph = '{"name":"Alice","age":30,"tags":["admin","dev"]}'
    return f"""<section class="toolwrap" id="tool">
  <div class="wrap">
    <div class="toolcard">
      <div class="tc-head">
        <span class="tc-title">{L['title']}</span>
        <span class="tc-badge">{L['badge']}</span>
      </div>
      <div class="tc-body">
        <div class="tabs" role="tablist">
          <button class="tab on" data-pane="edit" type="button" role="tab">{L['tab1']}</button>
          <button class="tab" data-pane="tocsv" type="button" role="tab">{L['tab2']}</button>
          <button class="tab" data-pane="diff" type="button" role="tab">{L['tab3']}</button>
        </div>

        <div class="pane" id="pane-edit">
          <div class="je-grid">
            <div>
              <div class="field"><label for="jeIn">{L['paste']}</label>
                <textarea id="jeIn" spellcheck="false" placeholder="{ph}"></textarea></div>
              <div class="btnrow">
                <button class="btn btn-sm" id="jeFile" type="button">{L['file']}</button>
                <input type="file" id="jeF" accept=".json,.jsonl,.ndjson,.txt" hidden>
                <button class="btn btn-sm" id="jeSample" type="button">{L['sample']}</button>
                <button class="btn btn-sm" id="jeClear" type="button">{L['clear']}</button>
                <label class="drophint" for="jeF">{L['drop']}</label>
              </div>
              <div class="btnrow">
                <button class="btn btn-primary" id="jeTree" type="button">{L['treebtn']}</button>
                <button class="btn" id="jePretty" type="button">{L['pretty']}</button>
                <button class="btn" id="jeMin" type="button">{L['min']}</button>
                <button class="btn" id="jeEsc" type="button">{L['esc']}</button>
                <button class="btn" id="jeUnesc" type="button">{L['unesc']}</button>
                <button class="btn" id="jeUni" type="button">{L['uni']}</button>
                <button class="btn" id="jeCopy" type="button">{L['copy']}</button>
              </div>
              <div class="report err hidden" id="jeRep"></div>
              <div class="field" style="margin-top:14px"><label for="jeOut">{L['out']}</label>
                <textarea id="jeOut" readonly spellcheck="false"></textarea></div>
            </div>
            <div>
              <div class="je-tree-head"><label>{L['treeview']}</label>
                <span class="btnrow" style="margin:0">
                  <button class="btn btn-sm" id="jeExpand" type="button">{L['expand']}</button>
                  <button class="btn btn-sm" id="jeCollapse" type="button">{L['collapse']}</button>
                </span></div>
              <div class="je-tree" id="jeTreeBox"><span class="drophint">{L['treehint']}</span></div>
            </div>
          </div>
        </div>

        <div class="pane hidden" id="pane-tocsv">
          <div class="field"><label for="jcIn">{L['jc_in']}</label>
            <textarea id="jcIn" spellcheck="false" placeholder='[{{"name":"Alice","age":30,"address":{{"city":"Tokyo"}}}}]'></textarea></div>
          <div class="btnrow">
            <button class="btn btn-sm" id="jcFile" type="button">{L['file']}</button>
            <input type="file" id="jcF" accept=".json,.jsonl,.ndjson,.txt" hidden>
            <button class="btn btn-sm" id="jcSample" type="button">{L['sample']}</button>
            <button class="btn btn-sm" id="jcClear" type="button">{L['clear']}</button>
          </div>
          <div class="opts" style="margin-top:14px">
            <label class="chk"><input type="checkbox" id="jcFlat" checked> {L['jc_flat']}</label>
            <label class="chk"><input type="checkbox" id="jcBom"> {L['jc_bom']}</label>
            <label class="chk"><input type="checkbox" id="jcHead" checked> {L['jc_head']}</label>
            <label>{L['jc_delim']}
              <select id="jcDelim"><option value=",">{L['jc_comma']}</option><option value=";">{L['jc_semi']}</option><option value="&#9;">{L['jc_tab']}</option></select></label>
          </div>
          <div class="btnrow"><button class="btn btn-primary" id="jcRun" type="button">{L['jc_run']}</button></div>
          <div class="stat" id="jcStat"><span>{L['jc_stat']}</span></div>
          <div class="field" style="margin-top:14px"><label for="jcOut">{L['jc_out']}</label>
            <textarea id="jcOut" readonly spellcheck="false"></textarea></div>
          <div class="btnrow">
            <button class="btn" id="jcCopy" type="button">{L['copy']}</button>
            <button class="btn" id="jcDl" type="button">{L['jc_dl']}</button>
          </div>
          <div class="report err hidden" id="jcRep"></div>
        </div>

        <div class="pane hidden" id="pane-diff">
          <div class="je-grid">
            <div class="field"><label for="jdA">{L['jd_a']}</label>
              <textarea id="jdA" spellcheck="false"></textarea></div>
            <div class="field"><label for="jdB">{L['jd_b']}</label>
              <textarea id="jdB" spellcheck="false"></textarea></div>
          </div>
          <div class="btnrow">
            <button class="btn btn-primary" id="jdRun" type="button">{L['jd_run']}</button>
            <button class="btn btn-sm" id="jdSample" type="button">{L['sample']}</button>
            <span class="spacer"></span>
            <button class="btn btn-sm" id="jdTxt" type="button">{L['jd_txt']}</button>
          </div>
          <div class="stat" id="jdStat"><span>{L['jd_stat']}</span></div>
          <div class="hidden" id="jdOut" style="margin-top:14px"></div>
          <div class="report err hidden" id="jdRep"></div>
        </div>
      </div>
    </div>
  </div>
</section>
"""


PAGES_EXTRA.append(dict(
    slug="json-edit", script="json-edit.js", fam="conv",
    title=("JSON エディタ｜ツリー表示・整形・圧縮・JSON→CSV 変換【無料・ブラウザ完結】",
           "JSON editor — tree view, format, minify, JSON to CSV — free, in your browser"),
    desc=("JSON をツリー表示で確認し、整形・圧縮・エスケープ・Unicode デコードがその場でできる無料のオンラインエディタ。JSON→CSV 変換（ネスト平坦化・BOM 対応）と 2 つの JSON の差分比較も同じページのタブで使えます。データは送信されません。",
          "A free online JSON editor: inspect JSON as a collapsible tree, beautify, minify, escape and decode \\uXXXX on the spot. The same page also converts JSON to CSV (with nesting flattened and BOM for Excel) and diffs two JSON documents. Nothing is uploaded."),
    h1=("JSON エディタ", "JSON editor"),
    lead=("ツリー表示で構造をたどり、整形・圧縮・エスケープ・Unicode デコードをその場で。タブを切り替えるだけで JSON→CSV 変換と 2 つの JSON の差分比較も同じページでできます。すべてブラウザ内で処理され、データは送信されません。",
          "Walk the structure as a collapsible tree and beautify, minify, escape or decode on the spot. Switch tabs to convert JSON to CSV or diff two JSON documents — all inside your browser, nothing uploaded."),
    badge=("ツリー表示・JSON→CSV・Diff 対応", "Tree view, JSON to CSV, diff"),
    steps=(["JSON を貼り付けるか、.json ファイルを選択します。",
            "「解析してツリー表示」で構造をたどり、整形・圧縮・エスケープなどの操作を押します。",
            "「JSON → CSV」タブで変換、「JSON Diff」タブで 2 つの JSON の違いを確認できます。"],
           ["Paste JSON or choose a .json file.",
            "Press “Parse & show tree” to walk the structure, then use beautify, minify, escape and the rest.",
            "Switch to the “JSON → CSV” tab to convert, or “JSON Diff” to compare two documents."]),
    limits=("ツリー表示と Diff は解析結果の確認用です。100 万文字を超えるような巨大な JSON では、ツリーのノード数を上限までに制して表示します。JSON→CSV はオブジェクトの配列（または JSON Lines）を想定しており、配列の中に配列が直接入るデータは 1 行ずつ JSON 文字列として格納します。",
            "The tree and the diff are for inspection. Very large JSON (over ~1M characters) shows a capped number of tree nodes. JSON to CSV expects an array of objects (or JSON Lines); arrays nested directly inside rows are stored as JSON strings in one cell."),
    faq=([("整形と圧縮の違いは何ですか？",
           "整形はインデントと改行を付けて読みやすくする処理、圧縮は余白をすべて取り除いて 1 行にする処理です。どちらも JSON としての中身は変わりません。"),
          ("ネストした JSON を CSV にするとどうなりますか？",
           "「ネストをドット記法で平坦化」がオンの場合、address.city のような列名に展開されます。配列は JSON 文字列として 1 セルに格納します。"),
          ("JSON Lines (.jsonl) はそのまま使えますか？",
           "はい。1 行 1 レコードの JSON Lines は自動判定して、配列として読み込みます。"),
          ("Diff はどこまで細かく分かりますか？",
           "ドット記法のパス単位で、追加・削除・変更を判定します。たとえば user.name が変わっていれば「user.name: 変更前 → 変更後」と表示します。"),
          ("データは送信されますか？",
           "いいえ。解析・変換・比較のすべてがブラウザ内で完結し、サーバーには一切送信されません。")],
         [("What is the difference between beautify and minify?",
           "Beautify adds indentation and line breaks for readability; minify strips all whitespace into a single line. The JSON content itself never changes."),
          ("What happens to nested JSON when converting to CSV?",
           "With “flatten nesting” on, nested keys become dotted column names like address.city. Arrays inside a row are stored as JSON strings in one cell."),
          ("Can I paste JSON Lines (.jsonl)?",
           "Yes — one record per line is detected automatically and read as an array."),
          ("How detailed is the diff?",
           "Differences are reported per dot-notation path: if user.name changed, you see “user.name: before → after”, marked as added, removed or changed."),
          ("Is my data uploaded?",
           "No. Parsing, converting and comparing all happen in your browser; nothing is sent to a server.")]),
    related=["json", "editor", "extract"],
    custom=True,
    body=(_je_body("ja"), _je_body("en")),
))
