# RSSHub Helper

Tampermonkey 油猴脚本，在 [RSSHub](https://docs.rsshub.app) 文档页面上提供自定义域名路由生成和参数填写功能。

## 功能

- **自定义域名** — 设置你自托管的 RSSHub 实例地址（如 `https://rss.atcra.top`），生成的 URL 自动拼接该域名
- **路由检测** — 自动识别页面中的所有路由路径和参数
- **参数填写** — 为每个路由的 required / optional 参数提供输入框，实时生成完整 URL
- **一键复制** — 点击复制按钮即可将生成的 URL 复制到剪贴板
- **SPA 支持** — 兼容 VitePress 客户端路由切换，页面跳转后自动重新检测
- **暗色模式** — 自动跟随 RSSHub 文档站的明/暗主题
- **可拖拽** — 面板可通过标题栏拖拽移动，支持最小化

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 打开脚本安装链接：

   ```
   https://raw.githubusercontent.com/csmtc/web-scripts/main/rsshub-helper/dist/rsshub-helper.user.js
   ```

3. Tampermonkey 会弹出安装确认页面，点击「安装」即可
4. 后续更新会通过 Tampermonkey 自动检查

## 使用

1. 访问 [RSSHub 文档](https://docs.rsshub.app/routes/) 中任意路由页面（如 `/routes/cool18`）
2. 页面右上角会出现浮动面板
3. 在 **Your RSSHub Domain** 输入框中填入你的 RSSHub 域名，点击 **Apply**
4. 展开路由卡片，填写参数，下方实时显示生成的完整 URL
5. 点击复制按钮即可使用

## 示例

| 路由 | 域名 | 填入参数 | 生成结果 |
|------|------|----------|----------|
| `/cool18/:id?/:type?/:keyword?` | `https://rss.atcra.top` | id=bbs4, type=gold | `https://rss.atcra.top/cool18/bbs4/gold` |
| `/bilibili/user/video/:uid/:disableEmbed?` | `https://rsshub.app` | uid=12345 | `https://rsshub.app/bilibili/user/video/12345` |

## 技术栈

- **Vite** + **vite-plugin-monkey** — 构建用户脚本
- **Vanilla JS** — 零依赖，纯原生实现
- **GM API** — `GM_setValue` / `GM_getValue` 跨会话持久化，`GM_addStyle` 注入样式

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（热更新）
pnpm run dev

# 构建产物
pnpm run build
```

构建产物位于 `dist/rsshub-helper.user.js`。

## 项目结构

```
rsshub-helper/
├── src/
│   ├── main.js          # 脚本主逻辑
│   └── style.css        # 面板样式
├── dist/
│   └── rsshub-helper.user.js  # 构建产物（可直接安装）
├── vite.config.js       # Vite + monkey 插件配置
├── package.json
└── README.md
```

## License

AGPL-3.0
