# Rust 学习笔记知识库

> 基于《Rust 程序设计语言》（The Rust Programming Language）学习实践整理

## 目录

### 01 - 基础入门

| 文档 | 内容 |
|------|------|
| [Hello World](01-基础入门/Hello-World.md) | 第一个 Rust 程序，`println!`，`fn main()` |
| [Cargo 入门](01-基础入门/Cargo-入门.md) | 项目创建、构建、运行，Cargo.toml 配置 |

### 02 - 语法进阶

| 文档 | 内容 |
|------|------|
| [控制台 I/O](02-语法进阶/控制台IO.md) | `std::io::stdin()`，`read_line`，字符串处理 |
| [流程控制](02-语法进阶/流程控制.md) | `loop` vs `while true`，`break` 传值 |
| [match 模式匹配陷阱](02-语法进阶/match-模式匹配陷阱.md) | 裸标识符 vs 值比较 |

### 03 - 工具链与生态

| 文档 | 内容 |
|------|------|
| [Cargo Workspace 配置](03-工具链与生态/Cargo-Workspace.md) | workspace 管理多项目，resolver 版本 |
| [rand crate 版本兼容](03-工具链与生态/rand-crate-版本.md) | 0.7/0.8/0.10+ API 差异对照 |
| [VS Code 开发环境配置](03-工具链与生态/VS-Code-配置.md) | rust-analyzer，代码跳转快捷键 |

### 04 - 综合案例

| 文档 | 内容 |
|------|------|
| [猜数字游戏](04-综合案例/猜数字游戏.md) | 完整实现分析，各知识点串联 |

---

*持续更新中*
