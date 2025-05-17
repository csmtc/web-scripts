
import { hooks } from "./config";
import { check_file_exists, download_page, get_device_type, getPost, send_file_to_server } from "./util";

const config = hooks.oldNovelPage.pc;
const posts = document.querySelectorAll(config.posts);

function interface_init() {
    const container = document.createElement('div');
    container.classList.add("fixed-toolbar-pc");
    const btn_save_all = document.createElement("button");
    btn_save_all.classList.add("float-button");
    btn_save_all.textContent = "保存所有";
    btn_save_all.onclick = save_all_posts;
    container.appendChild(btn_save_all);
    document.querySelector(config.toolBar)?.appendChild(container);
    add_save_buttons();
}

function add_save_buttons() {
    posts.forEach((post) => {
        let btn = document.createElement("a");
        btn.textContent = "Save";
        btn.classList.add("save-button-pc");
        btn.onclick = () => {
            save_post(post as HTMLLinkElement)
        };
        let common = post.parentElement?.parentElement;
        if (common) {
            common.appendChild(btn);
        }
    })
}

async function save_post(post: HTMLLinkElement) {
    let status = document.createElement("span");
    status.classList.add("status-bar-pc");
    post.parentElement?.appendChild(status);
    var title = post.textContent;
    if (title != null) {
        console.log(title, post.href);
        if (await check_file_exists(title)) {
            console.log(title + " 已存在");
            status.textContent = "文件存在";
        } else {
            status.textContent = "正在解析";
            let doc = await download_page(post.href);

            let { title: _, content } = getPost(doc, false);
            status.textContent = "解析成功";
            // console.log(title, content);

            send_file_to_server(title, content).then((res) => {
                if (res) {
                    status.textContent = "保存成功";
                } else {
                    status.textContent = "保存失败";
                }
            })
        }
    }
}

async function save_all_posts() {
    for (const post of posts) {
        await save_post(post as HTMLLinkElement);
    }
}

export function oldNovelPageSetup() {
    if (get_device_type()) throw new Error("This function is only for pc");
    interface_init();
}