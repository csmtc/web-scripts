import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client"
import { hooks, serverURL } from "./config";
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
 * @returns 是否为移动端,yes->移动端,no->pc端
 */
export function get_device_type() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

/**
 *
 * @param {string} title
 */
export function pure_title(title: string): string {
    title = title.replace(/[\\/:*?"<>|]/g, '');
    return title;
}

function getPostText(post: Element, is_mobile: boolean): string {
    console.log("getPostText of", post);

    var ctx: string = "";
    var white_tag_list = ["P", "BR"];

    var elements = post.childNodes;
    var accept = function (e: Element) {
        if (e.nodeType == 3) return true;
        else if (e.nodeType == 1 && white_tag_list.some(x => x == e.tagName)) return true;  // Text_Node or Element in white_list
        // else if (e.tagName == "FONT" && e.getAttribute("color") == null) return true;

        return false;
    }
    elements.forEach((e_: ChildNode) => {
        var e = e_ as Element;
        if (accept(e)) {
            // console.log(e);

            var line;
            if (e.nodeType == 3) {  // text node
                line = e.textContent;
            } else if (e.nodeType == 1) {
                if (e.tagName == "P") {
                    line = e.textContent + "\n\n";
                } else if (e.tagName == "BR") {
                    if (is_mobile) line = "\n";
                    else
                        line = "";
                } else {
                    line = e.textContent;
                }
            }
            if (line) {
                ctx += line;
            }
        }
    });
    var tail_index = ctx.lastIndexOf("[]");
    if (tail_index > 0) {
        ctx = ctx.substring(0, tail_index);
    }
    return ctx;
}

export function getPost(doc: Document, is_mobile: boolean = get_device_type()) {
    var config = hooks.novelPage[is_mobile ? "mb" : "pc"];
    var _title = doc.querySelector(config.title)?.textContent;
    let title = pure_title(_title != null ? _title : doc.title);
    let posts = doc.querySelectorAll(config.posts);
    let ctx = "";

    var first_checkbox = posts[0].querySelector("input[type='checkbox']") as HTMLInputElement;

    if (first_checkbox == null) {
        // 都没有复选框,默认下载第一个
        ctx = getPostText(posts[0], is_mobile);
    } else {
        posts.forEach((post) => {
            const checkbox = post.querySelector("input[type=\"checkbox\"]") as HTMLInputElement;
            if (checkbox && checkbox.checked) {
                let text = getPostText(post, is_mobile);
                ctx += text;
            }
        });
    }
    return { title: title, content: ctx };
}


/**
 * @param {string} url 章节页面链接
 * @returns Promise<Document> 章节dom
 */
export function download_page(url: string): Promise<Document> {
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
            onload: function (result: { responseText: string; }) {
                var doc = new DOMParser().parseFromString(result.responseText, 'text/html')
                resolve(doc);
            },
            onerror: function (e: any) {
                console.warn('error:');
                console.log(e);
                reject()
            },
            ontimeout: function () {
                console.warn('timeout: times=' + this.tryTimes + ' url=' + url);
                //console.log(e);
                if (++this.tryTimes < 3) {
                    GM_xmlhttpRequest(this);
                }
            }
        };
        GM_xmlhttpRequest(requestBody);
    });
}


export async function check_file_exists(
    filename: string,
    serverUrl: string = serverURL
): Promise<boolean> {
    try {
        // 发送GET请求
        return new Promise<boolean>((resolve) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: serverUrl + "/check_file",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ "filename": filename }),
                onload: function (response) {
                    console.log("check_file_exists", response.responseText);
                    let ans = JSON.parse(response.responseText);
                    resolve(ans.exists);
                }
                , onerror: function (error) {
                    console.error("Error checking file existence:", error);
                    // 出错时默认返回文件不存在
                    resolve(false);
                }
            })
        })
    } catch (error) {
        console.error("Error checking file existence:", error);
        // 出错时默认返回文件不存在
        return false;
    }
}

export async function send_file_to_server(fileName: string, content: string,
    serverUrl: string = serverURL) {
    return new Promise<boolean>((resolve) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: serverUrl + "/upload",
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify({ "filename": fileName, "content": content }),
            onload: function (response) {
                console.log("send_file_to_server", response.responseText);
                let ans = JSON.parse(response.responseText);
                if (ans.success) {
                    resolve(true);
                }
                else {
                    resolve(false);
                    console.log("Error uploading file:", ans.error);
                }

            }
        })
    })
}