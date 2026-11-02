/* dedup.js — 重複行の削除 / 抽出 */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.',
    nothing: 'Nothing to process.',
    none: 'No duplicate rows found.',
    all: 'All rows are duplicates of each other.',
    sumIn: 'Input rows',
    sumOut: 'Output rows',
    sumCut: 'Removed',
    dl: 'Download CSV',
    dlCut: 'Download removed rows',
    head: 'Columns to compare (all when nothing is selected)'
  } : {
    need: '先に CSV を選択してください。',
    nothing: '処理する内容がありません。',
    none: '重複行は見つかりませんでした。',
    all: 'すべての行が同一です。',
    sumIn: '入力行数',
    sumOut: '出力行数',
    sumCut: '削除行数',
    dl: 'CSV をダウンロード',
    dlCut: '削除した行をダウンロード',
    head: '比較する列（未選択ならすべての列）'
  };

  var lastRows = null;

  function colBox(rows) {
    var box = document.getElementById('colbox');
    if (!box || !rows || !rows.length) return;
    var head = rows[0];
    var checked = {};
    Array.prototype.forEach.call(box.querySelectorAll('input:checked'), function (i) { checked[i.value] = 1; });
    box.innerHTML = head.map(function (h, i) {
      return '<label class="chk"><input type="checkbox" value="' + i + '"' + (checked[i] ? ' checked' : '') + '> ' +
        (h === '' ? '(空)' : CSVX.esc(h)) + '</label>';
    }).join('');
  }

  function pickCols(head) {
    var box = document.getElementById('colbox');
    var idx = [];
    if (box) Array.prototype.forEach.call(box.querySelectorAll('input:checked'), function (i) { idx.push(+i.value); });
    if (!idx.length) for (var i = 0; i < head.length; i++) idx.push(i);
    return idx;
  }

  var cfg = {
    sample: '氏名,メール,会社,電話\n田中 健,tanaka@a.co.jp,A商事,03-1234-0001\n佐藤 実,sato@b.co.jp,B工業,06-9876-0002\n田中 健,tanaka@a.co.jp,A商事,03-1234-0001\n鈴木 彩,suzuki@c.co.jp,C物産,03-5555-0003\n佐藤 実,sato@b.co.jp,B工業,06-9876-0002\n高橋 直,takahashi@d.co.jp,D電機,052-111-0004',
    noFileMsg: T.need,
    emptyMsg: T.nothing,
    errMsg: EN ? 'Processing failed: ' : '処理に失敗しました: ',
    afterLoad: function (files) {
      if (files[0]) colBox(CSVX.parse(files[0].text).rows);
    },
    run: function (ctx) {
      var rows = ctx.rows;
      if (rows.length < 2) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);

      var keepLast = document.getElementById('keepMode').value === 'last';
      var ignoreCase = document.getElementById('ignoreCase').checked;
      var trimSpaces = document.getElementById('trimSpaces').checked;
      var dropBlank = document.getElementById('dropBlank').checked;
      var cols = pickCols(head);

      if (dropBlank) data = data.filter(function (r) {
        return r.some(function (c) { return String(c == null ? '' : c).trim() !== ''; });
      });

      function keyOf(r) {
        return cols.map(function (i) {
          var v = r[i] == null ? '' : String(r[i]);
          if (trimSpaces) v = v.trim();
          if (ignoreCase) v = v.toLowerCase();
          return v;
        }).join('\u0001');
      }

      var seen = {}, kept = [], cut = [];
      data.forEach(function (r) {
        var k = keyOf(r);
        if (seen[k] === undefined) { seen[k] = kept.length; kept.push(r); }
        else {
          if (keepLast) { cut.push(kept[seen[k]]); kept[seen[k]] = r; }
          else cut.push(r);
        }
      });

      var notice = [];
      if (!cut.length) notice.push(T.none);

      var outRows = [head].concat(kept);
      return {
        ok: true,
        notice: notice,
        summary: [
          T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>',
          T.sumOut + ' <b>' + CSVX.num(kept.length) + '</b>',
          T.sumCut + ' <b>' + CSVX.num(cut.length) + '</b>',
          '<span style="color:var(--ink-3)">' + (ctx.delim === '\t' ? 'TAB' : ctx.delim) + ' · ' + (EN ? 'comma-safe quoting' : '引用符で安全に出力') + '</span>'
        ],
        download: { name: 'deduped.csv', text: CSVX.toCSV(outRows) },
        downloadLabel: T.dl,
        extraDownloads: cut.length ? [{ name: 'removed.csv', text: CSVX.toCSV([head].concat(cut)), label: T.dlCut }] : [],
        head: head,
        rows: kept,
        maxRows: 60
      };
    }
  };

  /* 貼り付けタブでも列リストを更新 */
  var paste = document.getElementById('paste');
  if (paste) paste.addEventListener('input', function () {
    clearTimeout(lastRows);
    lastRows = setTimeout(function () {
      try { colBox(CSVX.parse(paste.value).rows); } catch (e) {}
    }, 350);
  });

  CSVX.init(cfg);
})();
