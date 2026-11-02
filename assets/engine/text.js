/* text.js — shared string helpers (width, kana, dates, numbers).
   Loaded after core.js on tool pages that rewrite cell values. */
(function () {
  var W = {};

  /* 全角英数記号 → 半角（全角スペースは半角スペースに） */
  W.half = function (s) {
    return String(s == null ? '' : s)
      .replace(/[\uFF01-\uFF5E]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/\u3000/g, ' ');
  };

  /* 半角カナ → 全角カナ（濁点・半濁点の合成つき） */
  var HF = '｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
  var FW = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
  var VOICE = { 'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ', 'サ': 'ザ', 'シ': 'ジ', 'ス': 'ズ', 'セ': 'ゼ', 'ソ': 'ゾ', 'タ': 'ダ', 'チ': 'ヂ', 'ツ': 'ヅ', 'テ': 'デ', 'ト': 'ド', 'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ', 'ウ': 'ヴ' };
  var SEMI = { 'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ' };

  W.kana = function (s) {
    var src = String(s == null ? '' : s);
    var out = '';
    for (var i = 0; i < src.length; i++) {
      var c = src[i], nx = src[i + 1], fw = null;
      var at = HF.indexOf(c);
      if (at >= 0) fw = FW[at];
      if (fw && (nx === 'ﾞ' || nx === 'ﾟ')) {
        var v = nx === 'ﾞ' ? VOICE[fw] : SEMI[fw];
        if (v) { out += v; i++; continue; }
      }
      out += fw || c;
    }
    return out;
  };

  /* 日付 → YYYY-MM-DD（解釈できない値はそのまま返す） */
  W.date = function (s) {
    var v = String(s == null ? '' : s).trim();
    if (!v) return v;
    var m = v.match(/^(\d{4})[\/\-\.年](\d{1,2})[\/\-\.月](\d{1,2})日?$/);
    if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
    m = v.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];
    m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m && +m[1] <= 12) return m[3] + '-' + pad(m[1]) + '-' + pad(m[2]);
    return v;
  };
  function pad(n) { n = String(n); return n.length < 2 ? '0' + n : n; }

  /* 数値らしい文字列から通貨記号・桁区切りを落とす */
  W.num = function (s) {
    var v = String(s == null ? '' : s).trim();
    if (!v) return v;
    var t = v.replace(/[¥$€£,\s]/g, '').replace(/円$/, '');
    if (/^-?\d+(\.\d+)?$/.test(t)) return t;
    return null;
  };

  /* 電話番号からハイフン・空白・括弧を落とす */
  W.digits = function (s) {
    return String(s == null ? '' : s).replace(/[^\d+]/g, '');
  };

  /* 数値として比較できるか */
  W.isNum = function (v) {
    var s = String(v == null ? '' : v).replace(/[,\s]/g, '');
    return s !== '' && /^-?\d+(\.\d+)?$/.test(s);
  };

  /* 文字化け（置換文字・典型パターン）の検出 */
  W.mojibake = function (s) {
    var v = String(s == null ? '' : s);
    if (/\uFFFD/.test(v)) return true;
    return /[ÃÂã¢][\u0080-\u00FF]/.test(v);
  };

  window.CSVT = W;
})();
