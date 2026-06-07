---
name: kb-note-generator
description: 基于对话历史自动提取知识点，生成结构化的知识库 HTML 笔记，并提交到 GitHub notebook 仓库。适用于学习编程、阅读文档、调试问题后的知识整理。使用场景：(1) 与 DeepSeek 讨论完一个知识点后需要生成笔记，(2) 整理一段对话中涉及的所有话题，(3) 将学习笔记自动提交到知识库仓库。涉及 GitHub notebook 仓库操作时使用此 skill。
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
- 按主题分类到 `01-基础入门/` ~ `04-综合案例/` 目录
- 提交到 `https://github.com/CodeKillerCoser/notebook` 的 `main` 分支
- 提交信息格式：`docs(<主题>): <简短描述>`
