/* diff.js — 2 つの CSV の差分比較 */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    one: 'Choose exactly two CSV files (first = before, second = after).',
    nothing: 'Nothing to compare.',
    same: 'No differences. The two files are identical.',
    added: 'Added',
    removed: 'Removed',
    changed: 'Changed',
    key: 'Key column',
    dlAll: 'Download the diff as CSV',
    note: 'Duplicate keys keep the first occurrence.'
  } : {
    one: 'CSV を 2 つ選択してください（1 つ目＝変更前、2 つ目＝変更後）。',
    nothing: '比較する内容がありません。',
    same: '差分はありません。2 つのファイルは同一です。',
    added: '追加',
    removed: '削除',
    changed: '変更',
    key: 'キー列',
    dlAll: '差分を CSV でダウンロード',
    note: 'キーが重複する行は最初の 1 行のみ比較します。'
  };

  function fillKeys(head) {
    var sel = document.getElementById('keyCol');
    if (!sel || !head) return;
    sel.innerHTML = head.map(function (h, i) {
      return '<option value="' + i + '">' + CSVX.esc(h === '' ? '(空)' : h) + (i === 0 ? '' : '') + '</option>';
    }).join('');
  }

  CSVX.init({
    multi: true,
    maxFiles: 2,
    noFileMsg: T.one,
    emptyMsg: T.nothing,
    errMsg: EN ? 'Comparison failed: ' : '比較に失敗しました: ',
    afterLoad: function (files) {
      if (files[0]) fillKeys(CSVX.parse(files[0].text).rows[0] || []);
    },
    run: function (ctx) {
      var files = ctx.files || [];
      if (files.length < 2) return { ok: false, msg: T.one };

      var a = CSVX.parse(files[0].text), b = CSVX.parse(files[1].text);
      if (a.rows.length < 2 && b.rows.length < 2) return { ok: false, msg: T.nothing };

      var headA = a.rows[0] || [], headB = b.rows[0] || [];
      var keyIdx = parseInt(document.getElementById('keyCol').value, 10) || 0;
      var keyName = headA[keyIdx] || headA[0] || '';

      /* 列名の和集合で比較（列順の違いを吸収） */
      var cols = [], seen = {};
      [headA, headB].forEach(function (h) {
        h.forEach(function (c) { if (!seen[c]) { seen[c] = 1; cols.push(c); } });
      });

      function index(rows, head) {
        var map = {}, order = [];
        var pos = {};
        head.forEach(function (h, i) { pos[h] = i; });
        rows.slice(1).forEach(function (r) {
          var k = pos[keyName] === undefined ? r[0] : r[pos[keyName]];
          k = k == null ? '' : String(k);
          if (map[k] === undefined) { map[k] = r; order.push(k); }
        });
        return { map: map, order: order, pos: pos };
      }

      var ia = index(a.rows, headA), ib = index(b.rows, headB);
      var added = [], removed = [], changed = [];

      ib.order.forEach(function (k) {
        if (ia.map[k] === undefined) added.push(ib.map[k]);
      });
      ia.order.forEach(function (k) {
        if (ib.map[k] === undefined) { removed.push(ia.map[k]); return; }
        var ra = ia.map[k], rb = ib.map[k], diffs = [];
        cols.forEach(function (c) {
          var va = ra[ia.pos[c]] === undefined ? '' : String(ra[ia.pos[c]]);
          var vb = rb[ib.pos[c]] === undefined ? '' : String(rb[ib.pos[c]]);
          if (va !== vb) diffs.push({ col: c, from: va, to: vb });
        });
        if (diffs.length) changed.push({ key: k, row: rb, diffs: diffs });
      });

      var tables = [];
      if (added.length) tables.push({ title: T.added + ' (' + added.length + ')', head: headB, rows: added, max: 30 });
      if (removed.length) tables.push({ title: T.removed + ' (' + removed.length + ')', head: headA, rows: removed, max: 30 });
      if (changed.length) tables.push({
        title: T.changed + ' (' + changed.length + ')',
        head: [keyName].concat(['列', '変更前', '変更後']),
        rows: changed.slice(0, 30).map(function (c) {
          return [c.key, c.diffs.map(function (d) { return d.col; }).join(' / '),
            c.diffs.map(function (d) { return d.from; }).join(' / '),
            c.diffs.map(function (d) { return d.to; }).join(' / ')];
        }),
        max: 30
      });

      var out = [[ 'type', keyName, 'column', 'before', 'after' ]];
      added.forEach(function (r) { out.push(['added', r[ib.pos[keyName]] === undefined ? r[0] : r[ib.pos[keyName]], '', '', '']); });
      removed.forEach(function (r) { out.push(['removed', r[ia.pos[keyName]] === undefined ? r[0] : r[ia.pos[keyName]], '', '', '']); });
      changed.forEach(function (c) {
        c.diffs.forEach(function (d) { out.push(['changed', c.key, d.col, d.from, d.to]); });
      });

      var notice = changed.length ? [] : [];
      if (!added.length && !removed.length && !changed.length) notice.push(T.same);
      if (a.rows.length > 1 && b.rows.length > 1) notice.push(T.note);

      return {
        ok: true,
        notice: notice,
        summary: [
          T.added + ' <b>' + added.length + '</b>',
          T.removed + ' <b>' + removed.length + '</b>',
          T.changed + ' <b>' + changed.length + '</b>',
          '<span style="color:var(--ink-3)">' + T.key + ': ' + CSVX.esc(keyName) + '</span>'
        ],
        download: { name: 'diff.csv', text: CSVX.toCSV(out, { delim: ',' }) },
        downloadLabel: T.dlAll,
        tables: tables
      };
    }
  });
})();
