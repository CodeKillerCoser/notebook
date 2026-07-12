---
name: notebook-site-maintainer
description: 维护 CodeKillerCoser/notebook 的 Eleventy 站点系统。用于修改首页、导航、文章模板、数据清洗、主题、字体、关键词星图、搜索、品牌资源、响应式布局、构建脚本或 GitHub Pages 部署；也用于排查首页与文章样式不一致、重复标题/目录、横向溢出和构建发布问题。
---

# Notebook Site Maintainer

维护站点外壳与发布系统，不把布局责任推回 `content/` 文章。

## 先读

- 文件所有权与当前产品契约：[site-contract.md](references/site-contract.md)
- 构建、结构和浏览器验收：[qa-checklist.md](references/qa-checklist.md)

涉及文章写作或导入时改用 `.skills/kb-note-generator/SKILL.md`。

## 工作流

1. 检查 `git status`、相关文档、实际模板和生成页面；不要根据旧截图猜当前实现。
2. 确认责任层：内容放 `content/`，解析归 `site/_data/`，页面结构归 Nunjucks，视觉 token 与响应式归 CSS，确定性生成归 `tools/`。
3. 在最小责任边界内实现。跨主题样式必须使用语义 token；全局结构不得靠单篇文章 class 修补。
4. 修改关键词规则时运行生成脚本，不手改 `site/_data/keywordCloud.json` 作为最终方案。
5. 运行完整构建、链接检查和静态结构检查。
6. 用浏览器检查桌面、移动端、三套主题和受影响的字体选项；视觉任务必须看截图和 DOM 指标，不能只看 HTTP 200。
7. 检查差异与依赖锁文件，再按用户要求提交或推送。

## 不变量

- 模板是文章标题、标签、目录、主题、字体和布局的唯一拥有者。
- 每篇文章只出现一个页面 `h1`；正文不保留自定义标题、Hero、导航或 TOC。
- 首页 Hero 与关键词星图位于同一个全宽背景容器，不显示统计胶囊或“主题坐标”标题。
- 主题和字体选择跨首页、目录、标签与文章页一致，并通过本地存储保留。
- 关键词来自文章标题、章节和正文；文章等权，不按发布时间加权。
- `_site/` 是构建产物，不提交。`site/_data/keywordCloud.json` 是可复现且已跟踪的数据，需要随算法或语料变化提交。
- GitHub Pages 使用 `npm ci`；依赖变化必须同步 `package-lock.json`。

## 修改原则

- 复用现有品牌位图、SVG 和字体资源，不重新绘制近似占位图。
- UI 控件保持界面字体；阅读字体由 `data-font` 和字体 token 控制。
- 不把页面区块堆成卡片，不在卡片内再嵌卡片。
- 保留用户已有改动；不清理与任务无关的脏工作区。
- 远程预览监听 `0.0.0.0`，但向用户提供实际局域网或虚拟网 IP。

## 交付

说明改动层、构建与浏览器检查结果、预览地址、提交哈希和推送分支。未执行的验证必须明确指出。
