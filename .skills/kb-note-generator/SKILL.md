---
name: kb-note-generator
description: 将对话、学习记录、Markdown 或旧 HTML 整理为 CodeKillerCoser/notebook 的 Eleventy 笔记内容。用于新增或修改 content/**/*.html、导入旧笔记、整理技术对话、生成文章元数据、构建校验以及按用户要求提交发布；文章必须遵守模板统一接管标题、标签、目录、主题、字体和页面样式的内容契约。
---

# KB Note Generator

只生产知识内容，不在文章中设计页面。仓库模板负责导航、标题、标签、左侧目录、主题、字体、响应式和评论区。

## 先读

- 路径、元数据和分类规则：[output_structure.md](references/output_structure.md)
- 正文模板与旧 HTML 导入规则：[output_template.md](references/output_template.md)
- 构建、提交和推送流程：[github_workflow.md](references/github_workflow.md)

需要确认实现细节时，以 `docs/import-guidelines.md`、`site/_data/notebook.js` 和 `tools/publish.mjs` 为准。

## 工作流

1. 阅读相关对话、现有文章和目标主题目录，确认文章范围与受众。
2. 当前 API、框架、工具或规范可能变化时，优先核对官方资料；不要把未经验证的记忆写成事实。
3. 选择 `content/<主题>/<NN-分类>/<文章名>.html`，优先复用现有主题和分类。
4. 写 YAML front matter 与语义正文 fragment。正文从段落或 `h2` 开始，不写页面外壳。
5. 保留可复用的心智模型、代码、错误原因、权衡和验证步骤；删除对话寒暄与无关过程。
6. 运行 `npm run build` 和 `npm run check:links`。复杂表格、图片或长代码还要抽查生成后的桌面和移动页面。
7. 检查 `git diff`，只暂存任务相关文件。只有用户明确要求时才提交或推送；直接推送 `main` 必须是用户明确指令。

## 内容规则

- `title` 是唯一标题来源；文章内不写 `h1`。
- 不写 `<style>`、外部样式表、内联页面布局、Hero、导航、面包屑、标签栏或自定义目录。
- 不需要 `<article>`、`.container`、`.layout`、`.page`、`.card` 等页面包装。
- 使用 `h2` / `h3` 表达层级，不手写章节序号；构建器会生成稳定 ID、编号和左侧目录。
- 代码使用 `<pre><code class="language-xxx">`，并正确转义 HTML 特殊字符。
- `description` 应能脱离正文独立说明文章价值；标签使用主题词和技术词。
- URL 由 `content/` 相对路径决定，不手写 `permalink`。
- 旧 HTML 可以导入，但新写内容必须直接遵守当前契约，不依赖构建器替你清理坏结构。

## 知识提取

优先沉淀：

- 概念与心智模型
- 可运行的关键代码与配置
- 错误现象、根因和修复
- 版本差异与迁移条件
- 工程权衡、测试清单和排障流程

单篇文章聚焦一个问题。内容过长时拆成系列文章，不要为追求篇幅重复解释。

## 生成结果

完成后说明：

- 修改的文章路径和主题
- 使用或新增的标签
- 构建与链接检查结果
- 是否提交、推送，以及对应提交哈希
