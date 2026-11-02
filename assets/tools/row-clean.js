/* row-clean.js — 空白行・不要行の整理、シャッフル */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    sumIn: 'Input rows', sumOut: 'Output rows', sumDrop: 'Removed',
    sumCol: 'Columns removed', dl: 'Download CSV',
    header: 'Header row'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    sumIn: '入力行数', sumOut: '出力行数', sumDrop: '削除行数',
    sumCol: '削除した列', dl: 'CSV をダウンロード',
    header: '見出し行'
  };

  CSVX.init({
    sample: '氏名,会社,,電話\n田中 健,A商事,,03-1234-0001\n,,,\n佐藤 実,B工業,,06-9876-0002\n\n鈴木 彩,C物産,,03-5555-0003\n高橋 直,D電機,,052-111-0004',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };

      var skip = Math.max(0, parseInt(document.getElementById('rcSkip').value || '0', 10));
      var dropBlank = document.getElementById('rcBlank').checked;
      var noHead = document.getElementById('rcNoHead').checked;
      var shuffle = document.getElementById('rcShuffle').checked;
      var dropEmptyCol = document.getElementById('rcEmptyCol').checked;

      var body = rows.slice(skip);
      var head = noHead ? null : body.shift();
      var data = body.slice();
      var inCount = data.length;

      if (dropBlank) {
        data = data.filter(function (r) {
          return r.some(function (c) { return String(c == null ? '' : c).trim() !== ''; });
        });
      }

      var removedCols = 0;
      if (dropEmptyCol) {
        var width = Math.max.apply(null, data.map(function (r) { return r.length; }).concat([head ? head.length : 0]));
        var keep = [];
        for (var i = 0; i < width; i++) {
          var filled = data.some(function (r) { return String(r[i] == null ? '' : r[i]).trim() !== ''; });
          var named = head && String(head[i] == null ? '' : head[i]).trim() !== '';
          if (filled || named) keep.push(i);
        }
        removedCols = width - keep.length;
        if (removedCols) {
          data = data.map(function (r) { return keep.map(function (i) { return r[i] == null ? '' : r[i]; }); });
          if (head) head = keep.map(function (i) { return head[i] == null ? '' : head[i]; });
        }
      }

      if (shuffle) {
        for (var j = data.length - 1; j > 0; j--) {
          var k = Math.floor(Math.random() * (j + 1));
          var tmp = data[j]; data[j] = data[k]; data[k] = tmp;
        }
      }

      var outRows = head ? [head].concat(data) : data;
      return {
        ok: true,
        summary: [
          T.sumIn + ' <b>' + CSVX.num(inCount) + '</b>',
          T.sumOut + ' <b>' + CSVX.num(data.length) + '</b>',
          T.sumDrop + ' <b>' + CSVX.num(inCount - data.length) + '</b>',
          (removedCols ? T.sumCol + ' <b>' + CSVX.num(removedCols) + '</b>' : '<span style="color:var(--ink-3)">' + T.header + ': ' + (head ? '✓' : '−') + '</span>')
        ],
        download: { name: 'cleaned-rows.csv', text: CSVX.toCSV(outRows) },
        downloadLabel: T.dl,
        head: head,
        rows: data,
        maxRows: 60
      };
    }
  });
})();
