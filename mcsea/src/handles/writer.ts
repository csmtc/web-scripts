import { is_paid, extractNovelData } from "../extractor.js"
import { saveNovelData } from "../utils/save.js"

export function writer_page_handle(is_pc: boolean) {
    /**
    * 异步载入网页
    * @param {string} url 
    */
    async function xhr_get(url: string | URL) {
        const promise = new Promise((resolve, reject) => {
            let headers = {
                "referer": document.location.href,
                'User-Agent': navigator.userAgent,
                "cookie": document.cookie,
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

    function createButton(url: any) {
        let btn = document.createElement("input");
        btn.type = "button";
        btn.value = "下载";
        btn.addEventListener("click", async () => {
            let doc = await xhr_get(url) as Document;
            let promise = extractNovelData(doc, is_pc);
            if (is_paid(doc)) {
                // console.log(novel_data);
                promise.then((data) => { saveNovelData(data) });
            } else {
                btn.value = "未购买";
                btn.checked = true;
            }

        })
        return btn;
    }
    if (is_pc) {
        let table = document.querySelector("#delform tbody");
        for (let i = 1; i < table!.children.length; ++i) {
            let th = table!.children[i].querySelector("th");
            let btn = createButton((th!.firstElementChild as HTMLLinkElement).href);
            th!.insertBefore(btn, th!.firstChild);
        }
    } else {
        let postlist = document.querySelector(".ainuo_piclist ul");
        for (let c of postlist!.children) {
            let a = c.querySelector("a.litwo") as HTMLLinkElement;
            c.removeChild(a);
            let btn = createButton(a.href);
            let box = a.firstElementChild as HTMLElement;
            a.removeChild(box);
            let tbox = box.lastElementChild as HTMLElement;
            box.removeChild(tbox);
            a.appendChild(tbox);
            box.appendChild(a); box.appendChild(btn);
            c.appendChild(box);

        }
    }
}
