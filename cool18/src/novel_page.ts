import { getPageType, htmlToNovel, PageType, QueryStrings } from "./util";

export function novel_page_inject() {
    var btn = document.createElement('input');
    btn.type = "button";
    btn.value = "Download Novel"
    btn.addEventListener("click", function () {
        htmlToNovel(document, true);
    });
    var selector = getPageType(document.URL) == PageType.pc ?
        QueryStrings.novelPage.toolBarPc : QueryStrings.novelPage.toolBarMb;
    var oldBtn = document.querySelector(selector);
    oldBtn.replaceWith(btn);
}