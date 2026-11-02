/* newline.js — 改行コードの変換（CRLF / LF / CR） */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    inNl: 'Input', outNl: 'Output', sumIn: 'Rows', dl: 'Download CSV'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    inNl: '入力', outNl: '出力', sumIn: '行数', dl: 'CSV をダウンロード'
  };

  CSVX.init({
    sample: '氏名,会社,電話\n田中 健,A商事,03-1234-0001\n佐藤 実,B工業,06-9876-0002',
    noFileMsg: T.need,
    run: function (ctx) {
      var src = ctx.text;
      var crlf = (src.match(/\r\n/g) || []).length;
      var lf = (src.match(/(^|[^\r])\n/g) || []).length;
      var cr = (src.match(/\r(?!\n)/g) || []).length;
      var detected = crlf >= lf && crlf >= cr && crlf ? 'CRLF' : (lf >= cr ? 'LF' : 'CR');

      var rows = ctx.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);
      var nl = document.getElementById('nlOut').value;
      var bom = document.getElementById('nlBom').checked;
      var notrail = document.getElementById('nlNoTrail').checked;

      var csv = CSVX.toCSV([head].concat(data), { newline: nl });
      if (notrail) csv = csv.replace(/\r\n$|\n$|\r$/, '');

      return {
        ok: true,
        summary: [
          T.inNl + ' <b>' + detected + '</b>',
          T.outNl + ' <b>' + nl + (bom ? ' + BOM' : '') + '</b>',
          T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>',
          (detected === nl ? '<span style="color:var(--ink-3)">' + (EN ? 'already the same' : 'すでに同じ改行コード') + ' ✓</span>' : '')
        ],
        download: { name: nl.toLowerCase() + '.csv', text: csv, bom: bom },
        downloadLabel: T.dl,
        head: head,
        rows: data,
        maxRows: 30
      };
    }
  });
})();
