
import { add_download_buttons, createAndDownloadFile, dl_chapter, get_all_chapter_elements, htmlToNovel, insertChild, pure_title, QueryStrings } from "./util";
import JSZip from 'jszip';


let chapter_urls = []
let last_dl_idx = 0;
function dl_all() {
    const zip = new JSZip()

    let elements = get_all_chapter_elements(document);
    let title = pure_title(elements[elements.length - 1].textContent);

    chapter_urls = elements.map((e) => e.getAttribute('href'));

    async function dl_func() {
        if (last_dl_idx == chapter_urls.length) last_dl_idx = 0;
        for (let i = last_dl_idx; i < chapter_urls.length; i++) {
            var doc = await dl_chapter(chapter_urls[i]);
            var nov = htmlToNovel(doc, false, true);
            zip.file(nov[0] + ".txt", nov[1]);
        }
    }
    dl_func().then(
        () => {
            zip.generateAsync({ type: "blob" }).then(function (content) {
                createAndDownloadFile(title + ".zip", content, "blob");
            });
        }
    );

}

function dl_all_single_file() {
    let elements = get_all_chapter_elements(document);
    let title = pure_title(elements[elements.length - 1].textContent);

    chapter_urls = elements.map((e) => e.getAttribute('href'));

    let ctx = "";
    let ctx_arr = Array(chapter_urls.length);
    async function dl_func() {
        if (last_dl_idx == chapter_urls.length) last_dl_idx = 0;
        for (let i = last_dl_idx; i < chapter_urls.length; i++) {
            var doc = await dl_chapter(chapter_urls[i]);
            let r = htmlToNovel(doc, false, true);
            ctx_arr[i] = r[0] + "\n" + r[1];
        }
    }
    dl_func().then(() => {
        for (let i = 0; i < ctx_arr.length; ++i) {
            ctx = ctx + "\n\n\n\n\n第" + i + "部分" + ctx_arr[i];
        }
        createAndDownloadFile(title, ctx)
    });
}

function createButton(container: HTMLDivElement, label: string, action) {
    var btn = document.createElement("input");
    btn.type = "button";
    btn.value = label;
    btn.addEventListener("click", action);
    container.appendChild(btn);
}

export function search_page_inject() {
    var container = document.createElement('div');
    // container.style.position = 'fixed';
    // container.style.top = "0";
    // container.style.left = "0";

    createButton(container, "dl-All", dl_all);
    createButton(container, "dl-all-in-a-file", dl_all_single_file);
    var root = document.querySelector(QueryStrings.searchPage.buttonContainerPc);
    console.log(root);

    insertChild(root, container);
    add_download_buttons();
}