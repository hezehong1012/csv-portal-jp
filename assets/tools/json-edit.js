/* json-edit.js — JSON editor page: editor (tree/beautify/minify/escape),
   JSON → CSV converter and JSON diff. All client-side, no upload. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    parsed: 'Parsed OK', chars: 'chars', nodes: 'nodes shown',
    errPre: 'JSON parse error: ',
    copied: 'Copied', copyFail: 'Copy failed — select the text and copy manually.',
    notStr: 'The input is not an escaped string.',
    treeCap: 'Tree display is capped at {n} nodes for this size.',
    rows: 'Rows', cols: 'Columns', bytes: 'Size',
    dlName: 'data.csv', jsonName: 'data.json',
    noDiff: 'No differences — the data is identical.',
    diffCount: 'differences', diffsCopied: 'Diff copied',
    added: 'added', removed: 'removed', changed: 'changed',
    both: '→', none: '(none)',
    errA: 'JSON A: ', errB: 'JSON B: '
  } : {
    parsed: 'JSON を正しく解析しました', chars: '文字', nodes: 'ノードを表示',
    errPre: 'JSON の解析エラー: ',
    copied: 'コピーしました', copyFail: 'コピーに失敗しました。テキストを選択して手動でコピーしてください。',
    notStr: '入力がエスケープされた文字列ではありません。',
    treeCap: 'サイズが大きいため、ツリーは先頭 {n} ノードまでの表示に制限しています。',
    rows: '行数', cols: '列数', bytes: 'サイズ',
    dlName: 'data.csv', jsonName: 'data.json',
    noDiff: '差分はありません（同一のデータです）。',
    diffCount: '件の差分', diffsCopied: '差分をコピーしました',
    added: '追加', removed: '削除', changed: '変更',
    both: '→', none: '(なし)',
    errA: 'JSON A: ', errB: 'JSON B: '
  };

  function $(id) { return document.getElementById(id); }
  function show(id, on) { var el = $(id); if (el) el.classList[on ? 'remove' : 'add']('hidden'); }
  function rep(id, msg, ok) {
    var el = $(id);
    if (!el) return;
    if (!msg) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.classList.remove('hidden');
    el.classList[ok ? 'remove' : 'add']('err');
    el.innerHTML = '<div>' + msg + '</div>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function copyText(text, cb) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      cb(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { cb(true); }, function () { fallback(); });
    } else fallback();
  }
  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'je-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('on'); }, 10);
    setTimeout(function () { el.classList.remove('on'); setTimeout(function () { el.remove(); }, 300); }, 1800);
  }

  /* ---------------- tabs ---------------- */
  var tabs = [].slice.call(document.querySelectorAll('#tool .tab'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      ['edit', 'tocsv', 'diff'].forEach(function (p) {
        show('pane-' + p, t.getAttribute('data-pane') === p);
      });
    });
  });

  /* ---------------- file loading ---------------- */
  function readFile(input, cb) {
    var f = input.files && input.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { cb(String(r.result)); };
    r.readAsText(f, 'UTF-8');
  }
  function wireFile(btnId, inputId, taId) {
    var btn = $(btnId), input = $(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      readFile(input, function (txt) { $(taId).value = txt; input.value = ''; });
    });
  }

  /* ---------------- editor tab ---------------- */
  var jeIn = $('jeIn');
  wireFile('jeFile', 'jeF', 'jeIn');
  $('jeSample').addEventListener('click', function () {
    jeIn.value = JSON.stringify({
      shop: 'Acme Store', since: '2020-04-01', online: true,
      staff: [{ id: 1, name: '田中 健', role: 'manager', sales: 1200 },
              { id: 2, name: '佐藤 実', role: 'staff', sales: 320 }],
      address: { city: 'Tokyo', zip: '100-0001' },
      note: '主力商品はコーヒー豆'
    }, null, 2);
    rep('jeRep');
  });
  $('jeClear').addEventListener('click', function () {
    jeIn.value = ''; $('jeOut').value = '';
    rep('jeRep');
    $('jeTreeBox').innerHTML = '<span class="drophint">' +
      (EN ? 'Press “Parse & show tree” to render the structure here'
          : '「解析してツリー表示」を押すとここに構造が表示されます') + '</span>';
  });

  function parseInput(src) {
    try { return { ok: true, val: JSON.parse(src) }; }
    catch (e) { return { ok: false, msg: e.message }; }
  }
  function parseJSONL(src) {
    var lines = src.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return { ok: false, msg: 'empty' };
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      try { out.push(JSON.parse(lines[i])); }
      catch (e) { return { ok: false, msg: 'line ' + (i + 1) + ': ' + e.message }; }
    }
    return { ok: true, val: out };
  }

  function showErr(msg) { rep('jeRep', esc(T.errPre + msg)); }
  function outText(s, label) {
    $('jeOut').value = s;
    rep('jeRep', esc(label + ' · ' + s.length + ' ' + T.chars), true);
  }

  $('jeTree').addEventListener('click', function () {
    var r = parseInput(jeIn.value);
    if (!r.ok) r = parseJSONL(jeIn.value);
    if (!r.ok) return showErr(r.msg);
    rep('jeRep');
    var cap = 2000, count = 0;
    var box = $('jeTreeBox');
    box.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'jt-root';
    box.appendChild(root);
    render(root, r.val, '', true);
    if (count > cap) {
      var note = document.createElement('div');
      note.className = 'jt-cap';
      note.textContent = T.treeCap.replace('{n}', cap);
      box.appendChild(note);
    }
    function render(host, val, key, open) {
      if (count >= cap) return;
      count++;
      var isObj = val && typeof val === 'object';
      var row = document.createElement('div');
      row.className = 'jt-row';
      var tog = document.createElement('span');
      tog.className = 'jt-tog';
      var khtml = key !== '' ? '<span class="jt-k">' + esc(key) + '</span><span class="jt-c">: </span>' : '';
      if (isObj) {
        var entries = Array.isArray(val)
          ? val.map(function (v, i) { return [String(i), v]; })
          : Object.keys(val).map(function (k) { return [k, val[k]]; });
        tog.textContent = open ? '−' : '+';
        row.innerHTML = khtml + '<span class="jt-b">' + (Array.isArray(val) ? '[' : '{') + '</span>';
        var kids = document.createElement('div');
        kids.className = 'jt-n' + (open ? '' : ' hidden');
        entries.forEach(function (e) { render(kids, e[1], e[0], false); });
        var close = document.createElement('div');
        close.className = 'jt-b';
        close.textContent = Array.isArray(val) ? ']' : '}';
        kids.appendChild(close);
        tog.addEventListener('click', function () {
          var hidden = kids.classList.toggle('hidden');
          tog.textContent = hidden ? '+' : '−';
        });
        host.appendChild(row); host.appendChild(kids);
      } else {
        tog.textContent = '·';
        row.innerHTML = khtml + '<span class="' + vcls(val) + '">' + esc(vstr(val)) + '</span>';
        host.appendChild(row);
      }
      function vcls(v) {
        if (v === null) return 'jt-v-null';
        switch (typeof v) {
          case 'string': return 'jt-v-s';
          case 'number': return 'jt-v-n';
          case 'boolean': return 'jt-v-b';
          default: return 'jt-v-s';
        }
      }
      function vstr(v) {
        if (v === null) return 'null';
        if (v === undefined) return 'undefined';
        if (typeof v === 'string') return '"' + v + '"';
        return String(v);
      }
    }
  });
  $('jeExpand').addEventListener('click', function () {
    [].slice.call(document.querySelectorAll('#jeTreeBox .jt-n')).forEach(function (n) {
      n.classList.remove('hidden');
    });
    [].slice.call(document.querySelectorAll('#jeTreeBox .jt-tog')).forEach(function (t) {
      if (t.textContent !== '·') t.textContent = '−';
    });
  });
  $('jeCollapse').addEventListener('click', function () {
    [].slice.call(document.querySelectorAll('#jeTreeBox .jt-n')).forEach(function (n, i) {
      if (i === 0 && n.className.indexOf('jt-root') < 0) return; // keep root visible
      n.classList.add('hidden');
    });
    [].slice.call(document.querySelectorAll('#jeTreeBox .jt-tog')).forEach(function (t) {
      if (t.textContent !== '·') t.textContent = '+';
    });
  });
  $('jePretty').addEventListener('click', function () {
    var r = parseInput(jeIn.value);
    if (!r.ok) return showErr(r.msg);
    outText(JSON.stringify(r.val, null, 2), T.parsed);
  });
  $('jeMin').addEventListener('click', function () {
    var r = parseInput(jeIn.value);
    if (!r.ok) return showErr(r.msg);
    outText(JSON.stringify(r.val), T.parsed);
  });
  $('jeEsc').addEventListener('click', function () {
    outText(JSON.stringify(jeIn.value), T.parsed);
  });
  $('jeUnesc').addEventListener('click', function () {
    var s = jeIn.value.trim();
    try {
      var v = JSON.parse(s);
      if (typeof v !== 'string') return showErr('not a string');
      outText(v, T.parsed);
    } catch (e) {
      // tolerate unquoted escaped text
      var un = s.replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
                .replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
      outText(un, T.parsed);
    }
  });
  $('jeUni').addEventListener('click', function () {
    var s = jeIn.value;
    if (/\\u[0-9a-fA-F]{4}/.test(s)) {
      outText(s.replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); }), T.parsed);
    } else {
      outText(s.replace(/[^\x00-\x7F]/g, function (c) {
        var h = c.charCodeAt(0).toString(16);
        return '\\u' + ('0000' + h).slice(-4);
      }), T.parsed);
    }
  });
  $('jeCopy').addEventListener('click', function () {
    var txt = $('jeOut').value || jeIn.value;
    if (!txt) return;
    copyText(txt, function (ok) { toast(ok ? T.copied : T.copyFail); });
  });

  /* ---------------- JSON → CSV tab ---------------- */
  var jcIn = $('jcIn');
  wireFile('jcFile', 'jcF', 'jcIn');
  $('jcSample').addEventListener('click', function () {
    jcIn.value = JSON.stringify([
      { id: 1, name: '田中 健', email: 'tanaka@example.com', address: { city: 'Tokyo', zip: '100-0001' }, sales: 1200 },
      { id: 2, name: '佐藤 実', email: 'sato@example.com', address: { city: 'Osaka', zip: '530-0001' }, sales: 320 },
      { id: 3, name: '鈴木 彩', email: 'suzuki@example.com', address: { city: 'Nagoya', zip: '460-0001' }, sales: 980 }
    ], null, 2);
    rep('jcRep');
  });
  $('jcClear').addEventListener('click', function () {
    jcIn.value = ''; $('jcOut').value = '';
    rep('jcRep');
    $('jcStat').innerHTML = '<span>' + (EN ? 'Not converted yet' : 'まだ変換していません') + '</span>';
  });

  function cell(v, delim) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') v = JSON.stringify(v);
    v = String(v);
    return /["\n\r]/.test(v) || v.indexOf(delim) >= 0 ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function flat(v, flatOn) {
    // returns array of [path, scalar] pairs
    if (!flatOn || !v || typeof v !== 'object' || Array.isArray(v)) return [['', v]];
    var out = [];
    Object.keys(v).forEach(function (k) {
      var val = v[k];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        flat(val, true).forEach(function (p) {
          out.push([k + (p[0] ? '.' + p[0] : ''), p[1]]);
        });
      } else out.push([k, val]);
    });
    return out.length ? out : [['', undefined]];
  }
  $('jcRun').addEventListener('click', function () {
    var src = jcIn.value;
    if (!src.trim()) return rep('jcRep', esc(T.errPre + (EN ? 'input is empty.' : '入力が空です。')));
    var r = parseInput(src);
    if (!r.ok) r = parseJSONL(src);
    if (!r.ok) return rep('jcRep', esc(T.errPre + r.msg));
    var data = r.val;
    var single = !Array.isArray(data);
    var rows = single ? [data] : data;
    if (!rows.length) return rep('jcRep', esc(T.errPre + (EN ? 'the array is empty.' : '配列が空です。')));
    var flatOn = $('jcFlat').checked;
    // normalize each row to a map of path→value
    var recs = rows.map(function (row) {
      if (row === null || typeof row !== 'object') return { '': row };
      if (Array.isArray(row)) {
        var m = {};
        row.forEach(function (v, i) { m[String(i)] = v; });
        return m;
      }
      var map = {};
      flat(row, flatOn).forEach(function (p) { map[p[0]] = p[1]; });
      return map;
    });
    var headers = [];
    var seen = {};
    recs.forEach(function (m) {
      Object.keys(m).forEach(function (k) {
        if (!seen[k]) { seen[k] = 1; headers.push(k); }
      });
    });
    var delim = $('jcDelim').value;
    var lines = [];
    if ($('jcHead').checked) lines.push(headers.map(function (h) { return cell(h, delim); }).join(delim));
    recs.forEach(function (m) {
      lines.push(headers.map(function (h) { return cell(m[h], delim); }).join(delim));
    });
    var csv = lines.join('\r\n');
    if ($('jcBom').checked) csv = '\uFEFF' + csv;
    $('jcOut').value = csv;
    var nbytes = new Blob([csv]).size;
    $('jcStat').innerHTML =
      '<span>' + T.rows + ' <b>' + recs.length + '</b></span>' +
      '<span>' + T.cols + ' <b>' + headers.length + '</b></span>' +
      '<span>' + T.bytes + ' <b>' + nbytes.toLocaleString() + '</b></span>';
    rep('jcRep');
  });
  $('jcCopy').addEventListener('click', function () {
    var txt = $('jcOut').value;
    if (!txt) return;
    copyText(txt, function (ok) { toast(ok ? T.copied : T.copyFail); });
  });
  $('jcDl').addEventListener('click', function () {
    var csv = $('jcOut').value;
    if (!csv) return;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = T.dlName;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });

  /* ---------------- diff tab ---------------- */
  var jdText = [];
  function leafs(v, path, out) {
    if (v === null || typeof v !== 'object') { out[path || ''] = v; return; }
    if (Array.isArray(v)) {
      v.forEach(function (x, i) { leafs(x, path ? path + '.' + i : String(i), out); });
      if (!v.length) out[path] = [];
    } else {
      var ks = Object.keys(v);
      if (!ks.length) out[path] = {};
      ks.forEach(function (k) { leafs(v[k], path ? path + '.' + k : k, out); });
    }
  }
  $('jdSample').addEventListener('click', function () {
    var a = { shop: 'Acme Store', staff: [{ id: 1, name: '田中 健', sales: 1200 }, { id: 2, name: '佐藤 実', sales: 320 }], online: true, zip: '100-0001' };
    var b = { shop: 'Acme Store', staff: [{ id: 1, name: '田中 健', sales: 1500 }, { id: 3, name: '鈴木 彩', sales: 980 }], online: true };
    $('jdA').value = JSON.stringify(a, null, 2);
    $('jdB').value = JSON.stringify(b, null, 2);
  });
  $('jdRun').addEventListener('click', function () {
    var ra = parseInput($('jdA').value), rb = parseInput($('jdB').value);
    if (!ra.ok) return rep('jdRep', esc(T.errA + ra.msg));
    if (!rb.ok) return rep('jdRep', esc(T.errB + rb.msg));
    rep('jdRep');
    var la = {}, lb = {}, out = [];
    leafs(ra.val, '', la); leafs(rb.val, '', lb);
    var paths = [];
    var all = {};
    Object.keys(la).forEach(function (k) { all[k] = 1; });
    Object.keys(lb).forEach(function (k) { all[k] = 1; });
    Object.keys(all).forEach(function (k) { paths.push(k); });
    paths.sort(function (x, y) {
      var nx = x.split('.').length, ny = y.split('.').length;
      return nx - ny || (x < y ? -1 : x > y ? 1 : 0);
    });
    paths.forEach(function (p) {
      var inA = Object.prototype.hasOwnProperty.call(la, p);
      var inB = Object.prototype.hasOwnProperty.call(lb, p);
      if (inA && !inB) out.push({ type: 'del', path: p, a: la[p] });
      else if (!inA && inB) out.push({ type: 'add', path: p, b: lb[p] });
      else if (JSON.stringify(la[p]) !== JSON.stringify(lb[p])) {
        out.push({ type: 'chg', path: p, a: la[p], b: lb[p] });
      }
    });
    jdText = out;
    var box = $('jdOut');
    box.classList.remove('hidden');
    if (!out.length) {
      box.innerHTML = '<div class="report">' + esc(T.noDiff) + '</div>';
      $('jdStat').innerHTML = '<span><b>0</b> ' + T.diffCount + '</span>';
      return;
    }
    var cnt = { add: 0, del: 0, chg: 0 };
    var html = '<div class="jd-list">';
    out.forEach(function (d) {
      cnt[d.type]++;
      var badge = d.type === 'add' ? T.added : d.type === 'del' ? T.removed : T.changed;
      var body;
      if (d.type === 'add') body = esc(fmt(d.b));
      else if (d.type === 'del') body = esc(fmt(d.a));
      else body = esc(fmt(d.a)) + ' <b class="jt-c">' + T.both + '</b> ' + esc(fmt(d.b));
      html += '<div class="jd-item"><span class="jd-b jd-' + d.type + '">' + esc(badge) + '</span>' +
        '<span class="jd-path">' + esc(d.path || '(root)') + '</span><span class="jd-val">' + body + '</span></div>';
    });
    html += '</div>';
    box.innerHTML = html;
    $('jdStat').innerHTML =
      '<span>' + T.added + ' <b>' + cnt.add + '</b></span>' +
      '<span>' + T.removed + ' <b>' + cnt.del + '</b></span>' +
      '<span>' + T.changed + ' <b>' + cnt.chg + '</b></span>';
    function fmt(v) {
      if (v === undefined || v === null) return T.none;
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    }
  });
  $('jdTxt').addEventListener('click', function () {
    if (!jdText.length) return;
    var txt = jdText.map(function (d) {
      var kind = d.type === 'add' ? T.added : d.type === 'del' ? T.removed : T.changed;
      if (d.type === 'add') return kind + '\t' + d.path + '\t' + fmt(d.b);
      if (d.type === 'del') return kind + '\t' + d.path + '\t' + fmt(d.a);
      return kind + '\t' + d.path + '\t' + fmt(d.a) + ' → ' + fmt(d.b);
      function fmt(v) { return v === undefined || v === null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v)); }
    }).join('\n');
    copyText(txt, function (ok) { toast(ok ? T.diffsCopied : T.copyFail); });
  });
})();
