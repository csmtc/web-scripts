import { translateDOM, toSimplified } from "./utils/translate.ts"
import { assert_neq, log_time_cost } from "./utils/assert.js";
import { config } from "./utils/config.ts";

export class NovelData {
    isPlainText = true;

    title = "";
    writer: string = "";
    postTime: string = "";
    context = "";
    getWriter() {
        return this.writer;
    }
    getTitle() {
        return this.title;
    }
    getMainText() {
        var text = this.getTitle();
        if (this.postTime) {
            text += ("\nposton " + this.postTime);
        }
        text += this.context;
        return text;
    }
}


/**
 * 检查文章是否为免费文章或是已购买文章
 */
export function is_paid(doc = document) {
    return doc.querySelector("a.y.viewpay") === null;
}

/**
 * 调整正文内容格式
 * @param {string} mainText 
 * @returns {string} 格式化的正文内容
 */
function prettify(mainText: string): string {
    // 首行缩进2格，段落间空一行
    // mainText = mainText.replace(/\n\s+/g, "\n\n\t");
    // 移除连续中文之间的换行 
    // mainText = mainText.replace(/([\u4e00-\u9fa5，—])\n+\s*([\u4e00-\u9fa5—])/g, "$1$2");
    // console.log(mainText);
    return mainText
}


/**
* 过滤目标结点的所有垃圾子节点
* @param {Element} targetNode
* @returns {Number} filtered_cnt 过滤的子结点个数
*/
function filterTrashChildren(targetNode: Element, class_names = ""): number {
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

/*
 *  将img对象中的图像内容保存为二进制编码，返回新的img对象的HTML，要求图像已加载
 * @param {HTMLImageElement}img 
 * @returns {string} base64 编码后的图片
 */
async function getImageByRender(img: HTMLImageElement): Promise<string> {
    (img as HTMLImageElement).crossOrigin = 'anonymous';
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0, img.width, img.height);
    const dataURL = canvas.toDataURL();
    // const ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    // const dataURL = canvas.toDataURL("image/" + ext);
    // 将画布内容转换为 Base64 编码的字符串
    return new Promise((resolve, reject) => {
        resolve(dataURL);
        // canvas.toBlob(function (blob) {
        //     // 处理 blob 数据
        //     const dataURL = URL.createObjectURL(blob as Blob);
        //     resolve(dataURL);
        // }, "image/" + ext);
    })
}
/**
 *  将在线img对象中的图像内容保存为二进制编码，返回新的img对象的HTML
 * @param {HTMLImageElement}img 
 * @returns {string} base64 编码后的图片
 */
async function getImageByFetch(img: HTMLImageElement): Promise<string> {
    const response = await fetch(img.src);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result)
                resolve(reader.result?.toString());
            else
                reject("image download fail");
        };
        reader.onerror = (error) => reject("image download fail" + error);
        reader.readAsDataURL(blob);
    });
}
const getImage = getImageByFetch

const imageCache = new Map<string, string>(); // Img.id→base64Data
async function extractRichContext(mainpost: HTMLElement): Promise<string> {
    let imagePromises = Array<Promise<void>>()
    function fetchImages(root: Element) {
        for (let node of root.children) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if ('img' === node.tagName.toLowerCase()) {
                    if (imageCache.has((node as HTMLImageElement).id))
                        continue;

                    let p = getImage(node as HTMLImageElement).then((base64) => {
                        imageCache.set(
                            (node as HTMLImageElement).id, base64
                        )
                    });
                    imagePromises.push(p)

                } else {
                    fetchImages(node);
                }
            }
        }
    }

    function iter(root: Node): string {
        let context = "";
        for (let node of root.childNodes) {
            // console.log(node);
            if (node.nodeType === Node.TEXT_NODE) {
                context += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                let tagName = (node as HTMLElement).tagName.toLowerCase();
                if (tagName === "p") {
                    context += "<br>" + iter(node) + "<br>";
                } else if (tagName === "br") {
                    context += "<br>";
                } else if (tagName === "img") {
                    const base64 = imageCache.get((node as HTMLElement).id);
                    if (base64) {
                        context += `<img src="${base64}">`;
                        // debugger;
                    } else {
                        console.log(`iter Error.${(node as HTMLElement).id} not found`);
                    }
                } else {
                    context += iter(node as HTMLElement);
                }
            }
        }
        return context;
    }

    fetchImages(mainpost);
    await Promise.all(imagePromises);
    console.log(imageCache.keys());


    let context = iter(mainpost);
    // console.log(context);
    return context;
}

async function extractNovelContext(mainpost: HTMLElement, data: NovelData = new NovelData()): Promise<NovelData> {
    filterTrashChildren(mainpost);
    let imgs = mainpost.querySelectorAll('img');
    if ((config.downloadType === "auto" && imgs.length == 0) || config.downloadType === "plain") {
        // 提取纯文本内容
        data.context = mainpost.textContent as string;
        data.context = prettify(data.context);
    } else {
        data.isPlainText = false;
        data.context = await extractRichContext(mainpost);
    }
    return data;
}


/**
 * 检测到目标结点发生更新时，重新刷新内容
 * @param {HTMLElement} targetNode
 */
function observeCtxUpdate(targetNode: HTMLElement, novel_data: NovelData) {
    let update_cnt = 0;
    // 创建一个观察器实例并监听`targetNode`元素的变动
    function do_update(mutationsList, observer: MutationObserver) {
        if (filterTrashChildren(targetNode) || update_cnt === 0) {
            observer.disconnect();
            translateDOM(targetNode);
            extractNovelContext(targetNode, novel_data);
            ++update_cnt;
            console.info("Ctx Update times:" + update_cnt + "Now word cnts = ", novel_data.context.length);
            log_time_cost();
            observer.observe(targetNode, config);
        }
    }
    const observer = new MutationObserver(do_update);
    // 观察器的配置（需要观察什么变动）
    const config = { attributes: true, childList: true, subtree: true };
    do_update(null, observer);
}





/**
 * 从指定Document中抓取小说数据
 * @param {Document} doc 
 * @param {boolean} is_pc 
 * @returns {NovelData} data
 */
export async function extractNovelData(doc: Document, is_pc: boolean): Promise<NovelData> {
    let mainpost: HTMLElement | null;
    let writer: string | null | undefined, postTime: string | null | undefined, title: string | any[] | null | undefined;

    if (is_pc) {
        mainpost = doc.querySelector("td[id^=postmessage_]");
        writer = doc.querySelector("a.xw1[href*=space]")?.textContent;
        postTime = doc.querySelector("em[id^=authorposton]")?.textContent;
        title = doc.querySelector("#thread_subject")?.textContent;
    } else {
        mainpost = doc.querySelector("#ainuoloadmore .message");
        writer = doc.querySelectorAll("a[href*=space]")[2].textContent;
        postTime = doc.querySelector("div.ainuo_avatar.cl > div.info.cl > div > span")?.textContent;
        title = doc.querySelector(".tit.cl>h1")?.textContent;
    }
    if (writer === null) {
        throw new Error("extract writer fail.");
    }
    if (postTime === null) {
        throw new Error("extract postTime fail.");
    }
    if (title === null) {
        throw new Error("extract title fail.");
    }
    if (!(typeof mainpost?.textContent === "string" && mainpost.textContent.length > 0)) {
        throw new Error("extract mainpost fail.");
    }

    return extractNovelContext(mainpost).then(data => {
        data.title = toSimplified(title), data.writer = writer as string, data.postTime = postTime as string;
        let postTimeMatch = data.postTime.match(/20\d{2}-\d{1,2}-\d{1,2}/);
        if (postTimeMatch) data.postTime = postTimeMatch[0];
        // observeCtxUpdate(mainpost, data);
        return data;
    });
}

