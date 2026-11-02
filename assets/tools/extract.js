/* extract.js — 正規表現で抽出（メール・URL・電話番号など） */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    badPat: 'That regular expression is not valid.',
    sumHit: 'Matches', sumRows: 'Matched rows', sumIn: 'Rows', dl: 'Download CSV',
    colName: 'match', noHit: 'No match found. Check the pattern or the target column.'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    badPat: '正規表現が正しくありません。',
    sumHit: '一致件数', sumRows: '一致した行', sumIn: '行数', dl: 'CSV をダウンロード',
    colName: '抽出結果', noHit: '一致する値がありませんでした。パターンか対象列を確認してください。'
  };

  CSVX.columns(function (head) {
    CSVX.fillSelect(document.getElementById('exCol'), head, EN ? 'all columns' : 'すべての列');
  });

  CSVX.init({
    sample: '氏名,メール,URL\n田中 健,tanaka@a.co.jp,https://a.co.jp/\n佐藤 実,sato@b.co.jp,https://b.co.jp/about\n鈴木 彩,（未登録）,https://c.co.jp/',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (rows.length < 2) return { ok: false, msg: T.nothing };
      var pat = document.getElementById('exPat').value;
      var ci = document.getElementById('exCase').checked;
      var mode = document.getElementById('exMode').value;
      var uniq = document.getElementById('exUniq').checked;
      var col = document.getElementById('exCol').value;

      var re;
      try { re = new RegExp(pat, 'g' + (ci ? 'i' : '')); }
      catch (e) { return { ok: false, msg: T.badPat }; }

      var head = rows[0], data = rows.slice(1);
      var targets = col === 'all' || col === '' ? head.map(function (_, i) { return i; }) : [+col];

      function matches(cell) {
        var s = String(cell == null ? '' : cell), m, out = [];
        re.lastIndex = 0;
        while ((m = re.exec(s)) !== null) {
          out.push(m[0]);
          if (m.index === re.lastIndex) re.lastIndex++;
          if (out.length > 50) break;
        }
        return out;
      }

      var total = 0, hitRows = 0;
      if (mode === 'list') {
        var seen = {}, list = [];
        data.forEach(function (r) {
          targets.forEach(function (i) {
            matches(r[i]).forEach(function (v) {
              total++;
              if (uniq && seen[v]) return;
              seen[v] = 1; list.push([v]);
            });
          });
        });
        if (!list.length) return { ok: false, msg: T.noHit };
        return {
          ok: true,
          summary: [T.sumHit + ' <b>' + CSVX.num(total) + '</b>', T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>'],
          download: { name: 'extracted.csv', text: CSVX.toCSV([[T.colName]].concat(list)) },
          downloadLabel: T.dl,
          head: [T.colName],
          rows: list,
          maxRows: 60
        };
      }

      var out = [], newHead = head.slice();
      if (mode === 'column') newHead = [T.colName].concat(head);

      data.forEach(function (r) {
        var found = [];
        targets.forEach(function (i) {
          matches(r[i]).forEach(function (v) { if (found.indexOf(v) < 0) found.push(v); });
        });
        total += found.length;
        if (found.length) hitRows++;
        if (mode === 'filter') {
          if (found.length) out.push(r);
        } else {
          out.push([found.join(' ')].concat(r));
        }
      });

      if (!out.length) return { ok: false, msg: T.noHit };

      return {
        ok: true,
        summary: [
          T.sumHit + ' <b>' + CSVX.num(total) + '</b>',
          T.sumRows + ' <b>' + CSVX.num(hitRows) + '</b>',
          T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>'
        ],
        download: { name: 'extracted.csv', text: CSVX.toCSV([newHead].concat(out)) },
        downloadLabel: T.dl,
        head: newHead,
        rows: out,
        maxRows: 60
      };
    }
  });
})();
