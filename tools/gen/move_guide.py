# -*- coding: utf-8 -*-
"""Move the long guide currently on / to /guide/what-is-csv.html (JA + EN).

The article markup and its inline CSS are kept verbatim; only the canonical /
hreflang / og:url are repointed and relative internal links become absolute so
they keep working one directory deeper.
"""
import os, re, io

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://csv.format-portal.com"

def convert(src, dst, lang):
    with io.open(os.path.join(ROOT, src), encoding="utf-8") as f:
        h = f.read()

    base = "/en/" if lang == "en" else "/"
    ja_url = "/guide/what-is-csv.html"
    en_url = "/en/guide/what-is-csv.html"
    canon = SITE + (en_url if lang == "en" else ja_url)

    h = re.sub(r'<link rel="canonical" href="[^"]*">',
               f'<link rel="canonical" href="{canon}">', h, count=1)
    h = re.sub(r'<link rel="alternate" hreflang="ja" href="[^"]*">',
               f'<link rel="alternate" hreflang="ja" href="{SITE}{ja_url}">', h, count=1)
    h = re.sub(r'<link rel="alternate" hreflang="en" href="[^"]*">',
               f'<link rel="alternate" hreflang="en" href="{SITE}{en_url}">', h, count=1)
    h = re.sub(r'<link rel="alternate" hreflang="x-default" href="[^"]*">',
               f'<link rel="alternate" hreflang="x-default" href="{SITE}{ja_url}">', h, count=1)
    h = re.sub(r'<meta property="og:url" content="[^"]*">',
               f'<meta property="og:url" content="{canon}">', h, count=1)

    # relative internal links -> absolute
    def fix(m):
        t = m.group(1)
        if t.startswith(("http", "/", "#", "mailto:", "tel:")):
            return m.group(0)
        if not t.endswith(".html") and t != "":
            return m.group(0)
        if t in ("index.html", "./index.html", ""):
            return f'href="{base}"'
        return f'href="{base}{t}"'

    h = re.sub(r'href="([^"]*)"', fix, h)

    # breadcrumb: ホーム › CSV完全ガイド  ->  ホーム › ガイド › CSVとは
    if lang == "en":
        h = h.replace('<a href="/">Home</a><span class="sep">›</span><span>CSV complete guide</span>',
                      '<a href="/en/">Home</a><span class="sep">›</span><a href="/en/#guides">Guides</a><span class="sep">›</span><span>What is CSV</span>')
    else:
        h = h.replace('<a href="/">ホーム</a><span class="sep">›</span><span>CSV完全ガイド</span>',
                      '<a href="/">ホーム</a><span class="sep">›</span><a href="/#guides">ガイド</a><span class="sep">›</span><span>CSVとは</span>')

    out = os.path.join(ROOT, dst)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with io.open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(h)
    print("wrote", dst, len(h))

if __name__ == "__main__":
    convert("index.html", "guide/what-is-csv.html", "ja")
    convert("en/index.html", "en/guide/what-is-csv.html", "en")
