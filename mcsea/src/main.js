
function assert(checkfunc, msg = "") {
    if (!checkfunc()) {
        window.alert(msg);
        throw new EvalError("Assert Failed." + msg);
    }
}
function assert_neq(obj, tgt, msg = "") {
    assert(() => obj !== tgt, msg);
}

let _first_log_timestamp = null;
function log_time_cost() {
    if (_first_log_timestamp == null) {
        _first_log_timestamp = new Date().getTime();
    } else {
        var cur = new Date().getTime();
        console.log("Time cost(ms):" + (cur - _first_log_timestamp));
    }
}



//============================简繁转换START=================================

import * as OpenCC from 'opencc-js';
const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });
function toSimplified(text) {
    return converter(text);
}
//功能：转换对象，使用递归，逐层剥到文本；
function translateDOM(fobj = document.body, t2s = true) {
    var objs = typeof (fobj) == "object" ? fobj.childNodes : document.body.childNodes;
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].nodeType === 3) {
            objs[i].textContent = toSimplified(objs[i].textContent);
        } else if (objs[i].nodeType === 1) {
            translateDOM(objs[i]);
        }
    }
}

//============================简繁转换END=================================




/**
 * 检测到目标结点发生更新时，重新刷新内容
 * @param {Element} targetNode
 */
function observeCtxUpdate(targetNode, novel_data) {

    /**
     * 调整正文内容格式
     * @param {string} mainText 
     * @returns {string} 格式化的正文内容
     */
    function prettify(mainText) {
        // 首行缩进2格，段落间空一行
        mainText = mainText.replace(/\n\s+/g, "\n\n\t");
        // console.log(mainText);
        return mainText
    }

    /**
     * 过滤目标结点的所有垃圾子节点
     * @param {Element} targetNode
     * @returns {Number} filtered_cnt 过滤的子结点个数
     */
    function filterTrashChildren(targetNode, class_names = "") {
        assert_neq(targetNode, null, "filter fail.targetNode is null.");
        assert_neq(targetNode.children, null, "filter fail.No children belong to targetNode.");
        // style:display:none
        // font.jammer
        class_names += "jammer|pstatus|blockcode";
        if (is_paid()) {
            class_names += "|locked";
        }
        function is_jammer(element) {
            return element.tagName == "font" ||
                element.className.search(class_names) >= 0 ||
                element.style.cssText.search("display:\\s*none") >= 0;
        };


        let filtered_trash_children_cnt = 0;
        /**
         * @param {Element} node
         */
        function iter(node) {
            if (node) {
                for (let i = 0; i < node.children.length;) {
                    let ch = node.children[i];
                    // console.log(!is_jammer(ch), ch.tagName, ch.className, ch.style.cssText);
                    if (is_jammer(ch)) {
                        node.removeChild(ch);
                        ++filtered_trash_children_cnt;
                    } else {
                        iter(ch); ++i;
                    }
                }
            }
        }
        iter(targetNode);
        // console.info("Filter trash nodes cnt=" + filtered_trash_children_cnt);

        return filtered_trash_children_cnt;
    }


    // 创建一个观察器实例并监听`targetNode`元素的变动
    let update_cnt = 0;
    const do_update = (mutationsList = null, observer = null) => {
        if (filterTrashChildren(targetNode) || update_cnt === 0) {
            translateDOM(targetNode);
            let text = targetNode.textContent;
            novel_data.mainText = prettify(text);
            ++update_cnt;
            console.info("Ctx Update times:" + update_cnt + "Now word cnts = ", novel_data.mainText.length);
            log_time_cost();
        }
    }
    const observer = new MutationObserver(do_update);
    // 观察器的配置（需要观察什么变动）
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(targetNode, config);
    do_update();
}


/**
 * 检查文章是否为免费文章或是已购买文章
 */
function is_paid(doc = document) {
    return doc.querySelector("a.y.viewpay") === null;
}
class NovelData {
    title = ""
    writer = ""
    postTime = new Date(0)
    mainText = ""
    getWriter() {
        return this.writer;
    }
    getTitle() {
        return this.title;
    }
    getMainText() {
        return this.getTitle() + "\nposton " + this.postTime + "\n" + this.mainText;
    }
}
function saveNovelData(data) {
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

    createAndDownloadFile(data.getTitle() + "-" + data.getWriter() + ".txt", data.getMainText());
}
/**
 * 从指定Document中抓取小说数据
 * @param {Document} doc 
 * @param {boolean} is_pc 
 * @returns 
 */
function extractNovelData(doc, is_pc) {
    let mainpost, data = new NovelData();
    if (is_pc) {
        mainpost = doc.querySelector("td[id^=postmessage_]");
        data.writer = doc.querySelector("a.xw1[href*=space]").textContent;
        data.postTime = doc.querySelector("em[id^=authorposton]").textContent;
        data.title = doc.querySelector("#thread_subject").textContent;
    } else {
        mainpost = doc.querySelector("#ainuoloadmore .message");
        data.writer = doc.querySelectorAll("a[href*=space]")[2].textContent;
        data.postTime = doc.querySelector("div.ainuo_avatar.cl > div.info.cl > div > span").textContent;
        data.title = doc.querySelector(".tit.cl>h1").textContent;
    }
    assert_neq(mainpost, null, "Mainpost is null.");
    assert(() => typeof (data.title) === "string" && data.title.length > 0, "Match title failed.");
    let postTimeMatch = data.postTime.match(/20\d{2}-\d{1,2}-\d{1,2}/);
    if (postTimeMatch) data.postTime = postTimeMatch[0];
    observeCtxUpdate(mainpost, data);

    return data;
}

/**
 * 在小说阅读页面过滤乱码，追加下载按钮
 */
function novel_page_handle() {
    let novel_data = extractNovelData(document, is_pc);
    function download_cb() {
        saveNovelData(novel_data);
    };
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

function writer_page_handle() {

    /**
    * 异步载入网页
    * @param {string} url 
    */
    async function xhr_get(url) {
        const promise = new Promise((resolve, reject) => {
            let headers = {
                // "referer": document.location.href,
                // 'User-Agent': navigator.userAgent,
                // "cookie": document.cookie,
                'Content-Type': 'text/html;charset=utf-8',
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-CN,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1",
            }
            // USE XHR
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            for (let key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
                    resolve(doc);
                }
            }
            xhr.send();
        })
        return promise;
    }

    function createButton(url) {
        let btn = document.createElement("input");
        btn.type = "button";
        btn.value = "下载";
        btn.addEventListener("click", async () => {
            let doc = await xhr_get(url);
            let novel_data = extractNovelData(doc, is_pc);
            if (is_paid(doc)) {
                // console.log(novel_data);
                saveNovelData(novel_data);
            } else {
                btn.value = "未购买";
                btn.checked = true;
            }

        })
        return btn;
    }
    if (is_pc) {
        let table = document.querySelector("#delform tbody");
        for (let i = 1; i < table.children.length; ++i) {
            let th = table.children[i].querySelector("th");
            let btn = createButton(th.firstElementChild.href);
            th.insertBefore(btn, th.firstChild);
        }
    } else {
        let postlist = document.querySelector(".ainuo_piclist ul");
        for (let c of postlist.children) {
            let a = c.querySelector("a.litwo"); c.removeChild(a);
            let btn = createButton(a.href);
            let box = a.firstElementChild; a.removeChild(box);
            let tbox = box.lastElementChild; box.removeChild(tbox);
            a.appendChild(tbox);
            box.appendChild(a); box.appendChild(btn);
            c.appendChild(box);

        }
    }
}

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