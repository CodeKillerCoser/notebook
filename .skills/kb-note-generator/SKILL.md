---
name: kb-note-generator
description: 基于对话历史自动提取知识点，生成结构化的知识库 HTML 笔记，并提交到 GitHub notebook 仓库。适用于学习编程、阅读文档、调试问题后的知识整理。涉及 GitHub notebook 仓库操作时使用此 skill。
---

# kb-note-generator

基于对话历史自动提取知识点，生成结构化 HTML 知识库笔记，并提交到 GitHub notebook 仓库。

## 目标仓库

- 仓库地址：`https://github.com/CodeKillerCoser/notebook`
- 默认分支：`main`
- 当前发布系统：Eleventy
- 站点输入目录：`site/`
- 站点输出目录：`_site/`
- 文章数据源目录：仓库根目录下的 `content/`
- 发布路径前缀：`/notebook/`

## 当前发布规则

当前 notebook 不是直接发布仓库根目录下的独立 HTML 文件。站点通过 Eleventy 构建，文章由 `site/_data/notebook.js` 扫描 `content/**/*.html` 后生成首页、目录页、标签页、RSS 和搜索索引。

因此，生成博客或笔记时必须写入：

```text
content/<主题>/<NN-分类>/<文章名>.html
```

例如：

```text
content/AI工程/02-Agent-Runtime/Agent沙箱系统深度笔记.html
content/rust/02-语法进阶/所有权与借用心智模型.html
content/Git部署/01-基础入门/GitHub-Pages-部署.html
```

不要把发布文章放在仓库根目录。

## 文件格式

每篇文章必须由两部分组成：

1. YAML front matter
2. 正文 HTML fragment

推荐模板：

```html
---
title: "文章标题"
date: "2026-06-23T00:00:00-07:00"
category: "AI 工程"
description: "一句话说明这篇文章解决什么问题。"
tags:
  - "AI 工程"
  - "Agent Runtime"
permalink: "/AI工程/02-Agent-Runtime/文章标题.html"
---
<article>
  <p class="lead">一句话说明这篇文章解决什么问题。</p>

  <section id="mental-model">
    <h2>一、核心心智模型</h2>
    <p>正文内容。</p>
  </section>
</article>
```

## 禁止写法

`content/**/*.html` 文章中不要写完整独立 HTML 页面结构：

```html
<!doctype html>
<html>
<head>...</head>
<body>...</body>
</html>
```

也不要手写页面级目录或头部，例如：

```html
<header id="title-block-header">...</header>
<nav class="toc">...</nav>
```

原因：站点的统一 layout 会自动生成页面外壳、标题区、breadcrumb、目录、chip、样式和正文容器。`site/_data/notebook.js` 会从文章正文中的 `h2` / `h3` 自动抽取目录。

## 正文内容规范

正文应只包含可嵌入 layout 的 HTML fragment。推荐使用：

- `<article>` 包裹全文
- `<section id="...">` 分段
- `<h2>` 作为主要章节
- `<h3>` 作为小节
- `<p>` 写正文
- `<blockquote>` 写关键提醒
- `<table>` 写对比
- `<pre><code class="language-xxx">` 写代码
- `<ul>` / `<ol>` 写列表

代码块必须转义 HTML 特殊字符：

- `<` 写成 `&lt;`
- `>` 写成 `&gt;`
- `&` 写成 `&amp;`

## 新版 UI 写作约束

当前站点已经接入工程星图改版，layout 会统一生成 hero、breadcrumb、目录、主题切换、关键词星图和文章页阅读版心。写文章时遵守：

- 不要在文章中写 `<h1>`，标题只放在 front matter 的 `title`
- 不要写内联 `<style>`、全局 CSS、页面级 hero、目录或顶部导航
- 不要为了视觉效果添加大面积装饰 DOM；内容应服务阅读和搜索
- `h2` 不要手写重复序号，例如不要写 `04 4. 标题`；可以写自然标题，数据层会自动加章节编号
- 段落、列表、blockquote 保持正文宽度；代码、表格、figure 可自然撑到宽内容区
- 标签使用主题词和技术词，避免把“搜索”“RSS”“标签”等站点导航词写进文章 chip
- 摘要优先写 `description`，首页和目录页会展示它
- 主题命名遵循站点规范：`AI 工程`、`Git 部署`、`UI 设计`、`Rust`

## 内容组织原则

当学习对话接近尾声或用户明确要求整理笔记时，触发该流程。

提取以下类型的内容：

- 概念讲解：新学的编程概念、语法规则、技术原理
- 代码示例：实际编写或讨论过的完整代码片段
- 错误/陷阱：遇到的问题、根本原因和解决方案
- 配置/工具：开发环境、插件版本、构建工具相关配置
- 版本差异：不同版本 API 的变化和迁移对照
- 工程流程：可复用的实现路线、测试清单、排障流程

分类原则：

- 从基础到进阶，按学习路径排序
- 一级目录使用 `NN-分类描述`，例如 `01-基础入门`、`02-Agent-Runtime`
- 每个主题下保持 2-5 个一级目录，避免过深
- 单篇文章聚焦一个主题；如果内容过长，优先拆成系列文章

## Eleventy 数据层行为

当前站点的数据层行为：

- `site/_data/notebook.js` 扫描 `content/**/*.html`
- `gray-matter` 解析 front matter
- `cheerio` 解析正文 HTML
- 优先从 `main.article`、`.article-content`、`article`、`body` 中提取正文
- 自动从 `h2` / `h3` 抽取目录
- 自动高亮 `<pre><code class="language-xxx">` 代码块
- 自动生成首页最近更新、目录页、标签页、RSS 和 Pagefind 搜索索引

因此文章内容要尽量简单、语义化、可被解析，不要在文章内自带完整页面框架。

## 生成流程

### 1. 评估场景

确认用户是否要把对话整理成 notebook 文章。若涉及当前技术、工具、框架或官方文档，应先检索或引用可靠来源。

### 2. 确定路径

根据主题选择路径：

```text
content/<主题>/<NN-分类>/<文章名>.html
```

如果主题已存在，优先复用已有主题目录。如果是 AI agent、runtime、工具调用、沙箱、评测、浏览器自动化等内容，优先放在：

```text
content/AI工程/02-Agent-Runtime/
```

### 3. 编写 front matter

必须包含：

- `title`
- `date`
- `category`
- `tags`
- `description`
- `permalink`

不要再要求 `layout`、`type`、`comments` 或 `breadcrumbs`。当前 `site/_data/notebook.js` 会按文件路径自动生成目录、面包屑、标签页、RSS、搜索索引和文章页面。

### 4. 编写正文 fragment

正文用 `<article>` 包裹，只写内容片段。不要写完整 HTML 页面结构，不要写内联 `<style>`。

### 5. 自检

提交前检查：

- 文件是否在 `content/**/*.html`
- 是否包含合法 front matter
- 是否没有完整 `<!doctype html>` / `<html>` / `<head>` / `<body>` 外壳
- 是否没有手写 `nav.toc`
- 是否没有内联 `<style>`
- 是否没有文章内 `<h1>`、页面级 hero、手写目录或站点导航
- `description` 是否能作为首页/目录页摘要直接展示
- 代码块中的 `<`、`>`、`&` 是否已转义
- 文章中是否有未闭合标签
- `permalink` 是否与文件路径对应
- 新增或修改文章后是否运行 `npm run build`，让 `tools/build-keywords.mjs` 更新 `site/_data/keywordCloud.json`

### 6. 提交方式

优先创建分支和 PR，不要直接推送 `main`。

推荐分支命名：

```text
docs/<topic-slug>
```

提交信息格式：

```text
docs(<主题>): <简短描述>
```

PR 描述中说明：

- 新增或修改了哪些文章
- 文章路径
- 是否更新了 skill 或说明文档
- 预期部署后会出现在哪些目录/标签中

## 旧 references 说明

`references/output_template.md` 和 `references/output_structure.md` 中的“完整独立 HTML + 根目录主题目录”是早期知识库规范。当前站点已经迁移到 Eleventy，生成发布文章时以本 `SKILL.md` 中的 Eleventy 规范为准。

如需继续保留旧模板，可仅作为离线独立 HTML 的样式参考，不可直接用于 `content/**/*.html` 发布文章。

## 注意事项

- 引用的代码必须来自对话中实际讨论过的代码，或者明确标注为示例代码
- 技术事实、当前工具行为、官方 API 变化应尽量引用官方文档
- 不要为了排版在文章里嵌入全局 CSS
- 不要把大段外部文章原文复制进 notebook
- 所有 GitHub 操作限于 `CodeKillerCoser/notebook` 仓库
- 改动发布系统、skill、构建脚本时必须格外谨慎，优先 PR，不直接 main
