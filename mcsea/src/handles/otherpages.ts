import { translateDOM } from "../utils/translate";
import { filterTrashChildren, observeCtxUpdate } from "../utils/purify";
/**
 * 在小说阅读页面过滤乱码，追加下载按钮
 */
export function other_page_handle() {
    observeCtxUpdate(document.body, () => {
        filterTrashChildren(document.body);
        translateDOM(document.body);
    })
}