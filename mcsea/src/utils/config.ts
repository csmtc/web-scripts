import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "vite-plugin-monkey/dist/client"

class McseaConfig {
    filterCite: boolean = true
    downloadType: "auto" | "plain" | "html" | "makedown" = "auto"
    selector = {
        pc: {
            mainpost: "td[id^=postmessage_]",
            writer: "a.xw1[href*=space]",
            postTime: "em[id^=authorposton]",
            title: "#thread_subject"
        },
        mb: {
            mainpost: "#ainuoloadmore .message",
            writer: "#ainuoloadmore .info a[href*=space]",
            postTime: "#ainuoloadmore div.info.cl > div > span",
            title: ".tit.cl>h1"
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
            update();
        };
    }
}
let menuitems = Array.of(
    new MenuItem(() => `过滤免费引文 ${config.filterCite ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.filterCite = !config.filterCite;
    }),
    new MenuItem(() => `自动检测下载格式 ${config.downloadType === "auto" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.downloadType = "auto"
    }),
    new MenuItem(() => `纯文本下载格式 ${config.downloadType === "plain" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.downloadType = "plain"
    }),
    new MenuItem(() => `HTML下载格式 ${config.downloadType === "html" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.downloadType = "html"
    }),
    new MenuItem(() => `MD下载格式 ${config.downloadType === "makedown" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.downloadType = "makedown"
    }),
);



function update() {
    for (let menu of menuitems) {
        if (menu.command_id) GM_unregisterMenuCommand(menu.command_id);
        menu.command_id = GM_registerMenuCommand(menu.cal_title(), menu.callback);
        console.log(`config:${menu.cal_title}`);
    }
}

update();

