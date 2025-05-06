import { novel_page_setup } from "./novel_page";

console.log(location.href);

try {
    if (/viewthread/.test(location.href)) {
        novel_page_setup();
    }
} catch (e) {
    alert(e)
}