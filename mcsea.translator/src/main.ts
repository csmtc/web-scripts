

import * as OpenCC from 'opencc-js';
import { GM_getValue, GM_registerMenuCommand, GM_setValue, GM_unregisterMenuCommand } from "vite-plugin-monkey/dist/client"

class McseaConfig {
    lang: "simplified" | "traditional" = GM_getValue("lang", "simplified");
    selector = {
        pc: {
            mainpost: "td[id^=postmessage_]",
        },
        mb: {
            mainpost: "#ainuoloadmore .message",
        }
    }
}
export let config = new McseaConfig();



class MenuItem {
    cal_title: () => string
    callback: () => void
    command_id: string | undefined
    constructor(title_: () => string, callback_: (item: MenuItem) => void) {
        this.cal_title = title_;
        this.callback = () => {
            callback_(this);
            update_menu();
        };
    }
}
let menuitems = Array.of(
    new MenuItem(() => `设为简体 ${config.lang === "simplified" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.lang = "simplified";
        GM_setValue("lang", config.lang);
        translateDOM(document);
    }),
    new MenuItem(() => `设为繁体 ${config.lang === "traditional" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.lang = "traditional";
        GM_setValue("lang", config.lang);
        translateDOM(document);
    }),
);

function update_menu() {
    for (let menu of menuitems) {
        if (menu.command_id) GM_unregisterMenuCommand(menu.command_id);
        menu.command_id = GM_registerMenuCommand(menu.cal_title(), menu.callback);
        // console.log(`config:${menu.cal_title}`);
    }
}

/**
 * 检测到目标结点发生更新时，重新刷新内容
 * @param {HTMLElement} targetNode
 */
export function observeCtxUpdate(targetNode: HTMLElement, func: () => void) {
    let update_cnt = 0;
    // 创建一个观察器实例并监听`targetNode`元素的变动
    function do_update(mutationsList, observer: MutationObserver) {
        observer.disconnect();
        setTimeout(() => {
            func();
            ++update_cnt;
            console.info("Ctx Update times:" + update_cnt);
            observer.observe(targetNode, config);
        }, 200);
    }
    const observer = new MutationObserver(do_update);
    // 观察器的配置（需要观察什么变动）
    const config = { attributes: true, childList: true, subtree: true };
    do_update(null, observer);
}



export const t2s = OpenCC.Converter({ from: 'tw', to: 'cn' });
export const s2t = OpenCC.Converter({ from: 'cn', to: 'tw' });
//功能：转换对象，使用递归，逐层剥到文本；
function get_translator() {
    return config.lang === "simplified" ? t2s : s2t;
}
export function translateDOM(fobj: Node = document.body) {
    var objs = typeof (fobj) == "object" ? fobj.childNodes : document.body.childNodes;
    const translate = get_translator();

    document.title = translate(document.title);
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].nodeType === 3) {
            objs[i].textContent = translate(objs[i].textContent);
        } else if (objs[i].nodeType === 1) {
            translateDOM(objs[i]);
        }
    }
}



update_menu();
let is_pc = !/Mobi|Android|iPhone/i.test(navigator.userAgent);
if (/mod=viewthread/.test(location.href)) {
    console.info("McseaAssist:Novel Page");
    let mainpost: any;
    if (is_pc) {
        mainpost = document.querySelector(config.selector.pc.mainpost);
    } else {
        mainpost = document.querySelector(config.selector.mb.mainpost);
    }
    observeCtxUpdate(mainpost, () => {
        console.log("translate:" + config.lang);
        translateDOM(mainpost);
    })
} else {
    let body = document.querySelector("body") as HTMLElement;
    observeCtxUpdate(body, () => {
        translateDOM(body);
    })
}