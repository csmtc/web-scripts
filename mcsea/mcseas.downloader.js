/**
 * 创建并下载文件
 * @param {String} fileName 文件名
 * @param {String} content 文件内容
 */
function createAndDownloadFile(fileName, content) {
    var aTag = document.createElement('a');
    var blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
}

function filterElements(){
    
}