import { GM_registerMenuCommand, GM_unregisterMenuCommand, GM_getValue, GM_setValue } from "vite-plugin-monkey/dist/client"

class McseaConfig {
    filterCite: boolean = GM_getValue("filterCite", true)
    richContextType: "plain" | "zip" | "makedown" | "html" = GM_getValue("richContextType", "zip")
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
        GM_setValue("filterCite", config.filterCite);
    }),
    new MenuItem(() => `纯文本下载格式 ${config.richContextType === "plain" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.richContextType = "plain"
        GM_setValue("richContextType", config.richContextType)
    }),
    new MenuItem(() => `MD+图ZIP格式 ${config.richContextType === "zip" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.richContextType = "zip"
        GM_setValue("richContextType", config.richContextType)
    }),
    new MenuItem(() => `内嵌MD下载格式 ${config.richContextType === "makedown" ? "✔️" : "⭕"}`, (item: MenuItem) => {
        config.richContextType = "makedown"
        GM_setValue("richContextType", config.richContextType)
    }),
);



function update() {
    for (let menu of menuitems) {
        if (menu.command_id) GM_unregisterMenuCommand(menu.command_id);
        menu.command_id = GM_registerMenuCommand(menu.cal_title(), menu.callback);
        // console.log(`config:${menu.cal_title}`);
    }
}

update();

