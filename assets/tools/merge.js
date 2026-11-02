/* merge.js — 複数 CSV の縦結合 */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose at least two CSV files.',
    nothing: 'Nothing to merge.',
    one: 'At least two files are needed.',
    dl: 'Download merged CSV',
    noHead: 'Header row is missing in one of the files.',
    addSource: 'Source file'
  } : {
    need: 'CSV を 2 つ以上選択してください。',
    nothing: '結合する内容がありません。',
    one: '2 つ以上のファイルが必要です。',
    dl: '結合した CSV をダウンロード',
    noHead: 'ヘッダー行がないファイルが含まれています。',
    addSource: '元ファイル'
  };

  CSVX.init({
    multi: true,
    maxFiles: 30,
    noFileMsg: T.need,
    emptyMsg: T.nothing,
    errMsg: EN ? 'Merge failed: ' : '結合に失敗しました: ',
    run: function (ctx) {
      var files = ctx.files || [];
      if (files.length < 2) return { ok: false, msg: T.one };

      var byHeader = document.getElementById('mergeAlign').value === 'header';
      var addSource = document.getElementById('mergeSource').checked;

      var parsed = files.map(function (f) {
        var p = CSVX.parse(f.text);
        return { name: f.name, rows: p.rows, head: p.rows[0] || [], data: p.rows.slice(1) };
      }).filter(function (p) { return p.data.length; });

      if (!parsed.length) return { ok: false, msg: T.nothing };

      var head, out = [], dupWarn = [];

      if (byHeader) {
        var order = [], seen = {};
        parsed.forEach(function (p) {
          p.head.forEach(function (h) { if (!seen[h]) { seen[h] = 1; order.push(h); } });
        });
        head = order.slice();
        if (addSource) head.unshift(T.addSource);
        parsed.forEach(function (p) {
          var map = {};
          p.head.forEach(function (h, i) { map[h] = i; });
          p.data.forEach(function (r) {
            var line = head.map(function (h) { return h === T.addSource ? p.name : (map[h] === undefined ? '' : r[map[h]]); });
            out.push(line);
          });
          if (p.head.length !== order.length) dupWarn.push(p.name);
        });
      } else {
        var width = Math.max.apply(null, parsed.map(function (p) { return p.head.length; }));
        head = parsed[0].head.slice();
        while (head.length < width) head.push('');
        if (addSource) head.unshift(T.addSource);
        parsed.forEach(function (p) {
          p.data.forEach(function (r) {
            var line = [];
            if (addSource) line.push(p.name);
            for (var i = 0; i < width; i++) line.push(r[i] === undefined ? '' : r[i]);
            out.push(line);
          });
        });
      }

      var notice = [];
      if (dupWarn.length) notice.push((EN ? 'Column sets differed and were aligned by name: ' : '列構成が異なるため列名で揃えました: ') + dupWarn.join(', '));

      return {
        ok: true,
        notice: notice,
        summary: [
          (EN ? 'Files' : 'ファイル数') + ' <b>' + parsed.length + '</b>',
          (EN ? 'Rows merged' : '結合行数') + ' <b>' + CSVX.num(out.length) + '</b>',
          (EN ? 'Columns' : '列数') + ' <b>' + head.length + '</b>'
        ],
        download: { name: 'merged.csv', text: CSVX.toCSV([head].concat(out)) },
        downloadLabel: T.dl,
        head: head,
        rows: out.slice(0, 50),
        maxRows: 50
      };
    }
  });
})();
