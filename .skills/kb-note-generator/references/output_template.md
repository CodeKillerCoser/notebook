# 正文模板与导入

## 新文章模板

```html
---
title: "文章标题"
date: "2026-07-13T00:00:00+08:00"
category: "Rust"
description: "一句话说明本文解决什么问题。"
tags:
  - "Rust"
  - "所有权"
---

<p>用一段开场说明问题背景、结论和阅读收益。</p>

<h2>核心心智模型</h2>
<p>正文内容。</p>

<h3>关键边界</h3>
<ul>
  <li>边界一</li>
  <li>边界二</li>
</ul>

<h2>代码与验证</h2>
<pre><code class="language-rust">fn main() {
    println!(&quot;hello&quot;);
}</code></pre>
```

不要额外包裹 `<article>`、`<main>` 或页面容器。模板会生成标题、标签、目录和正文外壳。

## 禁止内容

- `<!doctype html>`、`html`、`head`、`body`
- 文章内 `h1`
- `style`、页面级 `script`、外部样式表或内联布局样式
- Header、Hero、面包屑、站点导航、标签栏、自定义 TOC
- 为排版创建的 `.card`、`.container`、`.layout`、`.page`
- 重复章节序号，如 `04 4. 标题`

## 允许内容

- `p`、`h2`、`h3`、列表、表格、引用、图片、figure
- `pre > code` 代码块和行内 `code`
- 服务于语义的轻量 class；不要用 class 控制页面布局

代码中的 `<`、`>` 和 `&` 分别写成 `&lt;`、`&gt;` 和 `&amp;`。

## 旧 HTML 导入

可使用：

```bash
npm run publish -- <source.md|source.html> <主题/分类/文章名.html> --no-commit
```

发布工具和数据层会移除旧页面外壳、样式、重复标题和自定义目录，并把其他 `h1` 转为 `h2`。导入后仍要检查生成源文件，保证后续维护不依赖兼容清洗。
