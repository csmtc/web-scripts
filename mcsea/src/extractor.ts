import { toSimplified } from "./utils/translate.ts"
import { config } from "./utils/config.ts";
import { filterTrashChildren } from "./utils/purify.ts";

export class NovelData {
    downloadType = config.downloadType;

    title = "";
    writer: string = "";
    postTime: string = "";
    context = "";
    assets = new Map<string, Blob>(); // filename->blob
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
    mainText = mainText.replace(/([\u4e00-\u9fa5，—])\s*\n+\s*([\u4e00-\u9fa5—])/, "$1$2");
    // 移除多个连续换行
    mainText = mainText.replace(/(\n\s*){2,}/g, "\n\n");

    // console.log(mainText);
    return mainText
}


/*
 *  将img对象中的图像内容保存为二进制编码，返回新的img对象的HTML，要求图像已加载
 * @param {HTMLImageElement}img 
 * @returns {string} base64 编码后的图片
 */
async function getImageByRender(img: HTMLImageElement): Promise<Blob> {
    (img as HTMLImageElement).crossOrigin = 'anonymous';
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0, img.width, img.height);
    // 将画布内容转换为 Base64 编码的字符串
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob != null) {
                resolve(blob);
            } else {
                reject("image download fail");
            }
        }, "image/png")
    })
}
/**
 *  将在线img对象中的图像内容保存为二进制编码，返回新的img对象的HTML
 * @param {HTMLImageElement}img 
 * @returns {Blob} 图片的二进制数据
 */
async function getImageByFetch(img: HTMLImageElement, max_retry_times = 3): Promise<Blob> {
    let retrycnt = 0;
    let response: Response = await fetch(img.src);
    while (!response.ok && ++retrycnt <= max_retry_times) {
        console.log(`fetch ${img.src} fail,retry times:${retrycnt}.`);
        response = await fetch(img.src);
    }
    if (retrycnt > max_retry_times) {
        throw new Error(`Fetch ${img.src} fail.`)
    }
    const blob = await response.blob();
    return blob;
}



const getImage = getImageByFetch
const imageCache = new Map<string, Blob>(); // Img.id→base64Data

/**
 * 
 * @param root 提取root后代结点中所有的图片
 */
async function fetchImages(root: Element) {
    let imagePromises = Array<Promise<void>>();
    function fetchImages_(root: Element) {
        for (let node of root.children) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if ('img' === node.tagName.toLowerCase()) {
                    if (imageCache.has((node as HTMLImageElement).id))
                        continue;
                    let p = getImage(node as HTMLImageElement).then((imgBlob) => {
                        imageCache.set(
                            (node as HTMLImageElement).id, imgBlob
                        )
                    });
                    imagePromises.push(p);
                } else {
                    fetchImages_(node);
                }
            }
        }
    }
    fetchImages_(root);
    await Promise.all(imagePromises);
}

function getBase64(img: Blob) {
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.result)
            return reader.result?.toString();
        else
            throw new Error("image download fail");
    };
    reader.onerror = (error) => {
        throw new Error("image download fail" + error);
    };
    reader.readAsDataURL(img);
}
function getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/bmp": ".bmp",
        "image/svg+xml": ".svg",
    };
    return mimeToExt[mimeType] || ".png";
}

function extractRichContext(root: Node, getImgTag: (img: Blob) => string, LINE_FEED: string = "\n"): string {
    let context = "";
    for (let node of root.childNodes) {
        // console.log(node);
        if (node.nodeType === Node.TEXT_NODE) {
            context += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let tagName = (node as HTMLElement).tagName.toLowerCase();
            if (tagName === "p") {
                context += LINE_FEED + extractRichContext(node, getImgTag, LINE_FEED) + LINE_FEED;
            } else if (tagName === "br") {
                context += LINE_FEED;
            } else if (tagName === "img") {
                const img = imageCache.get((node as HTMLElement).id);
                if (img) {
                    context += getImgTag(img);
                } else {
                    console.log(`iter Error.${(node as HTMLElement).id} not found`);
                }
            } else {
                context += extractRichContext(node as HTMLElement, getImgTag, LINE_FEED);
            }
        }
    }
    return context;
}

/**
 * 若内容为纯文本则下载为纯文本
 * 其他情况按照Config的配置下载
 * @param mainpost 
 * @param data 
 * @returns 
 */
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
    } else {
        // 富文本内容
        let LINE_FEED: string = "\n";
        await fetchImages(mainpost);

        if (config.downloadType === "auto" || config.downloadType === "zip") {
            data.downloadType = "zip";
            let imgIDX = 0;
            let getImgTag = (img: Blob) => {
                let filename = ++imgIDX + getExtensionFromMimeType(img.type);
                data.assets.set(filename, img);
                console.log(`$cache:{filename},mime=${img.type}`);
                return LINE_FEED + `![](./assets/${filename})` + LINE_FEED;
            }
            data.context = extractRichContext(mainpost, getImgTag, LINE_FEED);
            data.context = prettify(data.context);
        } else if (config.downloadType === "makedown") {
            data.downloadType = "makedown";
            let getImgTag = (img: Blob) => {
                const base64 = getBase64(img);
                return LINE_FEED + `![](${base64})` + LINE_FEED
            }
            data.context = extractRichContext(mainpost, getImgTag, LINE_FEED);
            data.context = prettify(data.context);
        } else if (config.downloadType === "html") {
            data.downloadType = "html";
            LINE_FEED = "<br>";
            let getImgTag = (img: Blob) => {
                const base64 = getBase64(img);
                return LINE_FEED + `<img src="${base64}">` + LINE_FEED
            }
            data.context = extractRichContext(mainpost, getImgTag, LINE_FEED);
        }
    }
    return data;
}




/**
 * 从指定Document中抓取小说数据，存储格式由Config指定
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
        return data;
    });
}
