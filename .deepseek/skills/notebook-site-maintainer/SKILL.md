---
name: notebook-site-maintainer
description: 维护 notebook 的 Eleventy 模板、首页、主题、字体、文章清洗、正文关键词、搜索、响应式界面与 GitHub Pages 部署。
---

# notebook-site-maintainer (DeepSeek)

执行站点级修改前读取 `.skills/notebook-site-maintainer/SKILL.md` 及其 references。

核心约束：

- 文章只提供语义内容，页面结构和样式由模板统一负责。
- 首页 Hero 与关键词星图保持同一全宽宇宙背景。
- 三套主题和四种阅读字体必须同时覆盖首页与文章页。
- 关键词只能通过 `tools/build-keywords.mjs` 从文章语料生成。
- 完成构建、链接、结构以及桌面/移动端浏览器验证后再提交。
