/* sql.js — CSV から SQL INSERT 文（＋ CREATE TABLE）を生成 */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    sumStmt: 'Statements', sumRows: 'Rows', sumCol: 'Columns', dl: 'Download .sql',
    noName: 'Enter a table name.', created: 'CREATE TABLE', ins: 'INSERT'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    sumStmt: '文数', sumRows: '行数', sumCol: '列数', dl: '.sql をダウンロード',
    noName: 'テーブル名を入力してください。', created: 'CREATE TABLE', ins: 'INSERT'
  };

  var RESERVED = { 'from': 1, 'table': 1, 'select': 1, 'order': 1, 'group': 1, 'user': 1, 'index': 1, 'key': 1, 'value': 1, 'values': 1, 'name': 0 };

  function ident(s, q) {
    var v = String(s == null ? '' : s).trim().replace(/[\s\-]+/g, '_').replace(/[^\w\u3040-\u30FF\u4E00-\u9FFF]/g, '');
    if (!v) v = 'col';
    if (/^\d/.test(v)) v = 'c_' + v;
    if (RESERVED[v.toLowerCase()]) v = v + '_';
    return q + v + q;
  }

  function inferType(values, dialect) {
    var all = values.filter(function (v) { return String(v == null ? '' : v).trim() !== ''; });
    if (!all.length) return 'TEXT';
    var isInt = all.every(function (v) { return /^-?\d{1,15}$/.test(String(v).replace(/[,\s]/g, '')); });
    if (isInt) return dialect === 'postgres' ? 'BIGINT' : 'INT';
    var isNum = all.every(function (v) { return CSVT.isNum(v); });
    if (isNum) return dialect === 'postgres' ? 'NUMERIC' : 'DECIMAL(18,4)';
    var isDate = all.every(function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(CSVT.date(v)); });
    if (isDate) return 'DATE';
    var max = Math.max.apply(null, all.map(function (v) { return String(v).length; }));
    var len = Math.min(4000, Math.max(16, Math.ceil(max * 1.4)));
    if (dialect === 'sqlite') return 'TEXT';
    return 'VARCHAR(' + len + ')';
  }

  function lit(v, nullify, type) {
    var s = String(v == null ? '' : v);
    if (nullify && s.trim() === '') return 'NULL';
    if (/INT|DECIMAL|NUMERIC/.test(type || '')) {
      var n = CSVT.num(s);
      if (n !== null) return n;
    }
    return "'" + s.replace(/'/g, "''") + "'";
  }

  CSVX.init({
    sample: 'id,氏名,会社,入社日,売上\n1,田中 健,A商事,2021-04-01,1200\n2,佐藤 実,B工業,2019-11-15,320\n3,鈴木 彩,C物産,2023-02-03,9800',
    noFileMsg: T.need,
    run: function (ctx) {
      var rows = ctx.rows;
      if (rows.length < 2) return { ok: false, msg: T.nothing };
      var table = (document.getElementById('sqlTable').value || '').trim();
      if (!table) return { ok: false, msg: T.noName };
      var dialect = document.getElementById('sqlDialect').value;
      var wantCreate = document.getElementById('sqlCreate').checked;
      var nullify = document.getElementById('sqlNull').checked;
      var q = dialect === 'mysql' ? '`' : '"';

      var head = rows[0], data = rows.slice(1);
      var cols = head.map(function (h, i) { return ident(h, q) + (i === 0 ? '' : ''); });
      var types = head.map(function (_, i) {
        return inferType(data.map(function (r) { return r[i]; }), dialect);
      });

      var out = [];
      if (wantCreate) {
        var defs = cols.map(function (c, i) { return '  ' + c + ' ' + types[i]; });
        out.push('CREATE TABLE ' + q + table.replace(/[^\w]/g, '_') + q + ' (\n' + defs.join(',\n') + '\n);');
      }

      var chunk = 100;
      for (var i = 0; i < data.length; i += chunk) {
        var part = data.slice(i, i + chunk);
        var vals = part.map(function (r) {
          return '(' + head.map(function (_, c) { return lit(r[c], nullify, types[c]); }).join(', ') + ')';
        });
        out.push('INSERT INTO ' + q + table.replace(/[^\w]/g, '_') + q + ' (' + cols.join(', ') + ') VALUES\n  ' + vals.join(',\n  ') + ';');
      }

      var sql = out.join('\n\n') + '\n';
      var preview = out.slice(0, 6);

      return {
        ok: true,
        summary: [
          T.sumStmt + ' <b>' + CSVX.num(out.length) + '</b>',
          T.sumRows + ' <b>' + CSVX.num(data.length) + '</b>',
          T.sumCol + ' <b>' + CSVX.num(head.length) + '</b>',
          '<span style="color:var(--ink-3)">' + dialect + (wantCreate ? ' · ' + T.created : '') + '</span>'
        ],
        download: { name: table.replace(/[^\w]/g, '_') + '.sql', text: sql },
        downloadLabel: T.dl,
        tables: [{ title: EN ? 'Preview (first statements)' : 'プレビュー（先頭の文のみ）', head: ['SQL'], rows: preview.map(function (s) { return [s]; }), max: 4 }]
      };
    }
  });
})();
