
import { toSimplified } from "./utils/translate.js"
import { assert, assert_neq, log_time_cost } from './utils/assert.js';
import { extractNovelData, NovelData } from "./extractor.js"
import { saveNovelData } from "./utils/save.js"







function main_page_handle() {
    const do_filter = () => {
        let popup = document.querySelector("#append_parent");
        if (popup) { popup.remove(); }
    };
    const observer = new MutationObserver(() => {
        do_filter();
        observer.disconnect();
    });
    observer.observe(document.querySelector("#nv_forum"), { childList: true });
    do_filter();
}

let is_pc = !/Mobi|Android|iPhone/i.test(navigator.userAgent);
log_time_cost();
document.title = toSimplified(document.title);
if (/mod=viewthread/.test(location.href)) {
    console.info("McseaAssist:Novel Page");
    novel_page_handle();
} else if (/mod=space/.test(location.href)) {
    console.info("McseaAssist:Writer Page");
    writer_page_handle();
}
else if (/forum.php\/?$/.test(location.href) && /view=me/.test(location.href)) {
    console.info("McseaAssist:Main Page");
    main_page_handle();
}
else if (/^file/.test(location.href)) {
    console.info("McseaAssist:Other Page");
    novel_page_handle();
    // writer_page_handle()
}