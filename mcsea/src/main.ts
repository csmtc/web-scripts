
import { toSimplified } from "./utils/translate.ts"
import { log_time_cost } from './utils/assert.js';

import { writer_page_handle } from "./handles/writer.js"
import { main_page_handle } from "./handles/mainpage.js";
import { novel_page_handle } from "./handles/novel.js"
import { Config } from "./utils/config.ts"


let is_pc = !/Mobi|Android|iPhone/i.test(navigator.userAgent);
log_time_cost();
document.title = toSimplified(document.title);
if (/mod=viewthread/.test(location.href)) {
    console.info("McseaAssist:Novel Page");
    novel_page_handle(is_pc);
} else if (/mod=space/.test(location.href)) {
    console.info("McseaAssist:Writer Page");
    writer_page_handle(is_pc);
}
else if (/forum.php\/?$/.test(location.href) && /view=me/.test(location.href)) {
    console.info("McseaAssist:Main Page");
    main_page_handle();
}
else if (/^file/.test(location.href)) {
    console.info("McseaAssist:Other Page");
    novel_page_handle(is_pc);
    // writer_page_handle()
}