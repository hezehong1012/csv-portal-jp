/* sort.js — 複数列ソート（数値・日付も正しく） */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    sumIn: 'Rows sorted', dl: 'Download CSV', noCol: 'Pick a column to sort by.',
    none: '— none —'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    sumIn: '並べ替えた行数', dl: 'CSV をダウンロード', noCol: '並べ替える列を選んでください。',
    none: '— なし —'
  };

  function fill(head) {
    var a = document.getElementById('sortA');
    var b = document.getElementById('sortB');
    CSVX.fillSelect(a, head);
    CSVX.fillSelect(b, head);
    b.insertAdjacentHTML('afterbegin', '<option value="">' + T.none + '</option>');
    b.value = '';
  }
  CSVX.columns(fill);

  CSVX.init({
    sample: '氏名,売上,入社日\n田中 健,1200,2021/4/1\n佐藤 実,320,2019/11/15\n鈴木 彩,9800,2023/2/3\n高橋 直,120,2018/7/9',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (rows.length < 2) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);
      var a = document.getElementById('sortA').value;
      if (a === '' || a == null) return { ok: false, msg: T.noCol };
      var b = document.getElementById('sortB').value;
      var dirA = document.getElementById('sortDirA').value === 'desc' ? -1 : 1;
      var dirB = document.getElementById('sortDirB').value === 'desc' ? -1 : 1;
      var asNum = document.getElementById('sortNum').checked;
      var ic = document.getElementById('sortCase').checked;

      function cmp(x, y) {
        var r = one(x, y, +a, dirA);
        if (r === 0 && b !== '') r = one(x, y, +b, dirB);
        return r;
      }
      function one(x, y, i, dir) {
        var v1 = x[i] == null ? '' : String(x[i]);
        var v2 = y[i] == null ? '' : String(y[i]);
        if (asNum && CSVT.isNum(v1) && CSVT.isNum(v2)) {
          var n1 = parseFloat(v1.replace(/[,\s]/g, '')), n2 = parseFloat(v2.replace(/[,\s]/g, ''));
          return (n1 - n2) * dir;
        }
        if (ic) { v1 = v1.toLowerCase(); v2 = v2.toLowerCase(); }
        if (v1 === '') return v2 === '' ? 0 : 1 * dir;
        if (v2 === '') return -1 * dir;
        return v1.localeCompare(v2, EN ? 'en' : 'ja') * dir;
      }

      var idx = data.map(function (r, i) { return i; });
      idx.sort(function (i, j) { return cmp(data[i], data[j]) || (i - j); });
      var out = idx.map(function (i) { return data[i]; });

      return {
        ok: true,
        summary: [
          T.sumIn + ' <b>' + CSVX.num(out.length) + '</b>',
          '<span style="color:var(--ink-3)">' + CSVX.esc(head[+a] || '') + (dirA < 0 ? ' ↓' : ' ↑') +
          (b !== '' ? ' + ' + CSVX.esc(head[+b] || '') : '') + '</span>'
        ],
        download: { name: 'sorted.csv', text: CSVX.toCSV([head].concat(out)) },
        downloadLabel: T.dl,
        head: head,
        rows: out,
        maxRows: 60
      };
    }
  });
})();
