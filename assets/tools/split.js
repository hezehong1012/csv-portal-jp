/* split.js — 大容量 CSV の分割 */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.',
    nothing: 'Nothing to split.',
    dl: 'Download',
    part: 'Part',
    rows: 'rows',
    tooSmall: 'The row count is larger than the file. Nothing to split.',
    units: 'rows per file'
  } : {
    need: '先に CSV を選択してください。',
    nothing: '分割する内容がありません。',
    dl: 'ダウンロード',
    part: '分割',
    rows: '行',
    tooSmall: '指定した行数がファイル全体より多いため、分割されませんでした。',
    units: '行ずつ'
  };

  function baseName(ctx) {
    var n = ctx.files && ctx.files[0] ? ctx.files[0].name : 'data.csv';
    return n.replace(/\.(csv|tsv|txt)$/i, '') || 'data';
  }

  CSVX.init({
    sample: 'id,氏名,部署,入社日\n' + Array.apply(null, Array(30)).map(function (_, i) {
      return (i + 1) + ',社員' + (i + 1) + ',' + ['営業', '開発', '総務'][i % 3] + ',202' + (i % 5) + '-04-01';
    }).join('\n'),
    noFileMsg: T.need,
    emptyMsg: T.nothing,
    errMsg: EN ? 'Splitting failed: ' : '分割に失敗しました: ',
    run: function (ctx) {
      var rows = ctx.rows;
      if (rows.length < 2) return { ok: false, msg: T.nothing };
      var head = rows[0], data = rows.slice(1);
      var mode = document.getElementById('splitMode').value;
      var size = Math.max(1, parseInt(document.getElementById('splitSize').value, 10) || 1000);
      var keepHead = document.getElementById('keepHead').checked;
      var perFile = mode === 'parts'
        ? Math.max(1, Math.ceil(data.length / size))
        : size;

      if (mode === 'parts' && size >= data.length) return { ok: false, msg: T.tooSmall };

      var files = [], i = 0, part = 1;
      while (i < data.length) {
        var chunk = data.slice(i, i + perFile);
        var body = keepHead ? [head].concat(chunk) : chunk;
        files.push({
          name: baseName(ctx) + '_' + part + '.csv',
          text: CSVX.toCSV(body),
          label: T.part + ' ' + part + '（' + CSVX.num(i + 1) + '–' + CSVX.num(i + chunk.length) + ' ' + T.rows + '）'
        });
        i += perFile; part++;
      }

      return {
        ok: true,
        summary: [
          T.rows + ' <b>' + CSVX.num(data.length) + '</b>',
          (EN ? 'Files' : '分割数') + ' <b>' + files.length + '</b>',
          (EN ? 'Per file' : '1ファイルあたり') + ' <b>' + CSVX.num(perFile) + '</b>'
        ],
        files: files,
        head: keepHead ? head : null,
        rows: data.slice(0, perFile),
        maxRows: 25
      };
    }
  });
})();
