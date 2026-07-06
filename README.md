# 工程星图 Notebook

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-0969da?logo=github)](https://codekillercoser.github.io/notebook/)
[![Notebook](https://img.shields.io/badge/type-personal%20knowledge%20base-0f766e)](#)
[![Topics](https://img.shields.io/badge/topics-Rust%20%7C%20AI%20Engineering%20%7C%20Git%20Deploy-c2410c)](#-主题标签)
[![Search](https://img.shields.io/badge/search-Pagefind-7e22ce)](https://codekillercoser.github.io/notebook/search.html)

一个面向工程实践的个人知识库，用来把 Rust、AI 工程、Agent Runtime、Git 部署、UI 设计和阅读笔记整理成可检索、可持续维护的技术坐标。

> 在线站点：[codekillercoser.github.io/notebook](https://codekillercoser.github.io/notebook/)

## 目录

- [这个仓库是什么](#这个仓库是什么)
- [主题入口](#主题入口)
- [主题标签](#主题标签)
- [本地运行](#本地运行)
- [内容维护](#内容维护)
- [项目结构](#项目结构)
- [帮助与反馈](#帮助与反馈)

## 这个仓库是什么

这个仓库既保存原始笔记内容，也保存静态站点构建配置。内容源文件主要放在 `content/`，站点由 Eleventy 生成，并使用 Pagefind 提供全文搜索。

它的目标不是临时文件堆，而是长期维护的学习材料与实践笔记：

- 把分散的技术学习记录整理成主题化入口。
- 为高频问题沉淀可复用的操作步骤和心智模型。
- 让笔记能通过 GitHub Pages 在线阅读，也能在仓库中直接追踪变更。

## 主题入口

| 主题 | 在线入口 | 内容定位 |
| --- | --- | --- |
| Rust | [rust/index.html](https://codekillercoser.github.io/notebook/rust/index.html) | Rust 语言基础、工具链、容器、字符串、智能指针、并发与 LeetCode 实战 |
| Git 部署 | [Git部署/index.html](https://codekillercoser.github.io/notebook/Git%E9%83%A8%E7%BD%B2/index.html) | GitHub Pages、远端推送、自动生成索引与发布流程 |
| AI 工程 | [AI工程/index.html](https://codekillercoser.github.io/notebook/AI%E5%B7%A5%E7%A8%8B/index.html) | Agent Runtime、Browser Runtime、Sandbox、Verification 学习路线 |
| Agent | [Agent/index.html](https://codekillercoser.github.io/notebook/Agent/index.html) | 可控闭环 Agent、多 Agent 系统与运行时设计 |
| UI 设计 | [UI设计/index.html](https://codekillercoser.github.io/notebook/UI%E8%AE%BE%E8%AE%A1/index.html) | 设计系统化、界面原则与前端体验笔记 |
| 代码大全阅读笔记 | [代码大全阅读笔记/index.html](https://codekillercoser.github.io/notebook/%E4%BB%A3%E7%A0%81%E5%A4%A7%E5%85%A8%E9%98%85%E8%AF%BB%E7%AC%94%E8%AE%B0/index.html) | 《代码大全》阅读摘记与工程实践原则 |

## 主题标签

`Rust` · `AI 工程` · `Agent Runtime` · `GitHub Pages` · `Git 部署` · `UI 设计` · `代码大全` · `Notebook`

完整标签页：[tags/index.html](https://codekillercoser.github.io/notebook/tags/index.html)

## 本地运行

```bash
npm install
npm run dev
```

常用脚本：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Eleventy 本地预览服务 |
| `npm run build` | 清理并构建站点，同时生成 Pagefind 搜索索引 |
| `npm run check:links` | 检查站点链接 |
| `npm run publish -- <source> <target>` | 将 Markdown 或 HTML 笔记发布到 `content/` |

## 内容维护

- 新文章优先放入 `content/` 下对应主题目录。
- 每个主题目录应有自己的 `index.html`，作为体系化入口。
- 临时草稿不要长期放在根目录；成熟后归入对应主题。
- 综合案例放在主题内的案例目录中，不和基础语法笔记混在一起。
- 根目录的 `README.md` 用于 GitHub 仓库首页；站点内的 `README.html` 页面继续由现有 HTML 内容维护。

## 项目结构

```text
.
├── content/             # 笔记内容源文件
├── site/                # Eleventy 模板、布局、数据与站点资源
├── tools/               # 发布、清理、链接检查等辅助脚本
├── pagefind/            # 已生成的搜索索引资源
├── assets/              # 发布后的站点静态资源
├── _site/               # Eleventy 构建输出
├── README.md            # GitHub 仓库 README
└── README.html          # GitHub Pages 站点页面
```

## 帮助与反馈

- 阅读入口：[在线站点首页](https://codekillercoser.github.io/notebook/)
- 搜索笔记：[站内搜索](https://codekillercoser.github.io/notebook/search.html)
- 评论反馈：站点文章页使用 utterances 关联 GitHub Issues

维护者：[@CodeKillerCoser](https://github.com/CodeKillerCoser)
