import './style.css'
import { novel_page_setup } from "./novel_page";
import { oldNovelPageSetup } from './old_novel_page';

console.log(location.href);

if (location.href.search("thread") > 0) {
    novel_page_setup();
} else if (location.href.search("fid=359") > 0) {
    console.log("旧文展览馆");
    oldNovelPageSetup();
}