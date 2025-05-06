import { createAndDownloadFile, get_device_type, pure_title } from "./util";
import { hooks } from "./config";

let is_mobile = get_device_type();
let config = is_mobile ? hooks.novelPage.mb : hooks.novelPage.pc;

function getCardText(card: Element): string {
    var ctx: string = "";
    var white_tag_list = ["P", "BR"];

    var elements = card.childNodes;
    var accept = function (e: Element) {
        if (e.nodeType == 3) return true;
        else if (e.nodeType == 1 && (white_tag_list.some(x => x == e.tagName))) return true;  // Text_Node or Element in white_list
        // else if (e.tagName == "FONT" && e.getAttribute("color") == null) return true;

        return false;
    }
    elements.forEach((e_: ChildNode) => {
        var e = e_ as Element;
        if (accept(e)) {
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
    return ctx;
}


function create_download_button() {
    const container = document.createElement('div');
    if (is_mobile) {
        container.classList.add("col");
        container.classList.add("footer-col");
    }
    // 将 div 元素添加到页面的 body 中
    document.body.appendChild(container);
    const button = document.createElement('input');
    button.type = 'button';
    button.textContent = 'Save';
    // 为按钮添加点击事件监听器
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

        const card_toolbar = document.createElement('div');
        card_toolbar.appendChild(checkbox);

        div.prepend(checkbox);
    });
    // 第一个checkbox默认选中
    var first_checkbox = posts[0].lastElementChild as HTMLInputElement;
    first_checkbox.checked = true;
}

function save() {
    var _title = document.querySelector(config.title)?.textContent;
    let title = pure_title(_title != null ? _title : document.title);
    let posts = document.querySelectorAll(config.posts);
    let ctx = "";

    // 保存所有checkbox选中的post
    posts.forEach((post) => {
        const checkbox = post.lastElementChild as HTMLInputElement;
        if (checkbox && checkbox.checked) {
            let text = getCardText(post);
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