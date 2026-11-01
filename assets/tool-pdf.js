/* tool-pdf.js — CSV -> PDF (print pipeline) for csv.format-portal.com/pdf.html
   Renders the CSV into a print-only table and lets the browser's own
   print engine produce the PDF, so CJK fonts always come out correct. */
(function () {
  'use strict';

  var LANG = /^\/en(\/|$)/.test(location.pathname) ? 'en' : 'ja';
  var M = {
    ja: {
      empty: 'CSVが空です。貼り付けるか、ファイルを選んでください。',
      loaded: '読み込みました',
      rows: '行', cols: '列', pages: '推定ページ',
      none: 'CSVを読み込むとプレビューが表示されます。',
      noTitle: 'CSV データ',
      printHint: '印刷ダイアログで「PDFに保存」を選んでください。',
      blocked: '印刷ダイアログを開けませんでした。ブラウザの設定を確認してください。'
    },
    en: {
      empty: 'The CSV is empty. Paste something or choose a file.',
      loaded: 'Loaded',
      rows: 'rows', cols: 'columns', pages: 'est. pages',
      none: 'Load a CSV to see a preview.',
      noTitle: 'CSV data',
      printHint: 'Choose “Save as PDF” in the print dialog.',
      blocked: 'The print dialog could not be opened. Check your browser settings.'
    }
  }[LANG];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var DATA = { headers: [], rows: [] };

  function parse() {
    var text = $('pdfIn').value;
    var rep = $('repPdf');
    if (!text.trim()) {
      rep.className = 'report err'; rep.innerHTML = M.empty; rep.classList.remove('hidden');
      return false;
    }
    rep.classList.add('hidden');

    var cfg = { skipEmptyLines: 'greedy' };
    var d = $('optPdfDelim').value;
    if (d !== 'auto') cfg.delimiter = d;

    var res = Papa.parse(text, cfg);
    var rows = res.data.filter(function (r) { return r.length && !(r.length === 1 && r[0] === ''); });
    if (!rows.length) return false;

    if ($('optPdfHeader').checked) {
      DATA.headers = rows.shift().map(function (h, i) { return String(h || '').trim() || ('col' + (i + 1)); });
    } else {
      DATA.headers = rows[0].map(function (_, i) { return 'col' + (i + 1); });
    }
    var n = DATA.headers.length;
    DATA.rows = rows.map(function (r) {
      var out = r.slice(0, n);
      while (out.length < n) out.push('');
      return out;
    });
    return true;
  }

  function build(doPreview) {
    var zone = $('printArea');
    var title = $('optTitle').value.trim() || M.noTitle;
    var fs = parseInt($('optFontSize').value, 10);
    var cols = DATA.headers.length;
    if ($('optAutoFit').checked) {
      // shrink further as the column count grows past what a page can hold
      if (cols > 12) fs = Math.max(5, fs - 3);
      else if (cols > 9) fs = Math.max(6, fs - 2);
      else if (cols > 6) fs = Math.max(7, fs - 1);
    }
    zone.style.setProperty('--pdf-fs', fs + 'pt');
    zone.classList.toggle('zebra-off', !$('optZebra').checked);

    var thead = '', tbody = '';
    if ($('optRepeatHead').checked) {
      thead = '<thead><tr>' + DATA.headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>';
    } else if ($('optPdfHeader').checked) {
      tbody += '<tr>' + DATA.headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr>';
    }
    DATA.rows.forEach(function (r) {
      tbody += '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    });

    var meta = new Date().toLocaleDateString(LANG === 'ja' ? 'ja-JP' : 'en-US') +
      ' · ' + DATA.rows.length + ' ' + M.rows + ' · ' + cols + ' ' + M.cols;

    zone.innerHTML = '<h1>' + esc(title) + '</h1><p class="pmeta">' + esc(meta) + '</p>' +
      '<table>' + thead + '<tbody>' + tbody + '</tbody></table>';

    if (doPreview) {
      $('pdfPreview').innerHTML = thead + '<tbody>' + tbody + '</tbody>';
    }

    // rough page estimate: 44 rows per A4 portrait page at 9pt
    var perPage = Math.max(12, Math.round(46 * (9 / fs) * ($('optOrient').value === 'landscape' ? 0.75 : 1)));
    var pages = Math.max(1, Math.ceil(DATA.rows.length / perPage));
    $('statPdf').innerHTML = '<span><b>' + DATA.rows.length + '</b> ' + M.rows + '</span>' +
      '<span><b>' + cols + '</b> ' + M.cols + '</span>' +
      '<span>' + M.pages + ' <b>~' + pages + '</b></span>' +
      '<span>' + $('optPaper').value + ' · ' + ($('optOrient').value === 'landscape' ? (LANG === 'ja' ? '横' : 'landscape') : (LANG === 'ja' ? '縦' : 'portrait')) + ' · ' + fs + 'pt</span>';
  }

  function applyPageRule() {
    var paper = $('optPaper').value;
    var orient = $('optOrient').value;
    var css = '@page{size:' + paper + ' ' + orient + ';margin:10mm}';
    var tag = document.getElementById('pdfPageRule');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'pdfPageRule';
      document.head.appendChild(tag);
    }
    tag.textContent = css;
  }

  function load() {
    if (!parse()) return;
    build(true);
    applyPageRule();
    var rep = $('repPdf');
    rep.className = 'report';
    rep.innerHTML = M.loaded + ' — ' + M.printHint;
    rep.classList.remove('hidden');
  }

  function readFile(file) {
    var r = new FileReader();
    r.onload = function (e) { $('pdfIn').value = e.target.result; load(); };
    r.readAsText(file, 'utf-8');
  }

  $('btnPdfFile').onclick = function () { $('pdfFile').click(); };
  $('pdfFile').onchange = function (e) { if (e.target.files.length) readFile(e.target.files[0]); };
  $('btnPdfLoad').onclick = load;

  $('btnPdfSample').onclick = function () {
    var ja = LANG === 'ja';
    var rows = ja
      ? ['氏名,部署,都道府県,入社日,備考',
         '佐藤 悠太,営業,東京都,2021-04-01,関東担当',
         '鈴木 花子,デザイン,大阪府,2022-09-15,UI/UX',
         '田中 次郎,開発,愛知県,2020-01-20,バックエンド',
         '高橋 誠,営業,福岡県,2023-06-05,九州担当',
         '伊藤 美咲,人事,北海道,2019-11-11,採用']
      : ['Name,Department,State,Start date,Notes',
         'Alice Johnson,Sales,CA,2021-04-01,West coast',
         'Bob Smith,Design,TX,2022-09-15,UI/UX',
         'Carol Davis,Engineering,NY,2020-01-20,Backend',
         'Dan Brown,Sales,WA,2023-06-05,North west',
         'Eve Miller,People,OR,2019-11-11,Recruiting'];
    $('pdfIn').value = rows.join('\n');
    load();
  };

  ['optPaper', 'optOrient', 'optFontSize', 'optZebra', 'optRepeatHead', 'optAutoFit'].forEach(function (id) {
    var el = $(id);
    el.onchange = function () {
      if (!DATA.headers.length) return;
      applyPageRule(); build(true);
    };
  });
  $('optTitle').oninput = function () { if (DATA.headers.length) build(false); };

  $('btnPdfSave').onclick = function () {
    if (!DATA.headers.length) { load(); if (!DATA.headers.length) return; }
    build(false);
    applyPageRule();
    setTimeout(function () { window.print(); }, 60);
  };

  ['dragenter', 'dragover'].forEach(function (ev) {
    $('pdfIn').addEventListener(ev, function (e) { e.preventDefault(); });
  });
  $('pdfIn').addEventListener('drop', function (e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length) readFile(e.dataTransfer.files[0]);
  });
})();
