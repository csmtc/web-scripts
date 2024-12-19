function saveNovelData(data) {
    /**
     * 创建并下载文件
     * @param {String} fileName 文件名
     * @param {String} content 文件内容
     * @param {String} type 文件MIME类型，默认为普通文本
     */
    function createAndDownloadFile(fileName, data, type = "text/plain;charset=utf-8") {
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

    createAndDownloadFile(data.getTitle() + "-" + data.getWriter() + ".txt", data.getMainText());
}