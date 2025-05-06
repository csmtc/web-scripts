import { createAndDownloadFile, get_device_type, pure_title } from "./util";
import { hooks } from "./config";

let is_mobile = get_device_type();
let config = is_mobile ? hooks.novelPage.mb : hooks.novelPage.pc;

function getPostText(post: Element): string {
    console.log("getPostText of", post);

    var ctx: string = "";
    var white_tag_list = ["P", "BR"];

    var elements = post.childNodes;
    var accept = function (e: Element) {
        if (e.nodeType == 3) return true;
        else if (e.nodeType == 1 && white_tag_list.some(x => x == e.tagName)) return true;  // Text_Node or Element in white_list
        // else if (e.tagName == "FONT" && e.getAttribute("color") == null) return true;

        return false;
    }
    elements.forEach((e_: ChildNode) => {
        var e = e_ as Element;
        if (accept(e)) {
            console.log(e);

            var line;
            if (e.nodeType == 3) {  // text node
                line = e.textContent;
            } else if (e.nodeType == 1) {
                if (e.tagName == "P") {
                    line = e.textContent + "\n\n";
                } else if (e.tagName == "BR") {
                    if (is_mobile) line = "\n";
                    else
                        line = "";
                } else {
                    line = e.textContent;
                }
            }
            if (line) {
                ctx += line;
            }
        }
    });
    var tail_index = ctx.lastIndexOf("[]");
    if (tail_index > 0) {
        ctx = ctx.substring(0, tail_index);
    }
    return ctx;
}


function create_download_button() {
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
    button.addEventListener('click', save);
    container.appendChild(button);

    document.querySelector(config.toolBar)?.appendChild(container);
}

function create_checkboxs() {
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

function save() {
    var _title = document.querySelector(config.title)?.textContent;
    let title = pure_title(_title != null ? _title : document.title);
    let posts = document.querySelectorAll(config.posts);
    let ctx = "";

    // 保存所有checkbox选中的post
    posts.forEach((post) => {
        const checkbox = post.querySelector("input[type=\"checkbox\"]") as HTMLInputElement;
        if (checkbox && checkbox.checked) {
            let text = getPostText(post);
            ctx += text;
        }
    });

    console.log("下载章节：" + title);
    console.log(ctx)
    createAndDownloadFile(title + ".txt", ctx);
}

export function novel_page_setup() {
    console.log("novel page");

    create_download_button();
    create_checkboxs();
}