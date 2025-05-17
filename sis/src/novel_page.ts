import { get_device_type, getPost, createAndDownloadFile } from "./util";
import { hooks } from "./config";

function save(document: Document, is_mobile: boolean = get_device_type()) {
    var { title, content: ctx } = getPost(document, is_mobile);

    console.log("下载章节：" + title);
    console.log(ctx)
    createAndDownloadFile(title + ".txt", ctx);
}



function create_download_button() {
    var is_mobile = get_device_type();
    var config = hooks.novelPage[is_mobile ? "mb" : "pc"];
    const container = document.createElement('div');
    if (is_mobile) {
        container.classList.add("col");
        container.classList.add("footer-col");
    } else {
        container.classList.add("fixed-toolbar-pc");
    }
    const button = document.createElement('input');
    button.type = 'button';
    button.value = '下载';
    button.classList.add('float-button');
    button.addEventListener('click', () => save(document));
    container.appendChild(button);

    document.querySelector(config.toolBar)?.appendChild(container);
}

function create_checkboxs() {
    var config = hooks.novelPage[get_device_type() ? "mb" : "pc"];
    var posts = document.querySelectorAll(config.posts);
    // 为每个 post 添加复选框
    posts.forEach((div) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.innerText = '';
        const label = document.createElement("span");
        label.textContent = '下载本楼 ';

        const card_toolbar = document.createElement('div');
        card_toolbar.appendChild(label);
        card_toolbar.appendChild(checkbox);

        div.prepend(card_toolbar);
    });
    // 第一个checkbox默认选中
    var first_checkbox = posts[0].querySelector("input[type='checkbox']") as HTMLInputElement;
    first_checkbox.checked = true;
}



export function novel_page_setup() {
    console.log("novel page");

    create_download_button();
    create_checkboxs();
}