/* normalize.js — 表記ゆれの統一（全角半角・かな・日付・数値） */
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
    sample: '氏名,電話,入社日,金額\nＴＡＮＡＫＡ 健,03-1234-0001,2021/4/1,"1,200"\nｻﾄｳ 実,06-9876-0002,2019年11月15日,3400\n鈴木 彩,03-5555-0003,2023.2.3,9800',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);

      var half = document.getElementById('nmHalf').checked;
      var kana = document.getElementById('nmKana').checked;
      var date = document.getElementById('nmDate').checked;
      var num = document.getElementById('nmNum').checked;
      var phone = document.getElementById('nmPhone').checked;
      var cs = document.getElementById('nmCase').value;
      var changed = 0;

      function cell(v) {
        var s = String(v == null ? '' : v), o = s;
        if (!o) return o;
        if (half) o = CSVT.half(o);
        if (kana) o = CSVT.kana(o);
        if (date) o = CSVT.date(o);
        if (num) {
          var n = CSVT.num(o);
          if (n !== null && n !== o) o = n;
        }
        if (phone && /^[+()\d][\d\-() \u3000]{7,}$/.test(o)) o = CSVT.digits(o);
        if (cs === 'upper') o = o.toUpperCase();
        else if (cs === 'lower') o = o.toLowerCase();
        if (o !== s) changed++;
        return o;
      }

      var out = data.map(function (r) { return r.map(cell); });
      return {
        ok: true,
        summary: [
          T.sumCells + ' <b>' + CSVX.num(changed) + '</b>',
          T.sumRows + ' <b>' + CSVX.num(out.length) + '</b>',
          '<span style="color:var(--ink-3)">UTF-8 · ' + (EN ? 'comma-safe quoting' : '引用符で安全に出力') + '</span>'
        ],
        download: { name: 'normalized.csv', text: CSVX.toCSV([head].concat(out)) },
        downloadLabel: T.dl,
        head: head,
        rows: out,
        maxRows: 60
      };
    }
  });
})();
