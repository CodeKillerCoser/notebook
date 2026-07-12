# 验收清单

## 构建

```bash
npm ci
npm run build
npm run check:content
npm run check:links
git diff --check
```

确认：

- 关键词脚本报告等权文章数和关键词数。
- Eleventy、Pagefind 与 81 个本地页面链接检查通过。
- `package.json` 与 `package-lock.json` 同步。
- `_site/` 未进入提交范围。

## 文章结构

抽查多篇旧文章和新文章：

- 页面只有一个模板标题。
- `.article-body` 中没有 `h1`、自定义 TOC、Header、导航或页面级样式。
- 图片、figure、SVG、视频、表格、details 和受控视觉案例与源文章数量一致。
- `.ui-guide` 等受控作用域仍由全局 CSS 提供样式，案例所需的颜色和尺寸数据没有被清洗。
- 桌面左目录/右正文，移动端没有横向滚动。
- 表格、代码、figure 和长单词不会撑破版心。

## 首页结构

- `.home-masthead`、`#star-map` 左右边界一致。
- `.home-hero-stats` 和 `.corpus-map__heading` 数量为 0。
- `document.documentElement.scrollWidth <= innerWidth`。
- Hero 到词云没有空带、接缝或右侧白边。

## 主题与字体

至少检查 `1440x900` 和 `390x844`：

- 浅色、星夜、纸感三套主题。
- 文楷、清爽黑体、宋体、仿宋四种字体的即时切换。
- 刷新和跨页面后选择仍保留。
- UI 字体保持稳定，正文和标题字体发生预期变化。
- 菜单选中态、Esc、外部点击和移动端展开状态正常。

## 预览与部署

- 本地服务监听 `0.0.0.0`。
- 用实际局域网 IP 请求首页并确认 HTTP 200。
- 浏览器控制台没有新增 error/warning。
- 推送后检查 GitHub Actions；部署页面必须来自本次提交。
