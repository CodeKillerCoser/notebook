# Cargo Workspace 配置

## 为什么需要 Workspace

当你在同一个目录下管理多个 Rust 项目时，如果没有 workspace 配置，Cargo 会报错：

```
current package believes it's in a workspace when it's not
```

Workspace 让多个包共享：
- 一个顶层的 `Cargo.lock` 文件
- 统一的编译输出目录 `target/`
- 共享的依赖解析

## 基本配置

```toml
# 顶层 Cargo.toml（workspace 根）
[workspace]
resolver = "3"
members = [
    "ch2/guessing_game",
    "ch1/1.3/hello_cargo",
]
```

### 配置说明

| 字段 | 说明 |
|------|------|
| `[workspace]` | 标记这是 workspace 根，不是普通包 |
| `resolver = "3"` | 依赖解析器版本，edition 2024 必须用 resolver `"3"` |
| `members` | 子包的路径列表（相对于 workspace 根） |

## Resolver 版本

| Resolver | 对应 Edition | 说明 |
|----------|-------------|------|
| `"1"` | 2015, 2018 | Workspace 默认值 |
| `"2"` | 2021 | 改进的特性统一处理 |
| `"3"` | 2024 | 最新版，需要显式指定 |

```toml
[workspace]
# edition 2024 的项目必须显式指定 resolver = "3"
# 否则 Cargo 默认用 resolver "1"，会报兼容性错误
resolver = "3"
```

## 子包配置

子包有自己的 `Cargo.toml`，**不需要**（也不应该）声明 `[workspace]`：

```toml
# ch2/guessing_game/Cargo.toml
[package]
name = "guessing_game"
version = "0.1.0"
edition = "2024"

[dependencies]
rand = "0.10.1"
```

## 常见错误

### "current package believes it's in a workspace"

**原因**: 顶层有 `[workspace]` 配置，但子包路径没加到 `members` 列表。

**解决**: 将所有子包路径添加到 `members`：

```toml
[workspace]
members = [
    "ch2/guessing_game",    # ← 添加遗漏的子包
    "ch1/1.3/hello_cargo",
]
```

## 目录结构示例

```
project-root/
├── Cargo.toml            # [workspace] 配置
├── Cargo.lock            # 共享锁文件
├── target/               # 统一编译输出
├── ch1/
│   └── 1.3/
│       └── hello_cargo/
│           ├── Cargo.toml
│           └── src/
│               └── main.rs
└── ch2/
    └── guessing_game/
        ├── Cargo.toml
        └── src/
            └── main.rs
```
