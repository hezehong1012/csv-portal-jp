/* core.js — shared CSV engine for csv.format-portal.com tool pages.
   No framework. Requires PapaParse (assets/vendor/papaparse.min.js). */
(function () {
  var X = {};

  X.el = function (id) { return document.getElementById(id); };
  X.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* ---------- parsing ---------- */

  X.detectDelim = function (text) {
    var head = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).slice(0, 6).join('\n');
    if (!head) return ',';
    var cands = [',', '\t', ';', '|'];
    var best = ',', bestScore = -1;
    cands.forEach(function (d) {
      var rows = Papa.parse(head, { delimiter: d }).data.filter(function (r) { return r.length > 1; });
      if (!rows.length) return;
      var counts = rows.map(function (r) { return r.length; });
      var avg = counts.reduce(function (a, b) { return a + b; }, 0) / counts.length;
      var same = counts.every(function (c) { return c === counts[0]; });
      var score = (same ? 100 : 0) + avg;
      if (score > bestScore) { bestScore = score; best = d; }
    });
    return best;
  };

  X.decode = function (buf) {
    var b = new Uint8Array(buf);
    if (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) return { text: new TextDecoder('utf-8').decode(b).replace(/^\uFEFF/, ''), enc: 'UTF-8 (BOM)' };
    if (b[0] === 0xFF && b[1] === 0xFE) return { text: new TextDecoder('utf-16le').decode(b), enc: 'UTF-16 LE' };
    try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(b), enc: 'UTF-8' }; } catch (e) {}
    try { return { text: new TextDecoder('shift_jis', { fatal: true }).decode(b), enc: 'Shift_JIS' }; } catch (e) {}
    try { return { text: new TextDecoder('euc-jp').decode(b), enc: 'EUC-JP' }; } catch (e) {}
    return { text: new TextDecoder('utf-8').decode(b), enc: 'UTF-8 (推測)' };
  };

  X.readFile = function (file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () {
        var d = X.decode(r.result);
        d.buf = r.result;
        d.name = file.name; d.size = file.size;
        res(d);
      };
      r.onerror = rej;
      r.readAsArrayBuffer(file);
    });
  };

  X.parse = function (text, delim) {
    var clean = String(text == null ? '' : text).replace(/^\uFEFF/, '');
    var d = (!delim || delim === 'auto') ? X.detectDelim(clean) : delim;
    var res = Papa.parse(clean, { delimiter: d, skipEmptyLines: 'greedy' });
    return { rows: res.data, delim: d, errors: res.errors || [] };
  };

  /* ---------- writing ---------- */

  X.quoteCell = function (v, delim) {
    var s = (v == null ? '' : String(v));
    if (s.indexOf('"') >= 0 || s.indexOf(delim) >= 0 || /[\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  X.toCSV = function (rows, o) {
    o = o || {};
    var d = o.delim || ',';
    var nl = o.newline === 'LF' ? '\n' : (o.newline === 'CR' ? '\r' : '\r\n');
    return rows.map(function (r) {
      return r.map(function (c) { return X.quoteCell(c, d); }).join(d);
    }).join(nl) + nl;
  };

  X.download = function (name, text, withBom) {
    var parts = withBom ? ['\uFEFF', text] : [text];
    var blob = new Blob(parts, { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1200);
  };

  /* ---------- format helpers ---------- */

  X.num = function (n) { return Number(n).toLocaleString('ja-JP'); };
  X.bytes = function (n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  };

  /* ---------- rendering ---------- */

  X.table = function (head, rows, maxRows, highlight) {
    maxRows = maxRows || 100;
    var frag = document.createDocumentFragment();
    var wrap = document.createElement('div');
    wrap.className = 'tablewrap';
    var t = document.createElement('table');
    t.className = 'grid';
    if (head && head.length) {
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      var th0 = document.createElement('th');
      th0.textContent = '#';
      th0.className = 'idx';
      tr.appendChild(th0);
      head.forEach(function (h) {
        var th = document.createElement('th');
        th.textContent = h === '' ? '(空)' : h;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      t.appendChild(thead);
    }
    var tb = document.createElement('tbody');
    rows.slice(0, maxRows).forEach(function (r, i) {
      var tr2 = document.createElement('tr');
      var td0 = document.createElement('td');
      td0.className = 'idx';
      td0.textContent = i + 1;
      tr2.appendChild(td0);
      r.forEach(function (c) {
        var td = document.createElement('td');
        td.textContent = c;
        tr2.appendChild(td);
      });
      tb.appendChild(tr2);
    });
    t.appendChild(tb);
    wrap.appendChild(t);
    frag.appendChild(wrap);
    return wrap;
  };

  X.report = function (msgs, type) {
    var box = X.el('report');
    if (!box) return;
    if (!msgs || !msgs.length) { box.className = 'report hidden'; box.innerHTML = ''; return; }
    box.className = 'report' + (type === 'warn' ? ' warn' : type === 'err' ? ' err' : '');
    box.innerHTML = msgs.length === 1 ? msgs[0] : '<ul><li>' + msgs.map(X.esc).join('</li><li>') + '</li></ul>';
    box.classList.remove('hidden');
  };

  X.clearOut = function () {
    var out = X.el('out');
    if (out) { out.innerHTML = ''; out.classList.add('hidden'); }
  };

  /* ---------- column pickers ---------- */

  X.fillChecks = function (box, head, keepChecked) {
    if (!box || !head) return;
    var on = {};
    Array.prototype.forEach.call(box.querySelectorAll('input:checked'), function (i) { on[i.value] = 1; });
    box.innerHTML = head.map(function (h, i) {
      var ck = keepChecked && on[i] ? ' checked' : '';
      return '<label class="chk"><input type="checkbox" value="' + i + '"' + ck + '> ' +
        (h === '' ? '(空)' : X.esc(h)) + '</label>';
    }).join('');
  };

  X.pickChecks = function (box, head, fallbackAll) {
    var idx = [];
    if (box) Array.prototype.forEach.call(box.querySelectorAll('input:checked'), function (i) { idx.push(+i.value); });
    if (!idx.length && fallbackAll) for (var i = 0; i < head.length; i++) idx.push(i);
    return idx;
  };

  X.fillSelect = function (sel, head, allLabel) {
    if (!sel || !head) return;
    var prev = sel.value;
    var html = allLabel ? '<option value="all">' + X.esc(allLabel) + '</option>' : '';
    html += head.map(function (h, i) {
      return '<option value="' + i + '">' + (h === '' ? '(空)' : X.esc(h)) + '</option>';
    }).join('');
    sel.innerHTML = html;
    if (prev !== '' && /^(\d+|all)$/.test(prev)) sel.value = prev;
  };

  /* cb(head) whenever a file is loaded or the paste box changes */
  X.columns = function (cb) {
    var paste = X.el('paste'), input = X.el('file'), n = null;
    if (paste) paste.addEventListener('input', function () {
      clearTimeout(n);
      n = setTimeout(function () {
        try { cb(X.parse(paste.value).rows[0] || []); } catch (e) {}
      }, 300);
    });
    if (input) input.addEventListener('change', function () {
      if (!input.files || !input.files[0]) return;
      X.readFile(input.files[0]).then(function (f) {
        try { cb(X.parse(f.text).rows[0] || []); } catch (e) {}
      });
    });
  };

  /* ---------- shell ---------- */

  function tabSwitch(which) {
    var f = X.el('paneFile'), p = X.el('panePaste');
    if (!f || !p) return;
    var isFile = which === 'file';
    f.classList.toggle('hidden', !isFile);
    p.classList.toggle('hidden', isFile);
    var tb = X.el('tabFile'), tp = X.el('tabPaste');
    if (tb) tb.classList.toggle('on', isFile);
    if (tp) tp.classList.toggle('on', !isFile);
  }

  X.init = function (opts) {
    opts = opts || {};
    var multi = !!opts.multi;
    var files = [];
    var parsed = null;

    var drop = X.el('drop'), input = X.el('file'), runBtn = X.el('run'), sampleBtn = X.el('sample'), paste = X.el('paste');

    if (X.el('tabFile')) X.el('tabFile').onclick = function () { tabSwitch('file'); };
    if (X.el('tabPaste')) X.el('tabPaste').onclick = function () { tabSwitch('paste'); };

    function info(txt) { var n = X.el('fileinfo'); if (n) n.textContent = txt || ''; }

    function ingest(list) {
      var arr = Array.prototype.slice.call(list || []);
      if (!arr.length) return;
      if (!multi) arr = arr.slice(0, 1);
      if (opts.maxFiles) arr = arr.slice(0, opts.maxFiles);
      Promise.all(arr.map(X.readFile)).then(function (loaded) {
        files = loaded;
        info(loaded.map(function (f) { return f.name + ' · ' + X.bytes(f.size) + ' · ' + f.enc; }).join(' / '));
        parsed = null;
        X.clearOut();
        X.report(opts.loadedMsg ? [opts.loadedMsg] : []);
        if (opts.afterLoad) opts.afterLoad(loaded);
      });
    }

    if (drop && input) {
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
      });
      drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) ingest(e.dataTransfer.files); });
      drop.addEventListener('click', function () { input.click(); });
      input.addEventListener('change', function () { ingest(input.files); });
    }

    if (sampleBtn && opts.sample && paste) {
      sampleBtn.onclick = function () {
        tabSwitch('paste');
        paste.value = opts.sample;
        try { paste.dispatchEvent(new Event('input')); } catch (e) {}
        files = [];
        parsed = null;
        info('');
        X.clearOut();
        X.report([]);
      };
    }

    if (!runBtn) return;
    runBtn.onclick = function () {
      var text = '', source = '';
      var pastePane = X.el('panePaste');
      if (pastePane && !pastePane.classList.contains('hidden')) {
        text = paste ? paste.value : '';
        source = 'paste';
      } else {
        if (!files.length) { X.report([opts.noFileMsg || 'CSV を選択してください。'], 'warn'); return; }
        text = files[0].text;
        source = 'file';
      }
      if (!text.trim()) { X.report([opts.emptyMsg || 'CSV が空です。'], 'warn'); return; }

      var p = X.parse(text, opts.delim || 'auto');
      var ctx = { text: text, files: files, source: source, rows: p.rows, delim: p.delim, head: p.rows[0] || [] };
      if (opts.afterParse) opts.afterParse(ctx);

      var out;
      try { out = opts.run(ctx); }
      catch (e) { X.report([(opts.errMsg || '処理に失敗しました: ') + (e && e.message || e)], 'err'); return; }
      if (!out || out.ok === false) { X.report([(out && out.msg) || opts.errMsg || '処理できませんでした。'], 'warn'); return; }

      X.report(out.notice || []);
      X.clearOut();
      var box = X.el('out');
      box.classList.remove('hidden');

      if (out.summary && out.summary.length) {
        var st = document.createElement('div');
        st.className = 'stat';
        st.innerHTML = out.summary.map(function (s) { return '<span>' + s + '</span>'; }).join('');
        box.appendChild(st);
      }

      var acts = document.createElement('div');
      acts.className = 'btnrow';
      box.appendChild(acts);

      if (out.files && out.files.length) {
        out.files.forEach(function (f) {
          var b = document.createElement('button');
          b.className = 'btn btn-sm';
          b.textContent = f.label || f.name;
          b.onclick = function () { X.download(f.name, f.text, !!f.bom); };
          acts.appendChild(b);
        });
      } else if (out.download) {
        var b2 = document.createElement('button');
        b2.className = 'btn btn-primary';
        b2.textContent = out.downloadLabel || 'CSV をダウンロード';
        b2.onclick = function () { X.download(out.download.name, out.download.text, !!out.download.bom); };
        acts.appendChild(b2);
        (out.extraDownloads || []).forEach(function (x) {
          var b3 = document.createElement('button');
          b3.className = 'btn btn-sm';
          b3.textContent = x.label || x.name;
          b3.onclick = function () { X.download(x.name, x.text, !!x.bom); };
          acts.appendChild(b3);
        });
      }

      if (out.tables) {
        out.tables.forEach(function (t2) {
          if (t2.title) {
            var h = document.createElement('div');
            h.style.cssText = 'font-size:13px;font-weight:700;margin:16px 0 0';
            h.textContent = t2.title;
            box.appendChild(h);
          }
          box.appendChild(X.table(t2.head, t2.rows, t2.max || 50));
        });
      } else if (out.rows) {
        box.appendChild(X.table(out.head || null, out.rows, out.maxRows || 100));
      }
    };
  };

  window.CSVX = X;
})();
