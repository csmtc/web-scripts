

import * as OpenCC from 'opencc-js';
const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });
export function toSimplified(text) {
    return converter(text);
}
//功能：转换对象，使用递归，逐层剥到文本；
export function translateDOM(fobj: Node = document.body, t2s = true) {
    var objs = typeof (fobj) == "object" ? fobj.childNodes : document.body.childNodes;
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].nodeType === 3) {
            objs[i].textContent = toSimplified(objs[i].textContent);
        } else if (objs[i].nodeType === 1) {
            translateDOM(objs[i]);
        }
    }
}
