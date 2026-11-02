/* shift-jis.js — 文字コード判定と UTF-8 への変換（文字化けの修復） */
(function () {
  var EN = document.documentElement.lang === 'en';
  var T = EN ? {
    need: 'Choose a CSV file first.', nothing: 'Nothing to process.',
    enc: 'Detected encoding', out: 'Output', moji: 'Mojibake cells',
    mojiN: 'Text still looks garbled. Try forcing “Shift_JIS” or “EUC-JP” above, then run again.',
    sumIn: 'Rows', dl: 'Download UTF-8 CSV', fixed: 'Repaired',
    pasteNote: 'Pasted text is already decoded — encoding detection applies to files only.'
  } : {
    need: '先に CSV を選択してください。', nothing: '処理する内容がありません。',
    enc: '判定した文字コード', out: '出力', moji: '文字化けセル',
    mojiN: 'まだ文字化けが残っています。上の「入力の文字コード」を Shift_JIS / EUC-JP に固定して再実行してください。',
    sumIn: '行数', dl: 'UTF-8 の CSV をダウンロード', fixed: '修復',
    pasteNote: '貼り付けたテキストは復号済みです。文字コード判定はファイル読み込み時のみ有効です。'
  };

  function readBuf() {
    var f = document.getElementById('file');
    if (!f || !f.files || !f.files[0]) return null;
    return f.files[0];
  }

  CSVX.init({
    sample: '氏名,会社,備考\n田中 健,A商事,問題なし\n佐藤 実,B工業,要確認',
    noFileMsg: T.need,
    run: function (ctx) {
      var force = document.getElementById('encForce').value;
      var text = ctx.text, enc = (ctx.files[0] && ctx.files[0].enc) || 'UTF-8';
      var notice = [];

      if (force !== 'auto' && ctx.files[0] && ctx.files[0].buf) {
        try {
          text = new TextDecoder(force, { fatal: false }).decode(new Uint8Array(ctx.files[0].buf)).replace(/^\uFEFF/, '');
          enc = force.toUpperCase() + (EN ? ' (forced)' : '（強制指定）');
        } catch (e) {}
      } else if (force !== 'auto' && ctx.source === 'paste') {
        notice.push(T.pasteNote);
      }

      var p = CSVX.parse(text, 'auto');
      var rows = p.rows;
      if (!rows.length) return { ok: false, msg: T.nothing };

      var head = rows[0], data = rows.slice(1);
      var bad = 0;
      data.forEach(function (r) {
        r.forEach(function (c) { if (CSVT.mojibake(c)) bad++; });
      });
      if (bad) notice.push(T.mojiN);

      var bom = document.getElementById('encBom').checked;
      var nl = document.getElementById('encNl').value;
      var csv = CSVX.toCSV([head].concat(data), { newline: nl });

      return {
        ok: true,
        notice: notice,
        summary: [
          T.enc + ' <b>' + CSVX.esc(enc) + '</b>',
          T.out + ' <b>UTF-8' + (bom ? ' (BOM)' : '') + ' · ' + nl + '</b>',
          T.sumIn + ' <b>' + CSVX.num(data.length) + '</b>',
          (bad ? '<span style="color:var(--danger,#c0392b)">' + T.moji + ' <b>' + CSVX.num(bad) + '</b></span>'
               : '<span style="color:var(--ink-3)">' + T.fixed + ' ✓</span>')
        ],
        download: { name: 'utf8.csv', text: csv, bom: bom },
        downloadLabel: T.dl,
        head: head,
        rows: data,
        maxRows: 40
      };
    }
  });
})();
