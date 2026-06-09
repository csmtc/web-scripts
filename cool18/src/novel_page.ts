import { htmlToNovel } from "./util";

export function novel_page_inject() {
    // 创建悬浮工具栏容器
    var toolbar = document.createElement('div');
    toolbar.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: rgba(0, 0, 0, 0.8);
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    `;

    // 下载按钮
    var btn = document.createElement('button');
    btn.textContent = "下载";
    btn.style.cssText = `
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
    `;
    btn.addEventListener("click", function () {
        htmlToNovel(document, true);
    });
    btn.addEventListener("mouseover", function () {
        btn.style.background = "#45a049";
    });
    btn.addEventListener("mouseout", function () {
        btn.style.background = "#4CAF50";
    });

    toolbar.appendChild(btn);
    document.body.appendChild(toolbar);
}