
import { NovelData } from "../extractor";

/**
 * 
 * @param {NovelData} data 
 */
export function saveNovelData(data: NovelData) {
    /**
     * 创建并下载文件
     * @param {String} fileName 文件名
     * @param {BlobPart} data 文件内容
     * @param {String} type 文件MIME类型，默认为普通文本
     */
    function createAndDownloadFile(fileName: string, data: BlobPart, type: string = "text/plain;charset=utf-8") {
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
    if (data.isPlainText) {
        createAndDownloadFile(data.getTitle() + "-" + data.getWriter() + ".txt", data.getMainText());
    } else {
        let title = data.getTitle() + "-" + data.getWriter()
        const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>

        </head>
        <body>
            <div id="savedContent" ">${data.getMainText()}</div>
        </body>
        </html>
        `;
        createAndDownloadFile(title + ".html", fullHtml, "text/html;charset=utf-8");
    }
}