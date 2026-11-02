/* clean.js — セルのクレンジング（空白・記号・空セル・桁区切り） */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    sumCells: 'Cells changed', sumRows: 'Rows', dl: 'Download CSV'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    sumCells: '変更したセル', sumRows: '行数', dl: 'CSV をダウンロード'
  };

  CSVX.init({
    sample: '氏名,電話,金額,備考\n 田中 健 ,03-1234-0001,"1,200",  A商事  \n佐藤　実,06(9876)0002,"3,400",B工業\n鈴木 彩,03-5555-0003,,C物産',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);

      var doTrim = document.getElementById('clTrim').checked;
      var squeeze = document.getElementById('clSqueeze').checked;
      var zenkaku = document.getElementById('clZenkaku').checked;
      var sym = document.getElementById('clSymbols').value;
      var fill = document.getElementById('clFill').value;
      var brk = document.getElementById('clBreak').checked;
      var comma = document.getElementById('clComma').checked;
      var changed = 0;

      function cell(v) {
        var s = String(v == null ? '' : v);
        var o = s;
        if (zenkaku) o = o.replace(/\u3000/g, ' ');
        if (doTrim) o = o.trim();
        if (squeeze) o = o.replace(/[ \t]+/g, ' ');
        if (brk) o = o.replace(/[\r\n\t]+/g, ' ');
        if (sym === 'basic') o = o.replace(/[-‐-‒–—―()（）]/g, '');
        else if (sym === 'all') o = o.replace(/[!-/:-@\[-`{-~！-／：-＠［-｀｛-～、。・「」『』]/g, '');
        if (comma) {
          var n = CSVT.num(o);
          if (n !== null && /[,\s¥$€£]/.test(o)) o = n;
        }
        if (fill !== '' && o === '') o = fill;
        if (o !== s) changed++;
        return o;
      }

      var out = data.map(function (r) { return r.map(cell); });
      return {
        ok: true,
        summary: [
          T.sumCells + ' <b>' + CSVX.num(changed) + '</b>',
          T.sumRows + ' <b>' + CSVX.num(out.length) + '</b>',
          (fill !== '' ? '<span style="color:var(--ink-3)">' + (EN ? 'blanks filled' : '空セルを補完') + '</span>' : '')
        ],
        download: { name: 'cleaned.csv', text: CSVX.toCSV([head].concat(out)) },
        downloadLabel: T.dl,
        head: head,
        rows: out,
        maxRows: 60
      };
    }
  });
})();
