/* delimiter.js — 区切り文字の変換（カンマ / タブ / セミコロン / パイプ） */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    inD: 'Input delimiter', outD: 'Output delimiter', sumIn: 'Rows', sumCol: 'Columns', dl: 'Download'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    inD: '入力の区切り', outD: '出力の区切り', sumIn: '行数', sumCol: '列数', dl: 'ダウンロード'
  };

  function name(d) {
    return d === '\t' ? 'TAB' : d === ',' ? ',' : d === ';' ? ';' : d === '|' ? '|' : d;
  }

  CSVX.init({
    sample: '氏名;会社;電話\n田中 健;A商事;03-1234-0001\n佐藤 実;"B工業;大阪";06-9876-0002',
    noFileMsg: T.need,
    run: function (ctx) {
      var inSel = document.getElementById('dlIn').value;
      var outSel = document.getElementById('dlOut').value;
      var inD = inSel === 'auto' ? ctx.delim : inSel;
      var p = inSel === 'auto' ? { rows: ctx.rows, delim: ctx.delim } : CSVX.parse(ctx.text, inD);
      var rows = p.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };

      var head = rows[0], data = rows.slice(1);
      var bom = document.getElementById('dlBom').checked;
      var csv = CSVX.toCSV([head].concat(data), { delim: outSel });

      return {
        ok: true,
        summary: [
          T.inD + ' <b>' + name(inD) + '</b>',
          T.outD + ' <b>' + name(outSel) + '</b>',
          T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>',
          T.sumCol + ' <b>' + CSVX.num(head.length) + '</b>'
        ],
        download: { name: 'converted.' + (outSel === '\t' ? 'tsv' : 'csv'), text: csv, bom: bom },
        downloadLabel: T.dl,
        head: head,
        rows: data,
        maxRows: 40
      };
    }
  });
})();
