
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
    const regex = /^([^-]+)/;
    const match = title.match(regex);
    return match ? match[1].trim() : title;
}