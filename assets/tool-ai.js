/* tool-ai.js — CSV diagnosis and repair for csv.format-portal.com/ai.html
   Rule-based repairs run entirely in the browser. The optional AI panel posts
   a plain-language instruction to /api/repair, which returns the repaired CSV. */
(function () {
  'use strict';

  var LANG = /^\/en(\/|$)/.test(location.pathname) ? 'en' : 'ja';
  var M = {
    ja: {
      empty: 'CSVが空です。貼り付けるか、ファイルを選んでください。',
      clean: '問題は見つかりませんでした。このまま使えます。',
      found: '件の問題を見つけました',
      fixed: '修復しました',
      changed: '変更したセル',
      rows: '行', cols: '列',
      delim: '区切り文字',
      mixedDelim: '区切り文字が混在しています',
      colMismatch: '列数が揃っていない行があります',
      quotes: '引用符の対応が取れていない行があります',
      mojibake: '文字化けらしき文字列',
      fullwidth: '全角の英数字',
      dates: '日付の形式が混在しています',
      decimal: '欧州式の小数（1.234,56）',
      dupHeader: '重複した列名',
      sample: '壊れたサンプル',
      aiWait: 'AIが修復しています…',
      aiNoKey: 'AIモードは現在利用できません（サーバーにAPIキーが設定されていません）。ブラウザ内の自動修復はすべて利用できます。',
      aiErr: 'AIの呼び出しに失敗しました。時間をおいて再度お試しください。',
      aiOk: 'AIによる修復が完了しました',
      aiNotes: 'AIのメモ',
      noInstr: 'やってほしいことを入力してください。'
    },
    en: {
      empty: 'The CSV is empty. Paste something or choose a file.',
      clean: 'No problems found — this file looks fine.',
      found: 'problem(s) found',
      fixed: 'Repaired',
      changed: 'cells changed',
      rows: 'rows', cols: 'columns',
      delim: 'delimiter',
      mixedDelim: 'Mixed delimiters',
      colMismatch: 'Rows with an inconsistent column count',
      quotes: 'Lines with unbalanced quotes',
      mojibake: 'Suspected mojibake',
      fullwidth: 'Full-width alphanumerics',
      dates: 'Inconsistent date formats',
      decimal: 'European decimals (1.234,56)',
      dupHeader: 'Duplicate column names',
      sample: 'Broken sample',
      aiWait: 'Asking the AI to repair it…',
      aiNoKey: 'The AI mode is not available right now (no API key configured on the server). Every in-browser repair still works.',
      aiErr: 'The AI call failed. Please try again in a moment.',
      aiOk: 'AI repair finished',
      aiNotes: 'AI notes',
      noInstr: 'Describe what you want done.'
    }
  }[LANG];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function on(el) { return el && el.checked; }
  function opt(name) {
    var el = document.querySelector('[data-fix="' + name + '"]');
    return !!(el && el.checked);
  }

  /* ---------------- delimiters ---------------- */
  function countOutsideQuotes(line, ch) {
    var n = 0, q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') q = !q;
      else if (c === ch && !q) n++;
    }
    return n;
  }

  function detectDelimiter(text) {
    var cands = [',', ';', '\t', '|'];
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length > 60) lines = lines.slice(0, 60);
    var best = { d: ',', score: -1, mode: 0, mixed: 0, lines: lines.length };

    cands.forEach(function (d) {
      var freq = {}, mode = 0, max = 0;
      lines.forEach(function (l) {
        var c = countOutsideQuotes(l, d);
        freq[c] = (freq[c] || 0) + 1;
        if (freq[c] > max) { max = freq[c]; mode = c; }
      });
      if (mode === 0) return;
      var score = max * 100 + mode;
      if (score > best.score) {
        best = { d: d, score: score, mode: mode, mixed: lines.length - max, lines: lines.length };
      }
    });
    return best;
  }

  /* ---------------- cell helpers ---------------- */
  var MOJI = /(?:[\u00C2\u00C3\u00E3][\u0080-\u00BF])|ï¿½|[\u7E62\u7E6B\u8B41]|Ã©|Ã¨|Ã¤/;

  function halfWidth(s) {
    return s.replace(/[\uFF01-\uFF5E]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    }).replace(/\u3000/g, ' ');
  }

  function normDate(s) {
    var t = s.trim();
    var m = t.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
    if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
    m = t.match(/^(\d{4})\u5E74(\d{1,2})\u6708(\d{1,2})\u65E5$/);
    if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
    return null;
  }
  function pad(v) { return String(v).length < 2 ? '0' + v : String(v); }

  function euroNumber(s) {
    var t = s.trim();
    if (!/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return null;
    return t.replace(/\./g, '').replace(',', '.');
  }

  /* ---------------- diagnosis ---------------- */
  function diagnose(text) {
    var det = detectDelimiter(text);
    var cfg = { skipEmptyLines: 'greedy', delimiter: det.d };
    var res = Papa.parse(text, cfg);
    var rows = res.data.filter(function (r) { return r.length && !(r.length === 1 && r[0] === ''); });

    var counts = {};
    rows.forEach(function (r) { counts[r.length] = (counts[r.length] || 0) + 1; });
    var mode = 0, max = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > max) { max = counts[k]; mode = parseInt(k, 10); } });
    var mismatch = rows.length - max;

    var quoteBad = 0;
    text.split(/\r?\n/).forEach(function (l) {
      var q = (l.match(/"/g) || []).length;
      if (q % 2 === 1) quoteBad++;
    });

    var moji = 0, full = 0, dates = 0, euros = 0;
    var dateForms = {};
    rows.forEach(function (r) {
      r.forEach(function (c) {
        var v = String(c == null ? '' : c);
        if (MOJI.test(v)) moji++;
        if (/[\uFF01-\uFF5E]/.test(v)) full++;
        var d = normDate(v);
        if (d && v.trim() !== d) { dates++; dateForms[v.trim().replace(/\d/g, '9')] = 1; }
        if (euroNumber(v)) euros++;
      });
    });

    var head = rows.length ? rows[0] : [];
    var seen = {}, dup = 0;
    head.forEach(function (h) {
      var k = String(h || '').trim();
      if (!k) return;
      if (seen[k]) dup++; else seen[k] = 1;
    });

    var issues = [];
    if (det.mixed > 0 && det.mixed < det.lines) {
      issues.push({ k: 'mixedDelim', n: det.mixed, d: M.mixedDelim });
    }
    if (mismatch > 0) issues.push({ k: 'padCols', n: mismatch, d: M.colMismatch });
    if (quoteBad > 0) issues.push({ k: 'fixQuotes', n: quoteBad, d: M.quotes });
    if (moji > 0) issues.push({ k: 'moji', n: moji, d: M.mojibake, fatal: true });
    if (full > 0) issues.push({ k: 'halfWidth', n: full, d: M.fullwidth });
    if (dates > 0) issues.push({ k: 'dates', n: dates, d: M.dates });
    if (euros > 0) issues.push({ k: 'decimalComma', n: euros, d: M.decimal });
    if (dup > 0) issues.push({ k: 'dedupeHeader', n: dup, d: M.dupHeader });

    return { rows: rows, det: det, mode: mode, issues: issues };
  }

  function renderReport(box, diag, headline) {
    var html = '<b>' + esc(headline) + '</b>';
    if (diag.issues.length) {
      html += '<ul>' + diag.issues.map(function (i) {
        return '<li>' + esc(i.d) + ' — <b>' + i.n + '</b></li>';
      }).join('') + '</ul>';
    } else {
      html += '<div style="margin-top:6px">' + esc(M.clean) + '</div>';
    }
    var dName = diag.det.d === ',' ? (LANG === 'ja' ? 'カンマ' : 'comma')
      : diag.det.d === ';' ? (LANG === 'ja' ? 'セミコロン' : 'semicolon')
        : diag.det.d === '\t' ? (LANG === 'ja' ? 'タブ' : 'tab') : (LANG === 'ja' ? 'パイプ' : 'pipe');
    html += '<div style="margin-top:8px;font-size:12.5px;opacity:.85">' + M.delim + ': <b>' + esc(dName) +
      '</b> · ' + diag.rows.length + ' ' + M.rows + ' · ' + diag.mode + ' ' + M.cols + '</div>';
    box.className = 'report' + (diag.issues.length ? ' warn' : '');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }

  /* ---------------- repair ---------------- */
  function repair(diag) {
    var rows = diag.rows.map(function (r) { return r.map(function (c) { return String(c == null ? '' : c); }); });
    var ncol = diag.mode || (rows[0] ? rows[0].length : 0);
    var changed = 0;

    // rows that were merged into one cell because they used an alternate
    // delimiter get re-split with that delimiter
    if (opt('mergeDelim') || opt('padCols')) {
      var alts = [',', ';', '\t', '|'].filter(function (d) { return d !== diag.det.d; });
      rows = rows.map(function (r) {
        if (r.length >= ncol || r.length !== 1) return r;
        var cell = r[0];
        for (var i = 0; i < alts.length; i++) {
          if (cell.indexOf(alts[i]) === -1) continue;
          var p = (Papa.parse(cell, { delimiter: alts[i] }).data[0] || []);
          if (p.length === ncol) { changed++; return p; }
        }
        return r;
      });
    }

    if (opt('padCols')) {
      rows = rows.map(function (r) {
        if (r.length !== ncol) changed++;
        var o = r.slice(0, ncol);
        while (o.length < ncol) o.push('');
        return o;
      });
    }

    rows = rows.map(function (r) {
      return r.map(function (v) {
        var orig = v;
        if (opt('trim')) v = v.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
        if (opt('halfWidth')) v = halfWidth(v);
        if (opt('dates')) { var d = normDate(v); if (d) v = d; }
        if (opt('decimalComma')) { var e = euroNumber(v); if (e) v = e; }
        if (v !== orig) changed++;
        return v;
      });
    });

    if (opt('dropEmpty')) {
      rows = rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
    }

    if (opt('dedupeHeader') && rows.length) {
      var seen = {};
      rows[0] = rows[0].map(function (h, i) {
        var k = String(h).trim() || ('col' + (i + 1));
        if (seen[k]) { seen[k]++; k = k + '_' + seen[k]; changed++; }
        else seen[k] = 1;
        return k;
      });
    }

    var csv = Papa.unparse(rows, { delimiter: diag.det.d, newline: '\r\n' });
    return { csv: csv, rows: rows, changed: changed };
  }

  function preview(rows) {
    var box = $('aiPreviewWrap'), table = $('aiPreview');
    var max = Math.min(rows.length, 30);
    var cols = rows[0] ? rows[0].length : 0;
    var html = '<thead><tr><th class="idx">#</th>';
    for (var c = 0; c < cols; c++) html += '<th>' + esc(rows[0] ? rows[0][c] : '') + '</th>';
    html += '</tr></thead><tbody>';
    for (var r = 1; r < max; r++) {
      html += '<tr><td class="idx">' + r + '</td>';
      for (var j = 0; j < cols; j++) html += '<td>' + esc(rows[r] && rows[r][j] != null ? rows[r][j] : '') + '</td>';
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
    box.classList.remove('hidden');
  }

  var LAST = null;

  function runDiagnose() {
    var text = $('aiIn').value;
    var box = $('repAi');
    if (!text.trim()) { box.className = 'report err'; box.innerHTML = M.empty; box.classList.remove('hidden'); return; }
    var d = diagnose(text);
    LAST = d;
    renderReport(box, d, d.issues.length ? d.issues.length + ' ' + M.found : M.clean);
    preview(d.rows);
    $('statAi').innerHTML = '';
    $('btnAiDownload').classList.add('hidden');
  }

  function runFix() {
    var text = $('aiIn').value;
    var box = $('repAi');
    if (!text.trim()) { box.className = 'report err'; box.innerHTML = M.empty; box.classList.remove('hidden'); return; }
    var d = LAST || diagnose(text);
    var out = repair(d);
    LAST = d;
    $('aiIn').value = out.csv;
    renderReport(box, d, M.fixed + ' — ' + out.changed + ' ' + M.changed);
    preview(out.rows);
    $('btnAiDownload').classList.remove('hidden');
    $('statAi').innerHTML = '<span><b>' + out.rows.length + '</b> ' + M.rows + '</span>' +
      '<span><b>' + (out.rows[0] ? out.rows[0].length : 0) + '</b> ' + M.cols + '</span>';
    LAST = null;
  }

  function download() {
    var text = $('aiIn').value;
    var blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'repaired.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------- AI ---------------- */
  function runAi() {
    var instruction = $('aiInstruction').value.trim();
    var box = $('repAiLlm');
    if (!instruction) { box.className = 'report err'; box.innerHTML = M.noInstr; box.classList.remove('hidden'); return; }
    box.className = 'report'; box.innerHTML = M.aiWait; box.classList.remove('hidden');
    var btn = $('btnAiRun'); btn.disabled = true;

    fetch('/api/repair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csv: $('aiIn').value.slice(0, 60000),
        instruction: instruction,
        lang: LANG
      })
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
    }).then(function (res) {
      btn.disabled = false;
      if (!res.ok) {
        var msg = res.status === 501 ? M.aiNoKey : (res.body && res.body.error) || M.aiErr;
        box.className = 'report warn'; box.innerHTML = esc(msg); return;
      }
      if (res.body.csv) {
        $('aiIn').value = res.body.csv;
        var rows = Papa.parse(res.body.csv, { skipEmptyLines: 'greedy' }).data;
        preview(rows);
        $('btnAiDownload').classList.remove('hidden');
      }
      box.className = 'report';
      box.innerHTML = '<b>' + esc(M.aiOk) + '</b>' +
        (res.body.notes ? '<div style="margin-top:6px;white-space:pre-wrap">' + esc(res.body.notes) + '</div>' : '');
    }).catch(function () {
      btn.disabled = false;
      box.className = 'report err'; box.innerHTML = M.aiErr;
    });
  }

  /* ---------------- wiring ---------------- */
  $('btnAiFile').onclick = function () { $('aiFile').click(); };
  $('aiFile').onchange = function (e) {
    if (!e.target.files.length) return;
    var r = new FileReader();
    r.onload = function (ev) { $('aiIn').value = ev.target.result; runDiagnose(); };
    r.readAsText(e.target.files[0], 'utf-8');
  };
  $('btnAiSample').onclick = function () {
    var s = LANG === 'ja'
      ? '氏名;部署;入社日;金額\n佐藤 悠太;営業;2021/4/1;1.234,56\n鈴木 花子,デザイン,2022.09.15,980\n田中 次郎;開発;2020年1月20日;45,200\n\n高橋 誠;営業;2023/06/05;7600\n伊藤 美咲;人事;2019/11/11; "東京, 本社"'
      : 'Name;Department;Start;Amount\nAlice Johnson;Sales;2021/4/1;1.234,56\nBob Smith,Design,2022.09.15,980\nCarol Davis;Engineering;2020年1月20日;45,200\n\nDan Brown;Sales;2023/06/05;7600\nEve Miller;People;2019/11/11;"Austin, HQ"';
    $('aiIn').value = s;
    runDiagnose();
  };
  $('btnAiDiag').onclick = runDiagnose;
  $('btnAiFix').onclick = runFix;
  $('btnAiDownload').onclick = download;
  $('btnAiRun').onclick = runAi;

  ['dragenter', 'dragover'].forEach(function (ev) {
    $('aiIn').addEventListener(ev, function (e) { e.preventDefault(); });
  });
  $('aiIn').addEventListener('drop', function (e) {
    e.preventDefault();
    if (!e.dataTransfer.files.length) return;
    var r = new FileReader();
    r.onload = function (ev) { $('aiIn').value = ev.target.result; runDiagnose(); };
    r.readAsText(e.dataTransfer.files[0], 'utf-8');
  });
})();
