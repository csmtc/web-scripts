

export function main_page_handle() {
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