// ==UserScript==
// @name         McseaDownloader
// @namespace    https://mcseas.club/
// @version      2024-03-16
// @description  try to take over the world!
// @author       You
// @match        https://mcseas.club/forum.php?mod=viewthread*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mcseas.club
// @grant        GM_registerMenuCommand
// ==/UserScript==


// ==UserScript==
// @name         McseaDownloader
// @namespace    https://mcseas.club/
// @version      2024-03-16
// @description  try to take over the world!
// @author       You
// @match        https://mcseas.club/forum.php?mod=viewthread*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mcseas.club
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

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
     * @param {Element} parent
     */
    function filterChildren(parent) {
        // style:display:none
        // font.jammer
        let is_jammer = (element) => {
            return element.tagName == "font" ||
                element.className.search("jammer|pstatus|quote|locked") >= 0 ||
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
                    } else {
                        iter(ch);
                    }
                }
            }
        }
        iter(parent);
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
            filterChildren(targetNode);
            novel_data.mainText = novel_data.title + '\n' + targetNode.textContent;
            console.log("Ctx Update.Now word cnts=", novel_data.mainText.length);
        }
        const observer = new MutationObserver(do_update);
        observer.observe(targetNode, config);
        do_update();
    }


    function main() {
        let dev_typ = 0; // 0:PC,1:Mobile
        var mainpost = document.querySelector("#postlist td.plc div.t_f");
        var novel_data = {
            title: "",
            mainText: ""
        };
        if (mainpost) {
            novel_data.title = document.querySelector("#thread_subject").textContent;
        } else {
            dev_typ = 1;
            mainpost = document.querySelector("#ainuoloadmore .message");
            novel_data.title = document.querySelector(".tit.cl>h1").textContent;
        }
        observe_ctx_update(mainpost, novel_data);
        let download_cb = () => { createAndDownloadFile(novel_data.title + ".txt", novel_data.mainText) };

        // 附加下载按钮
        let container;
        let btn = document.createElement('a');
        btn.innerText = "DL";
        btn.className = "collect";
        btn.addEventListener("click", download_cb);

        if (dev_typ === 1) { // Mobile
            container = document.querySelector("#ainuo_fpostbottom>ul li");
            container.removeChild(container.firstChild);
        } else {
            container = document.createElement("span");
            document.querySelector("#scrolltop").appendChild(container);
        }
        container.appendChild(btn);
        container.setAttribute("style", "background-color: pink");
        // GM_registerMenuCommand('Download', download_cb);
        console.log(novel_data.title, novel_data.mainText.length);
        console.log("Download Loaded.");

    }
    main();
})();


