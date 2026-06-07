# 目录结构规范

知识库采用层级目录组织，每个主题一个根目录。

## 标准层级

```
<Rust>/
├── index.html                       # 目录索引
├── 01-基础入门/
│   ├── Hello-World.html
│   └── Cargo-入门.html
├── 02-语法进阶/
│   ├── 控制台IO.html
│   ├── 流程控制.html
│   └── match-模式匹配陷阱.html
├── 03-工具链与生态/
│   ├── Cargo-Workspace.html
│   ├── rand-crate-版本.html
│   └── VS-Code-配置.html
└── 04-综合案例/
    └── 猜数字游戏.html
```

## 命名规范

| 层级 | 命名方式 | 示例 |
|------|---------|------|
| 根目录 | 主题英文名或简短中文 | `Rust/`, `Python/`, `Git/` |
| 一级目录 | `NN-分类描述`（NN=两位数字） | `01-基础入门/`, `02-语法进阶/` |
| 笔记文件 | 话题中文名 + `.html` | `Hello-World.html`, `控制台IO.html` |
| 索引文件 | `index.html` | `index.html` |

## index.html 格式

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><主题> 学习笔记知识库</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #333; }
  h1 { border-bottom: 2px solid #e36209; padding-bottom: 8px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
  th { background: #f6f8fa; }
  a { color: #0366d6; }
</style>
</head>
<body>
<h1><主题> 学习笔记知识库</h1>
<blockquote>简述</blockquote>

<h2>目录</h2>

<h3>01 - 分类A</h3>
<table>
  <tr><th>文档</th><th>内容</th></tr>
  <tr><td><a href="相对路径">文档名</a></td><td>概要描述</td></tr>
</table>

<h3>02 - 分类B</h3>
...
</body>
</html>
```

## 分类指导

### 01 - 基础入门

环境搭建、第一个程序、基本工具使用。

### 02 - 语法进阶

语言核心语法、常见陷阱、惯用模式。

### 03 - 工具链与生态

包管理器、构建工具、第三方库、开发环境配置。

### 04 - 综合案例

串联多个知识点的完整项目分析。

### 自定义分类

如果以上分类不适配，按学习路径自定分类名，保持 2-5 个一级目录。
