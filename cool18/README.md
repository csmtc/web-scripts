# cool18 油猴脚本

一个用于 cool18.com 的油猴脚本，提供小说下载和阅读体验优化功能。

## 功能特性

- 📖 **小说页面优化**：在小说页面添加下载按钮，支持单章下载为 TXT 文件
- 📋 **列表页下载按钮**：在主页和搜索页为每个小说链接添加快速下载按钮
- 📦 **批量下载**：在搜索页支持批量下载所有小说（ZIP 格式或合并为单个文件）
- 🎨 **阅读体验**：自动识别并提取小说正文内容

## 安装方式

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或其他油猴扩展
2. 点击下方链接安装脚本：
   - [点击安装](https://atcra.top:50000/web-script/cool18.user.js)

## 支持的页面

| 页面类型 | URL 模式                                                       | 功能                    |
| -------- | -------------------------------------------------------------- | ----------------------- |
| 主页     | `cool18.com/bbs4/index.php`                                  | 列表下载按钮            |
| 搜索页   | `cool18.com/bbs4/index.php?act=threadsearch&...`             | 列表下载按钮 + 批量下载 |
| 小说页   | `cool18.com/bbs4/index.php?app=forum&act=threadview&tid=...` | 单章下载                |

## 开发

### 环境要求

- Node.js
- npm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

构建产物位于 `dist/cool18.user.js`。

## 技术栈

- **Vite**：构建工具
- **vite-plugin-monkey**：油猴脚本打包插件
- **JSZip**：ZIP 文件生成（用于批量下载）
- **TypeScript**：类型安全

## 项目结构

```
cool18/
├── src/
│   ├── main.ts          # 入口文件，页面路由
│   ├── main_page.ts     # 主页逻辑
│   ├── novel_page.ts    # 小说页逻辑
│   ├── search_page.ts   # 搜索页逻辑（含批量下载）
│   └── util.ts          # 工具函数和选择器配置
├── dist/
│   └── cool18.user.js   # 构建产物
├── package.json
├── vite.config.js
└── tsconfig.json
```

## 更新日志

### 2025.06.09

- 适配网站最新格式
- 更新 CSS 选择器：
  - 小说标题：`h1` → `.title-section`
  - 主页列表：`.dc_bar2 .t_l a` → `li a[href*='threadview']`
  - 搜索页列表：`.search-content a` → `a[href*='threadview']`
  - 按钮容器：`.dc_bar2 td` → `.page-title-right`

## 许可证

仅供个人学习使用，请勿用于商业用途。
