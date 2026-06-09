import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client"

export var QueryStrings = {
    novelPage: {
        mainText: "#content-section>pre",
        title: ".title-section",
        toolBar: ".subtitle-line>span:last-child"
    },
    mainPage: {
        listElements: "li a[href*='threadview']"
    },
    searchPage: {
        listElements: ".thread-list a[href*='threadview']",
        buttonContainer: ".page-title-right"
    }
}


/**
 * 创建并下载文件
 * @param {String} fileName 文件名
 * @param {BlobPart} data 文件内容
 * @param {String} type 文件MIME类型，默认为普通文本
 */
export function createAndDownloadFile(fileName: string, data: BlobPart, type: string = "text/plain;charset=utf-8") {
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
 *
 * @param {string} title
 */
export function pure_title(title: string): string {
    title.replace('.*【禁忌书屋】', "");
    title.replace('202[0-9]{1}.*', "");
    return title;
}






/**
 *
 * @param html
 * @param pageUrl
 * @param skip_header
 * @returns [title,context]
 */
export function htmlToNovel(doc: Document,
    is_create_file = false, skip_header = false): string[] {
    var config = QueryStrings.novelPage;

    // 标题在 .title-section 中，包含标题和发送者信息
    const titleSection = doc.querySelector(config.title);
    const titleText = titleSection?.textContent || "";
    // 提取第一行作为标题（去掉空白和发送者信息）
    const titleLines = titleText.split('\n').filter(line => line.trim().length > 0);
    let title = pure_title(titleLines[0]?.trim() || "未知标题");

    let main_node = doc.querySelector(config.mainText);
    if (main_node.childElementCount < 50) {
        main_node = doc.querySelector(".show_content>pre font");
    }

    let ctx = "";

    var white_tag_list = ["P", "BR"];

    var elements = main_node.childNodes;
    var accept = function (e: Element) {
        if (e.nodeType == 3) return true;
        else if (e.nodeType == 1 && (white_tag_list.some(x => x == e.tagName))) return true;  // Text_Node or Element in white_list
        else if (e.tagName == "FONT" && e.getAttribute("color") == null) return true;

        return false;
    }
    elements.forEach(e_ => {
        // console.log(accept(e),e,e.nodeType,e.tagName);
        var e = e_ as Element;
        if (accept(e as Element)) {
            var line = "";
            if (e.nodeType == 3) {  // text node
                if (skip_header) {
                    if (e.textContent.startsWith("　　")) skip_header = false;
                } else
                    line = e.textContent;
            } else if (e.nodeType == 1) {
                if (e.tagName == "P") {
                    line = e.textContent + "\n\n";
                } else if (e.tagName == "BR") {
                    line = "";
                } else {
                    line = e.textContent;
                }
            }

            ctx = ctx + line;
        }
    });

    console.log("下载章节：" + title);
    // console.log(ctx)
    if (is_create_file)
        createAndDownloadFile(title + ".txt", ctx);
    else
        return [title, ctx]
}


function send_request(requestBody) {
    GM_xmlhttpRequest(requestBody);
}


/**
 * @param {string} url 章节页面链接
 * @returns Promise<Document> 章节dom
 */
export function dl_chapter(url: string): Promise<Document> {
    return new Promise(function (resolve, reject) {
        let requestBody = {
            tryTimes: 0,
            method: 'GET',
            url: url,
            headers: {
                referer: url,
                "USER-AGENT": navigator.userAgent,
                'Content-Type': 'text/html;charset=' + document.characterSet,
            },
            timeout: 15000,
            overrideMimeType: 'text/html;charset=' + document.characterSet,
            onload: function (result) {
                var doc = new DOMParser().parseFromString(result.responseText, 'text/html')
                resolve(doc);
            },
            onerror: function (e) {
                console.warn('error:');
                console.log(e);
                reject()
            },
            ontimeout: function (e) {
                console.warn('timeout: times=' + this.tryTimes + ' url=' + url);
                //console.log(e);
                if (++this.tryTimes < 3) {
                    send_request(this);
                }
            }
        };
        send_request(requestBody);
    });
}



/**
 * 获得所有章节链接的<a>标签
 * @param doc Document
 * @returns Array<Element>标签Elements
 */
export function get_all_chapter_elements(doc: Document) {
    let arr = Array()
    let elements = doc.querySelectorAll(QueryStrings.searchPage.listElements);
    // 说明是MainPage
    if (elements.length != 0) {
        let filter_func = (e) => {
            if (e.getAttribute('href').match("keyword") != null) {
                return false;
            }
            return true;
        }
        elements.forEach((e) => { if (filter_func(e)) arr.push(e) });
    }
    else {
        elements = doc.querySelectorAll(QueryStrings.mainPage.listElements);
        elements.forEach((e) => arr.push(e));
    }
    arr.reverse();
    console.log("Get Chaps of " + doc.URL, elements);

    return arr;
}

// export function get_all_chapter_links(doc: Document) {
//     let links = get_all_chapter_elements(doc).map((e) => {
//         // console.log(e)
//         // console.log(e.getAttribute('href'))
//         return e.getAttribute('href');
//     })
//     return links;
// }

/**
 * 适用于搜索页和主页
 */
export function add_download_buttons() {
    let elements;
    elements = get_all_chapter_elements(document);


    elements.forEach(a => {
        let url = a.href
        let btn = document.createElement("input");
        btn.type = "button";
        btn.value = "下载";
        btn.addEventListener("click", function (evt) {
            dl_chapter(url).then(doc => {
                htmlToNovel(doc, true);
            });
        });
        a.parentElement.insertBefore(btn, a);
    })
    // console.log(chapter_urls);
}

/**
 * 将子结点插入到父结点中,并使其成为第一个子结点
 * @param parent 父结点
 * @param node 待插入的子结点
 */
export function insertChild(parent, node) {
    // 插入逻辑
    if (parent.firstChild) {
        // 如果父元素有子节点，插入到第一个子节点前
        parent.insertBefore(node, parent.firstChild);
    } else {
        // 如果父元素无子节点，直接追加
        parent.appendChild(node);
    }
}