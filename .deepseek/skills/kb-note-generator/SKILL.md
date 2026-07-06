---
name: kb-note-generator
description: 基于对话历史自动提取知识点，生成 Eleventy 兼容的 content/**/*.html 知识库文章片段，并按 notebook 新版 UI、搜索摘要、关键词星图和 GitHub 工作流完成整理。适用于学习编程、阅读文档、调试问题后的知识整理，以及将学习笔记提交到 CodeKillerCoser/notebook 仓库。
---

# kb-note-generator (DeepSeek)

> 此文件是 DeepSeek TUI 的 skill 发现入口。规范 skill 文件位于 `.skills/kb-note-generator/`。

## 使用方式

当此 skill 被触发时，按以下步骤加载完整指令：

1. 读取 `.skills/kb-note-generator/SKILL.md` 获取完整流程
2. 按需读取 `.skills/kb-note-generator/references/` 下的参考文件：
   - `output_structure.md` — 目录结构与命名规范
   - `output_template.md` — HTML 笔记模板
   - `github_workflow.md` — Git 提交工作流

## 核心要点

- 从对话历史提取知识点，生成结构化 HTML 笔记
- 只写 `content/**/*.html` 文章片段，不写完整 HTML 页面、文章内 `<h1>`、内联 CSS、手写 hero 或 TOC
- 按主题复用现有目录，并在 front matter 写 `description` 供首页/目录页展示
- 运行 `npm run build`，确保关键词星图、Eleventy 页面、RSS 和 Pagefind 搜索索引同步更新
- 提交到 `https://github.com/CodeKillerCoser/notebook` 的 `main` 分支
- 提交信息格式：`docs(<主题>): <简短描述>`
