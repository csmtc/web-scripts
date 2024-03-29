function t() {
  'undefined' == typeof globalThis && (window.globalThis = window);
  const e = globalThis.document, t = globalThis.CustomEvent,
        n = globalThis.FileReader, r = globalThis.Blob, a = {
          family: 'font-family',
          style: 'font-style',
          weight: 'font-weight',
          stretch: 'font-stretch',
          unicodeRange: 'unicode-range',
          variant: 'font-variant',
          featureSettings: 'font-feature-settings'
        };
  if (globalThis.FontFace) {
    const n = globalThis.FontFace;
    globalThis.FontFace =
        function() {
      return o(...arguments)
                 .then(
                     (n => e.dispatchEvent(
                          new t('single-file-new-font-face', {detail: n})))),
             new n(...arguments)
    },
    globalThis.FontFace.prototype = n.prototype,
    globalThis.FontFace.toString = function() {
      return 'function FontFace() { [native code] }'
    };
    const r = e.fonts.delete;
    e.fonts.delete = function(n) {
      return o(n.family).then(
                 (n => e.dispatchEvent(
                      new t('single-file-delete-font', {detail: n})))),
             r.call(e.fonts, n)
    }, e.fonts.delete.toString = function() {
      return 'function delete() { [native code] }'
    };
    const a = e.fonts.clear;
    e.fonts.clear = function() {
      return e.dispatchEvent(new t('single-file-clear-fonts')), a.call(e.fonts)
    }, e.fonts.clear.toString = function() {
      return 'function clear() { [native code] }'
    }
  }
  async function o(e, t, o) {
    const s = {};
    return s['font-family'] = e, s.src = t,
           o && Object.keys(o).forEach((e => {a[e] && (s[a[e]] = o[e])})),
           new Promise((e => {
             if (s.src instanceof ArrayBuffer) {
               const t = new n;
               t.readAsDataURL(new r([s.src])),
                   t.addEventListener(
                       'load', (() => {s.src = 'url(' + t.result + ')', e(s)}))
             } else
               e(s)
           }))
  }
}
