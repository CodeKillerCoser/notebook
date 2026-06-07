# 笔记输出模板

每个知识笔记为独立的 `.html` 文件，包含内联样式。

## 文件命名

- 使用中文文件名，清晰表达话题
- 示例：`Hello-World.html`、`控制台IO.html`、`match-模式匹配陷阱.html`
- 文件名不含序号，序号仅用于目录分类
- 索引文件命名为 `index.html`

## HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>话题标题</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
    line-height: 1.7;
    color: #333;
    background: #fff;
  }
  h1 { border-bottom: 2px solid #e36209; padding-bottom: 8px; }
  h2 { margin-top: 32px; color: #24292e; }
  pre {
    background: #f6f8fa;
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
  }
  code {
    font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 14px;
  }
  pre code { background: none; padding: 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
  }
  th, td {
    border: 1px solid #dfe2e5;
    padding: 8px 12px;
    text-align: left;
  }
  th { background: #f6f8fa; font-weight: 600; }
  .bad { color: #cb2431; }
  .good { color: #22863a; }
  blockquote {
    border-left: 4px solid #e36209;
    margin: 16px 0;
    padding: 4px 16px;
    background: #fff8f2;
  }
  a { color: #0366d6; }
  .back { margin-top: 40px; font-size: 14px; }
</style>
</head>
<body>

<h1>话题标题</h1>

<!-- 简短概述（可选） -->
<p>一句话说明这个文档讲什么。</p>

<!-- 核心概念/代码 -->
<h2>核心概念</h2>

<pre><code class="language-rust">
// 最关键的代码片段
</code></pre>

<h3>逐行解析</h3>

<ul>
  <li>要点 1</li>
  <li>要点 2</li>
</ul>

<!-- 关键陷阱 -->
<h2>关键陷阱/易错点</h2>

<p>明确标注容易出错的地方：</p>

<pre><code class="language-rust">
<span class="bad">// ❌ 错误写法</span>
<span class="good">// ✅ 正确写法</span>
</code></pre>

<!-- 扩展参考（可选） -->
<h2>扩展参考</h2>

<ul>
  <li>相关文档链接</li>
  <li>官方文档引用</li>
</ul>

<p class="back"><a href="../index.html">← 返回索引</a></p>

</body>
</html>
```

## 注意事项

- 代码块 `<pre><code class="language-XXX">` 标注语言：rust, bash, toml, json
- 错误示例包裹在 `<span class="bad">` 中，正确示例用 `<span class="good">`
- 文档之间用相对路径 `<a>` 链接交叉引用
- 优先展示代码和表格，减少纯文字叙述
- 每个文档聚焦一个话题，避免内容分散
- 底部添加 `<p class="back">` 返回索引的链接
