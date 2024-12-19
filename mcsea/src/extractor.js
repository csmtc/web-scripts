import { translateDOM } from "./utils/translate.js"


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

/**
 * 检查文章是否为免费文章或是已购买文章
 */
function is_paid(doc = document) {
    return doc.querySelector("a.y.viewpay") === null;
}

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


/**
 * 检测到目标结点发生更新时，重新刷新内容
 * @param {Element} targetNode
 */
function observeCtxUpdate(targetNode, novel_data) {
    // 创建一个观察器实例并监听`targetNode`元素的变动
    let update_cnt = 0;
    function do_update(mutationsList = null, observer = null) {
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
 * 从指定Document中抓取小说数据
 * @param {Document} doc 
 * @param {boolean} is_pc 
 * @returns 
 */
export function extractNovelData(doc, is_pc) {
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
