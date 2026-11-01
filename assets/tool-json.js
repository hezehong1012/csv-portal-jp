/* tool-json.js — CSV <-> JSON converter for csv.format-portal.com/json.html
   Pure client-side. Uses PapaParse (vendored). */
(function () {
  'use strict';

  var LANG = /^\/en(\/|$)/.test(location.pathname) ? 'en' : 'ja';
  var M = {
    ja: {
      empty: 'CSVが空です。貼り付けるか、ファイルを選んでください。',
      parseErr: 'CSVの解析でエラーが出ました: ',
      done: '変換しました',
      rows: '行', cols: '列', size: 'サイズ',
      jsonEmpty: 'JSONが空です。貼り付けるか、ファイルを選んでください。',
      badJson: 'JSONとして読めませんでした。配列、または1行1オブジェクトのJSON Lines に対応しています。',
      notArray: 'JSONのルートは配列（または配列を持つオブジェクト）にしてください。',
      copyOk: 'コピーしました', copyNg: 'コピーできませんでした。手動で選択してください。',
      sample: 'name,email,age\nAlice,alice@example.com,30\nBob,bob@example.com,25',
      sampleJson: '[\n  {"name":"Alice","email":"alice@example.com","age":30},\n  {"name":"Bob","email":"bob@example.com","age":25}\n]'
    },
    en: {
      empty: 'The CSV is empty. Paste something or choose a file.',
      parseErr: 'CSV parse error: ',
      done: 'Converted',
      rows: 'rows', cols: 'columns', size: 'size',
      jsonEmpty: 'The JSON is empty. Paste something or choose a file.',
      badJson: 'That could not be read as JSON. An array, or one object per line (JSON Lines), is expected.',
      notArray: 'The root of the JSON should be an array (or an object containing one).',
      copyOk: 'Copied', copyNg: 'Copy failed — please select the text manually.',
      sample: 'name,email,age\nAlice,alice@example.com,30\nBob,bob@example.com,25',
      sampleJson: '[\n  {"name":"Alice","email":"alice@example.com","age":30},\n  {"name":"Bob","email":"bob@example.com","age":25}\n]'
    }
  }[LANG];

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bytes(n) { return n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB'; }
  function flash(el, msg, isErr) {
    el.className = 'report' + (isErr ? ' err' : '');
    el.innerHTML = msg;
    el.classList.remove('hidden');
  }
  function hide(el) { el.classList.add('hidden'); }
  function download(name, text, mime) {
    var b = new Blob([text], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function copy(text, box) {
    var done = function () { flash(box, M.copyOk); setTimeout(function () { hide(box); }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var t = document.createElement('textarea');
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { flash(box, M.copyNg, true); }
      t.remove();
    }
  }

  /* ---------- type inference ---------- */
  function infer(v) {
    if (v === '') return '';
    var s = v.trim();
    if (s === '') return '';
    if (/^(true|false)$/i.test(s)) return s.toLowerCase() === 'true';
    if (/^(null)$/i.test(s)) return null;
    if (/^-?\d+$/.test(s)) {
      // keep leading zeros and long IDs as strings
      if (/^-?0\d/.test(s)) return v;
      if (s.replace('-', '').length > 15) return v;
      var n = Number(s);
      if (String(n) === s) return n;
    }
    if (/^-?\d*\.\d+$/.test(s) && s.replace('-', '').length <= 15) {
      var f = Number(s);
      if (String(f) === s) return f;
    }
    return v;
  }

  function assign(obj, key, val, nested) {
    if (!nested || key.indexOf('.') === -1) { obj[key] = val; return; }
    var parts = key.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var p = parts[i] || 'field' + i;
      if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = val;
  }

  /* ---------- CSV -> JSON ---------- */
  function toJson() {
    var text = $('csvIn').value;
    var rep = $('repJson'), out = $('jsonOut'), stat = $('statJson');
    hide(rep);
    if (!text.trim()) { flash(rep, M.empty, true); return; }

    var cfg = { skipEmptyLines: 'greedy' };
    var d = $('optDelim').value;
    if (d !== 'auto') cfg.delimiter = d;

    var res = Papa.parse(text, cfg);
    if (res.errors && res.errors.length && !res.data.length) {
      flash(rep, M.parseErr + esc(res.errors[0].message), true); return;
    }
    var rows = res.data.filter(function (r) { return r.length && !(r.length === 1 && r[0] === ''); });
    if (!rows.length) { flash(rep, M.empty, true); return; }

    var useHeader = $('optHeader').checked;
    var headers = useHeader ? rows.shift().map(function (h, i) { return String(h || '').trim() || ('col' + (i + 1)); })
      : rows[0].map(function (_, i) { return 'col' + (i + 1); });
    if (!useHeader) rows = rows.slice(0);

    var typed = $('optTyped').checked, nested = $('optNested').checked;
    var shape = $('optShape').value;
    var indent = parseInt($('optIndent').value, 10);

    var objs = rows.map(function (r) {
      if (shape === 'arrays') {
        return headers.map(function (_, i) { var v = r[i] == null ? '' : r[i]; return typed ? infer(v) : v; });
      }
      var o = {};
      headers.forEach(function (h, i) {
        var v = r[i] == null ? '' : r[i];
        assign(o, h, typed ? infer(v) : v, nested);
      });
      return o;
    });

    var textOut;
    if (shape === 'jsonl') {
      textOut = objs.map(function (o) { return JSON.stringify(o); }).join('\n');
    } else {
      textOut = JSON.stringify(objs, null, indent > 0 ? indent : undefined);
    }

    out.value = textOut;
    stat.innerHTML = '<span><b>' + objs.length + '</b> ' + M.rows + '</span>' +
      '<span><b>' + headers.length + '</b> ' + M.cols + '</span>' +
      '<span>' + M.size + ' <b>' + bytes(new Blob([textOut]).size) + '</b></span>';
  }

  /* ---------- JSON -> CSV ---------- */
  function parseJsonLoose(text) {
    try { return JSON.parse(text); } catch (e) { /* try JSON Lines */ }
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length > 1) {
      try { return lines.map(function (l) { return JSON.parse(l); }); } catch (e) { throw e; }
    }
    throw new Error('bad');
  }

  function flattenInto(target, prefix, val) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.keys(val).forEach(function (k) {
        flattenInto(target, prefix ? prefix + '.' + k : k, val[k]);
      });
    } else if (Array.isArray(val)) {
      target[prefix] = JSON.stringify(val);
    } else {
      target[prefix] = val == null ? '' : val;
    }
  }

  function toCsv() {
    var text = $('jsonIn').value;
    var rep = $('repCsv'), out = $('csvOut'), stat = $('statCsv');
    hide(rep);
    if (!text.trim()) { flash(rep, M.jsonEmpty, true); return; }

    var data;
    try { data = parseJsonLoose(text); } catch (e) { flash(rep, M.badJson, true); return; }

    if (data && !Array.isArray(data) && typeof data === 'object') {
      var arrKey = Object.keys(data).filter(function (k) { return Array.isArray(data[k]); })[0];
      if (arrKey) data = data[arrKey];
    }
    if (!Array.isArray(data)) { flash(rep, M.notArray, true); return; }
    if (!data.length) { flash(rep, M.jsonEmpty, true); return; }

    var flat = $('optFlatten').checked;
    var rows = data.map(function (item) {
      if (Array.isArray(item)) {
        var o = {};
        item.forEach(function (v, i) { o['col' + (i + 1)] = v; });
        return o;
      }
      if (item && typeof item === 'object') {
        if (!flat) {
          var o2 = {};
          Object.keys(item).forEach(function (k) {
            var v = item[k];
            o2[k] = (v && typeof v === 'object') ? JSON.stringify(v) : (v == null ? '' : v);
          });
          return o2;
        }
        var o3 = {};
        Object.keys(item).forEach(function (k) { flattenInto(o3, k, item[k]); });
        return o3;
      }
      return { value: item };
    });

    // union of keys, preserving first-seen order
    var fields = [], seen = {};
    rows.forEach(function (r) {
      Object.keys(r).forEach(function (k) { if (!seen[k]) { seen[k] = 1; fields.push(k); } });
    });

    var delim = $('optDelim2').value;
    var csv = Papa.unparse({
      fields: fields,
      data: rows.map(function (r) { return fields.map(function (f) { return r[f] == null ? '' : String(r[f]); }); })
    }, { delimiter: delim, newline: '\r\n' });

    if ($('optBom').checked) csv = '\uFEFF' + csv;
    out.value = csv;
    stat.innerHTML = '<span><b>' + rows.length + '</b> ' + M.rows + '</span>' +
      '<span><b>' + fields.length + '</b> ' + M.cols + '</span>' +
      '<span>' + M.size + ' <b>' + bytes(new Blob([csv]).size) + '</b></span>';
  }

  /* ---------- wiring ---------- */
  function readFile(file, cb) {
    var r = new FileReader();
    r.onload = function (e) { cb(e.target.result); };
    r.readAsText(file, 'utf-8');
  }

  function bindDrop(zone, onText) {
    if (!zone) return;
    ['dragenter', 'dragover'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.style.borderColor = ''; });
    });
    zone.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        readFile(e.dataTransfer.files[0], onText);
      }
    });
  }

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.onclick = function () {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('on'); });
      tab.classList.add('on');
      var name = tab.dataset.pane;
      $('pane-toJson').classList.toggle('hidden', name !== 'toJson');
      $('pane-toCsv').classList.toggle('hidden', name !== 'toCsv');
    };
  });

  $('btnCsvFile').onclick = function () { $('csvFile').click(); };
  $('csvFile').onchange = function (e) {
    if (e.target.files.length) readFile(e.target.files[0], function (t) { $('csvIn').value = t; toJson(); });
  };
  $('btnCsvSample').onclick = function () { $('csvIn').value = M.sample; toJson(); };
  $('btnCsvClear').onclick = function () { $('csvIn').value = ''; $('jsonOut').value = ''; hide($('repJson')); $('statJson').innerHTML = ''; };
  $('btnToJson').onclick = toJson;
  $('btnCopyJson').onclick = function () { copy($('jsonOut').value, $('repJson')); };
  $('btnDlJson').onclick = function () {
    var v = $('jsonOut').value; if (!v) { flash($('repJson'), M.empty, true); return; }
    var ext = $('optShape').value === 'jsonl' ? '.jsonl' : '.json';
    download('data' + ext, v, 'application/json');
  };

  $('btnJsonFile').onclick = function () { $('jsonFile').click(); };
  $('jsonFile').onchange = function (e) {
    if (e.target.files.length) readFile(e.target.files[0], function (t) { $('jsonIn').value = t; toCsv(); });
  };
  $('btnJsonSample').onclick = function () { $('jsonIn').value = M.sampleJson; toCsv(); };
  $('btnJsonClear').onclick = function () { $('jsonIn').value = ''; $('csvOut').value = ''; hide($('repCsv')); $('statCsv').innerHTML = ''; };
  $('btnToCsv').onclick = toCsv;
  $('btnCopyCsv').onclick = function () { copy($('csvOut').value, $('repCsv')); };
  $('btnDlCsv').onclick = function () {
    var v = $('csvOut').value; if (!v) { flash($('repCsv'), M.jsonEmpty, true); return; }
    download('data.csv', v, 'text/csv;charset=utf-8');
  };

  bindDrop($('pane-toJson'), function (t) { $('csvIn').value = t; toJson(); });
  bindDrop($('pane-toCsv'), function (t) { $('jsonIn').value = t; toCsv(); });
})();
