// ==UserScript==
// @name         McseaDownloader
// @namespace    https://mcseas.club/
// @version      2024-03-18
// @description  try to take over the world!
// @author       You
// @match        https://mcseas.club/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mcseas.club
// @grant        GM_registerMenuCommand
// ==/UserScript==


(function () {
    'use strict';
    function assert(checkfunc, msg = "") {
        if (!checkfunc()) {
            window.alert(msg);
            throw new EvalError("Assert Failed." + msg);
        }
    }
    function assert_neq(obj, tgt, msg = "") {
        assert(() => obj !== tgt, msg);
    }

    /**
 * 创建并下载文件
 * @param {String} fileName 文件名
 * @param {String} content 文件内容
 * @param {String} type 文件MIME类型，默认为普通文本
 */
    function createAndDownloadFile(fileName, data, type = "text/plain;charset=utf-8") {
        // 创建Blob对象
        const blob = new Blob([data], { type: type });
        // 创建URL对象
        const url = URL.createObjectURL(blob);
        // 创建a标签
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        // 触发下载
        a.click();
        // 释放内存
        URL.revokeObjectURL(url);
    }


    /**
     * 过滤目标结点的所有垃圾子节点
     * @param {Element} targetNode
     * @returns {Number} filtered_cnt 过滤的子结点个数
     */
    let filtered_trash_children_cnt = -1;
    function filterTrashChildren(targetNode) {
        assert_neq(targetNode, null, "filter fail.targetNode is null.");
        assert_neq(targetNode.children, null, "filter fail.No children belong to targetNode.");
        // style:display:none
        // font.jammer
        let is_jammer = (element) => {
            return element.tagName == "font" ||
                element.className.search("jammer|pstatus|quote|blockcode") >= 0 ||
                element.style.cssText.search("display:\\s*none") >= 0;
        };
        /**
         *
         * @param {Element} node
         */
        function iter(node) {
            if (node) {
                for (let ch of node.children) {
                    // console.log(!is_jammer(ch), ch.tagName, ch.className, ch.style.cssText);
                    if (is_jammer(ch)) {
                        node.removeChild(ch);
                        ++filtered_trash_children_cnt;
                    } else {
                        iter(ch);
                    }
                }
            }
        }
        if (filtered_trash_children_cnt !== 0) {
            filtered_trash_children_cnt = 0;
            iter(targetNode);
            // console.info("Filter trash nodes cnt=" + filtered_trash_children_cnt);
        }
        return filtered_trash_children_cnt;
    }


    /**
     * 检测到目标结点发生更新时，重新刷新内容
     * @param {Element} targetNode
     */
    function observe_ctx_update(targetNode, novel_data) {
        // 观察器的配置（需要观察什么变动）
        const config = { attributes: true, childList: true, subtree: true };

        // 创建一个观察器实例并监听`targetNode`元素的变动
        const do_update = (mutationsList = null, observer = null) => {
            if (filterTrashChildren(targetNode)) {
                novel_data.mainText = novel_data.title + '\n' + targetNode.textContent;
                console.info("Ctx Update.Now word cnts=", novel_data.mainText.length);
            }
        }
        const observer = new MutationObserver(do_update);
        observer.observe(targetNode, config);
        do_update();
    }

    /**
     * 在小说阅读页面过滤乱码
     */
    function novel_page_handle() {
        let is_pc = !/Mobi|Android|iPhone/i.test(navigator.userAgent);
        var mainpost, novel_data = {
            title: "",
            mainText: ""
        };
        if (is_pc) {
            mainpost = document.querySelector("#postlist .t_f");
            novel_data.title = document.querySelector("#thread_subject").textContent;
        } else {
            mainpost = document.querySelector("#ainuoloadmore .message");
            novel_data.title = document.querySelector(".tit.cl>h1").textContent;
        }
        assert_neq(mainpost, null, "Mainpost is null.");
        assert(() => typeof (novel_data.title) === "string" && novel_data.title.length > 0, "Match title failed.")
        observe_ctx_update(mainpost, novel_data);
        let download_cb = () => { createAndDownloadFile(novel_data.title + ".txt", novel_data.mainText) };

        // 附加下载按钮
        let container;
        let btn = document.createElement('a');
        btn.innerText = "DL"; btn.style.display = "block";
        btn.style.fontWeight = "bold"; btn.style.backgroundColor = "pink"; btn.style.color = "white";
        btn.href = "javascript:void(0)"; btn.addEventListener("click", download_cb);

        if (is_pc) {
            container = document.createElement("li");
            document.querySelector(".pls.favatar").lastElementChild.appendChild(container);
        } else { // Mobile
            container = document.querySelector("#ainuo_quick_bot");
            btn.classList.add("ainuo_quick_post");
            container.removeChild(container.firstElementChild);
        }
        container.appendChild(btn);
        // GM_registerMenuCommand('Download', download_cb);
    }

    function main_page_handle(params) {
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
    if (location.href.search("https://mcseas.club/forum.php?mod=viewthread") >= 0) {
        console.info("McseaAssist:Novel Page");
        novel_page_handle();
    }
    // else if (/forum.php\/?$/.test(location.href)) {
    //     console.info("McseaAssist:Main Page");
    //     main_page_handle();
    // } else {
    //     console.info("McseaAssist:Other Page");
    //     novel_page_handle();
    // }
})();


