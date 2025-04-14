import { main_page_inject } from "./main_page";
import { novel_page_inject } from "./novel_page";
import { search_page_inject } from "./search_page";

var href = window.location.href;
if (href.search("view") > 0) {
    novel_page_inject();
} else if (href.search("keyword") > 0) {
    search_page_inject();
} else {
    main_page_inject();
}