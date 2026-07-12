# 站点契约

## 文件所有权

| 层 | 主要文件 | 责任 |
| --- | --- | --- |
| 内容 | `content/**/*.html` | Front matter 与语义正文 |
| 数据 | `site/_data/notebook.js` | 扫描、旧 HTML 清洗、标题/摘要/标签/TOC、代码高亮 |
| 页面 | `site/pages/*.njk` | 首页、文章、目录、标签、搜索与 RSS |
| 外壳 | `site/_includes/layouts/base.njk` | 导航、面包屑、主题/字体菜单、内容网格 |
| 组件 | `site/_includes/components/` | 关键词星图、主题与字体切换等独立组件 |
| 视觉 | `site/assets/tokens.css`、`notebook-redesign-overrides.css` | 主题 token、字体、全局布局和响应式 |
| 关键词 | `tools/build-keywords.mjs` | 从全部文章重新计算正文关键词 |
| 发布 | `tools/publish.mjs`、`.github/workflows/pages.yml` | 内容导入、本地验证与 GitHub Pages |

## 文章页

- 桌面为左侧目录、右侧内容；移动端目录变为抽屉。
- `article-pages.njk` 输出一次标题、模板标签和 `article.html`。
- `notebook.js` 会移除旧样式、Header、导航、自定义 TOC、重复标题、页面 wrapper 和卡片 class。
- 兼容清洗用于旧内容；新文章仍必须保持纯语义 fragment。

## 首页

- `.home-masthead` 同时包含导航、Hero 和 `#star-map`。
- 整段使用 `homepage-cosmic-masthead-bg.png`，词云自身透明，避免背景接缝和右侧白边。
- Hero 下不显示统计胶囊；词云不显示“主题坐标”标题。
- 品牌星球是独立资源层，关键词与星环分别旋转。
- 星图下方正文网格只包含“最近笔记”和“笔记目录”。

## 主题与字体

主题值：

- `atlas-light`
- `nebula-dark`
- `paper-warm`

字体值：

- `wenkai`
- `system-sans`
- `song-serif`
- `fangsong`

选择分别写入 `data-theme`、`data-font` 和本地存储。阅读标题/正文使用字体 token；导航、按钮和词云等工具界面使用 `--font-ui`。

纸感主题在所有页面使用浅黄色网格；浅色与星夜也必须覆盖首页和文章页，而不是只修首页。

## 关键词

`tools/build-keywords.mjs`：

- 读取 `content/**/*.html` 的 front matter 标题、`h2` / `h3` 和正文。
- 排除导航、目录、标签栏、脚本、样式、SVG 和代码块噪声。
- 标题是重要语料，但每篇文章整体等权；不使用发布时间权重。
- 每次构建全量重算，正确处理新增、编辑和删除；当前语料规模下成本很低。
- 输出最多 50 个词到 `site/_data/keywordCloud.json`，并生成层级、轨道、搜索链接和关联词。

不要预设展示词来替代正文统计；规范化映射只能统一确实出现在语料中的拼写和大小写。
