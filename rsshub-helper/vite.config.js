import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.js",
      userscript: {
        name: "RSSHub Helper",
        namespace: "atcra",
        version: "1.0.0",
        author: "atcra",
        description:
          "在 RSSHub 文档页面中提供自定义域名路由生成和参数填写功能",
        icon: "https://docs.rsshub.app/logo.png",
        match: ["https://docs.rsshub.app/routes/*"],
        grant: ["GM_setValue", "GM_getValue", "GM_addStyle"],
        "run-at": "document-idle",
        updateURL: "https://raw.githubusercontent.com/csmtc/web-scripts/main/rsshub-helper/dist/rsshub-helper.user.js",
        downloadURL: "https://raw.githubusercontent.com/csmtc/web-scripts/main/rsshub-helper/dist/rsshub-helper.user.js",
      },
    }),
  ],
});
