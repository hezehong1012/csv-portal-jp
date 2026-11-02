/* column.js — 列の抽出・削除・並べ替え */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    sumIn: 'Input rows', sumCols: 'Columns out', dl: 'Download CSV',
    pick: 'No column selected — tick at least one.',
    noHead: 'One column left, header kept.'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    sumIn: '入力行数', sumCols: '出力列数', dl: 'CSV をダウンロード',
    pick: '列が選ばれていません。1 つ以上チェックしてください。',
    noHead: '列が 1 つになりました。'
  };

  CSVX.columns(function (head) { CSVX.fillChecks(document.getElementById('colbox'), head, true); });

  CSVX.init({
    sample: '氏名,会社,電話,住所\n田中 健,A商事,03-1234-0001,東京都千代田区1-1\n佐藤 実,B工業,06-9876-0002,大阪府大阪市2-2\n鈴木 彩,C物産,03-5555-0003,愛知県名古屋市3-3',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);
      var box = document.getElementById('colbox');
      var idx = CSVX.pickChecks(box, head, false);
      if (!idx.length) return { ok: false, msg: T.pick };

      var mode = document.getElementById('colMode').value;
      var serial = document.getElementById('colSerial').checked;
      var trimNames = document.getElementById('colTrim').checked;
      var use = mode === 'keep' ? idx : head.map(function (_, i) { return i; }).filter(function (i) { return idx.indexOf(i) < 0; });
      if (!use.length) return { ok: false, msg: T.nothing };

      var newHead = use.map(function (i) { return trimNames ? String(head[i] == null ? '' : head[i]).trim() : head[i]; });
      if (serial) newHead = [EN ? 'No' : '連番'].concat(newHead);

      var out = data.map(function (r, n) {
        var line = use.map(function (i) { return r[i] == null ? '' : r[i]; });
        return serial ? [String(n + 1)].concat(line) : line;
      });

      return {
        ok: true,
        summary: [
          T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>',
          T.sumCols + ' <b>' + CSVX.num(newHead.length) + '</b>',
          '<span style="color:var(--ink-3)">' + (mode === 'keep' ? (EN ? 'keep selected' : '選択列を残す') : (EN ? 'drop selected' : '選択列を削除')) + '</span>'
        ],
        download: { name: 'columns.csv', text: CSVX.toCSV([newHead].concat(out)) },
        downloadLabel: T.dl,
        head: newHead,
        rows: out,
        maxRows: 60
      };
    }
  });
})();
