import { saveNovelData } from "../utils/save";
import { extractNovelData, is_paid } from "../extractor";
import { translateDOM } from "../utils/translate";
import { filterTrashChildren, observeCtxUpdate } from "../utils/purify";
import { config } from "../utils/config";
/**
 * 在小说阅读页面过滤乱码，追加下载按钮
 */
export function novel_page_handle(is_pc: boolean) {
    let mainpost = document.querySelector(is_pc ? config.selector.pc.mainpost : config.selector.mb.mainpost) as HTMLElement;
    observeCtxUpdate(mainpost, () => {
        filterTrashChildren(mainpost);
        translateDOM(mainpost);
    })
    // 附加下载按钮
    let btn = document.createElement('a');
    btn.innerText = "DL"; btn.style.display = "block";
    btn.style.fontWeight = "bold"; btn.style.backgroundColor = "pink"; btn.style.color = "white";
    btn.href = "javascript:void(0)"; btn.addEventListener("click", () => {
        if (is_paid(document)) {
            let promise = extractNovelData(document, is_pc);
            promise.then(
                novel_data => {
                    saveNovelData(novel_data);
                }
            ).catch((reason) => alert("dl fail." + reason));
        }
        else {
            alert("未购买");
        }

    });

    let container;
    if (is_pc) {
        container = document.createElement("li");
        document.querySelector(".pls.favatar")?.lastElementChild?.appendChild(container);
    } else { // Mobile
        container = document.querySelector("#ainuo_quick_bot");
        btn.classList.add("ainuo_quick_post");
        container.removeChild(container.firstElementChild);
    }
    container.appendChild(btn);
}