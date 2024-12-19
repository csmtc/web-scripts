/**
 * 在小说阅读页面过滤乱码，追加下载按钮
 */
function novel_page_handle() {
    let novel_data = extractNovelData(document, is_pc);
    function download_cb() {
        saveNovelData(novel_data);
    };
    // 附加下载按钮
    let container;
    let btn = document.createElement('a');
    btn.innerText = "DL"; btn.style.display = "block";
    btn.style.fontWeight = "bold"; btn.style.backgroundColor = "pink"; btn.style.color = "white";
    btn.href = "javascript:void(0)"; btn.addEventListener("click", download_cb);

    if (is_pc) {
        container = document.createElement("li");
        document.querySelector(".pls.favatar").lastElementChild.appendChild(container);
    } else { // Mobile
        container = document.querySelector("#ainuo_quick_bot");
        btn.classList.add("ainuo_quick_post");
        container.removeChild(container.firstElementChild);
    }
    container.appendChild(btn);
    // GM_registerMenuCommand('Download', download_cb);
}