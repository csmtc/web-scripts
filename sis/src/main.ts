import './style.css'
import { novel_page_setup } from "./novel_page";

console.log(location.href);

if (location.href.search("thread") > 0) {
    novel_page_setup();
}