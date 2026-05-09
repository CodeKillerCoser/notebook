# Cargo 入门

Cargo 是 Rust 的包管理器和构建工具，类似 Node.js 的 npm/pnpm 或 Python 的 pip/poetry。

## 常用命令

| 命令 | 作用 |
|------|------|
| `cargo new project_name` | 创建新项目 |
| `cargo build` | 编译（Debug 模式） |
| `cargo build --release` | 编译（Release 模式，含优化） |
| `cargo run` | 编译并运行 |
| `cargo check` | 仅检查能否编译（不生成可执行文件，速度快） |
| `cargo add crate_name` | 添加依赖 |
| `cargo update` | 更新依赖（按 semver 兼容范围） |

## Cargo.toml 结构

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]
```

### 字段说明

- **name**: 包名，也是二进制文件名
- **version**: 语义化版本号
- **edition**: Rust 版本版次
  - `2015` — 最初版
  - `2018` — 引入了模块系统改进
  - `2021` — 闭包捕获改进、数组迭代器
  - `2024` — 最新版（Rust 1.85+），包含 borrow checker 改进等

## 项目结构

```
hello_cargo/
├── Cargo.toml        # 项目配置
├── Cargo.lock        # 依赖锁文件（自动生成，需提交到版本控制）
└── src/
    └── main.rs       # 源代码入口
```

### 命名约定

- `src/main.rs` — 可执行二进制包入口
- `src/lib.rs` — 库包入口
- 二进制包名与 `Cargo.toml` 中的 `[package].name` 一致

## Cargo.lock 说明

- **可执行程序**: 将 `Cargo.lock` 提交到版本控制，确保所有人拿到相同依赖
- **库**: 通常不提交 `Cargo.lock`，让下游用户灵活选择依赖版本

## Cargo Workspace 协作

当多个 Rust 项目在同一个目录下时，需要 workspace 统一管理（见 Cargo Workspace 文档）。
