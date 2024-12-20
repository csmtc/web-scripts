import { is_paid } from "../extractor";
import { assert_neq, log_time_cost } from "./assert";
import { config } from "./config";


/**
* 过滤目标结点的所有垃圾子节点
* @param {Element} targetNode
* @returns {Number} filtered_cnt 过滤的子结点个数
*/
export function filterTrashChildren(targetNode: Element, class_names = ""): number {
    assert_neq(targetNode, null, "filter fail.targetNode is null.");
    assert_neq(targetNode.children, null, "filter fail.No children belong to targetNode.");
    // style:display:none
    // font.jammer
    class_names += "jammer|pstatus|blockcode";
    if (config.filterCite) {
        class_names += "|quote";
    }
    if (is_paid()) {
        class_names += "|locked";
    }
    function is_jammer(element: Element) {
        return element.tagName == "font" ||
            element.className.search(class_names) >= 0 ||
            (element as HTMLElement).style.cssText.search("display:\\s*none") >= 0;
    };


    let filtered_trash_children_cnt = 0;
    /**
     * @param {Element} node
     */
    function iter(node: Element) {
        if (node) {
            for (let i = 0; i < node.children.length;) {
                let ch = node.children[i] as HTMLElement;
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
 * @param {HTMLElement} targetNode
 */
export function observeCtxUpdate(targetNode: HTMLElement, func: () => void) {
    let update_cnt = 0;
    // 创建一个观察器实例并监听`targetNode`元素的变动
    function do_update(mutationsList, observer: MutationObserver) {
        if (update_cnt === 0 || filterTrashChildren(targetNode)) { // 若有变化
            observer.disconnect();
            func();
            ++update_cnt;
            console.info("Ctx Update times:" + update_cnt);
            log_time_cost();
            observer.observe(targetNode, config);
        }
    }
    const observer = new MutationObserver(do_update);
    // 观察器的配置（需要观察什么变动）
    const config = { attributes: true, childList: true, subtree: true };
    do_update(null, observer);
}

