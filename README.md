# Notebook

个人知识库。这里不是临时文件堆，而是按主题维护的学习材料与实践笔记。

## 主题入口

| 主题 | 入口 | 内容定位 |
|---|---|---|
| Rust | [rust/index.html](rust/index.html) | Rust 语言、工具链、容器、字符串、智能指针、并发与 LeetCode 实战 |
| Git 部署 | [Git部署/index.html](Git部署/index.html) | GitHub Pages、远端推送、自动生成索引 |
| AI 工程 | [AI工程/index.html](AI工程/index.html) | Agent Runtime / Browser Runtime / Sandbox / Verification 学习路线 |
| 代码大全阅读笔记 | [代码大全阅读笔记/index.html](代码大全阅读笔记/index.html) | 《代码大全》阅读摘记与工程实践原则 |

## 维护原则

- 每个主题目录都应有自己的 `index.html`，作为体系化入口。
- 临时草稿不要长期放在根目录；成熟后归入对应主题。
- 综合案例放在主题内的案例目录中，不和基础语法笔记混在一起。
- 根目录 `index.html` 由 `generate_index.py` 自动生成，只作为文件浏览器。
