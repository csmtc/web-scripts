import { toSimplified } from "./utils/translate.ts"
import { config } from "./utils/config.ts";
import { filterTrashChildren } from "./utils/purify.ts";

export class NovelData {
    downloadType = config.downloadType;

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

    mainText = mainText.replace(/([\u4e00-\u9fa5，—])\s+([\u4e00-\u9fa5—])/g, "$1$2");
    // console.log(mainText);
    return mainText
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
    // 将画布内容转换为 Base64 编码的字符串
    return new Promise((resolve, reject) => {
        resolve(dataURL);
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
async function extractRichContext(mainpost: HTMLElement, downloadType: "makedown" | "html" = "makedown"): Promise<string> {

    let LINE_FEED: string = "\\n";
    let getImgTag: (base64: string) => string
    if (downloadType === "html") {
        LINE_FEED = "<br>"
        getImgTag = (base64) => {
            return LINE_FEED + `<img src="${base64}">` + LINE_FEED
        }
    }
    else if (downloadType === "makedown") {
        LINE_FEED = "\n"
        getImgTag = (base64) => {
            return LINE_FEED + `![](${base64})` + LINE_FEED
        }
    }

    let imagePromises = Array<Promise<void>>();
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
                    imagePromises.push(p);
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
                    context += LINE_FEED + iter(node) + LINE_FEED;
                } else if (tagName === "br") {
                    context += LINE_FEED;
                } else if (tagName === "img") {
                    const base64 = imageCache.get((node as HTMLElement).id);
                    if (base64) {
                        context += getImgTag(base64);
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
    // console.log(imageCache.keys());

    let context = iter(mainpost);
    if (downloadType === "makedown") {
        context = prettify(context)
    }
    // console.log(context);
    return context;
}




async function extractNovelContext(mainpost: HTMLElement, data: NovelData = new NovelData()): Promise<NovelData> {
    filterTrashChildren(mainpost);
    let imgs = mainpost.querySelectorAll('img');
    function extractPlainContext() {
        data.downloadType = "plain"
        data.context = mainpost.textContent as string;
        data.context = prettify(data.context);
    }
    if (imgs.length == 0) {
        extractPlainContext();
    } else if (config.downloadType === "plain") {
        // 提取纯文本内容
        extractPlainContext();
    } else if (config.downloadType === "auto") {
        // 富文本内容
        data.downloadType = "makedown";
        data.context = await extractRichContext(mainpost, data.downloadType);
    } else if (config.downloadType === "html") {
        // 富文本内容
        data.downloadType = config.downloadType;
        data.context = await extractRichContext(mainpost, config.downloadType);
    } else if (config.downloadType === "makedown") {
        // 富文本内容
        data.downloadType = config.downloadType;
        data.context = await extractRichContext(mainpost, config.downloadType);
    }
    return data;
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
        mainpost = doc.querySelector(config.selector.pc.mainpost);
        writer = doc.querySelector(config.selector.pc.writer)?.textContent;
        postTime = doc.querySelector(config.selector.pc.postTime)?.textContent;
        title = doc.querySelector(config.selector.pc.title)?.textContent;
    } else {
        mainpost = doc.querySelector(config.selector.mb.mainpost);
        writer = doc.querySelector(config.selector.mb.writer)?.textContent;
        postTime = doc.querySelector(config.selector.mb.postTime)?.textContent;
        title = doc.querySelector(config.selector.mb.title)?.textContent;
    }
    if (mainpost === null) {
        throw new Error("extract mainpost fail.");
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

    return extractNovelContext(mainpost).then(data => {
        data.title = toSimplified(title), data.writer = writer as string, data.postTime = postTime as string;
        let postTimeMatch = data.postTime.match(/20\d{2}-\d{1,2}-\d{1,2}/);
        if (postTimeMatch) data.postTime = postTimeMatch[0];
        // observeCtxUpdate(mainpost, data);
        return data;
    });
}
