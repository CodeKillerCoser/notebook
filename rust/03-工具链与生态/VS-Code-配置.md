# VS Code 开发环境配置

## 必备插件

### rust-analyzer

- **名称**: rust-analyzer（Rust 官方维护）
- **功能**:
  - 代码补全（自动导入）
  - 类型提示（inline type hints）
  - 代码跳转
  - 实时错误诊断
  - 悬停显示文档
  - 自动格式化

### 其他推荐插件

| 插件 | 用途 |
|------|------|
| **Even Better TOML** | Cargo.toml 语法高亮与校验 |
| **CodeLLDB** | 调试 Rust 程序（支持断点、变量查看） |
| **crates** | Cargo.toml 中依赖版本检查与更新 |

## 打开项目的正确方式

```bash
# ❌ 错误：只打开 src/ 目录
code src/

# ✅ 正确：打开包含 Cargo.toml 的目录
code hello_cargo/

# ✅ 如果是 Workspace，打开 workspace 根目录
code project-root/
```

**关键**: VS Code 打开的文件夹**必须包含 `Cargo.toml`**（或 workspace 根），rust-analyzer 才能找到项目上下文。

## 代码跳转快捷键

| 快捷键 | 功能 |
|--------|------|
| `F12` | 跳转到定义 |
| `Alt+F12` | 预览定义（行内弹出） |
| `Shift+F12` | 查看所有引用 |
| `F2` | 重命名符号（安全重构） |
| `Ctrl+Click` | 跳转到定义（Mac: `Cmd+Click`） |
| `Ctrl+Shift+O` | 跳转到文件中的符号 |

### 使用技巧

- **跳转前确保编译通过** — rust-analyzer 基于编译结果提供跳转
- **`F2` 重命名** — 会智能地只在合适的地方改名，避免误改
- **跨包跳转** — rust-analyzer 支持跨 crate 的跳转，前提是 `cargo check` 能通过

## 配置文件：settings.json

推荐添加以下配置：

```json
{
    "rust-analyzer.checkOnSave": true,
    "rust-analyzer.cargo.allFeatures": true,
    "editor.formatOnSave": true,
    "[rust]": {
        "editor.defaultFormatter": "rust-lang.rust-analyzer"
    }
}
```

## 常见问题

### rust-analyzer 不工作

1. 检查 VS Code 打开的文件夹是否正确（必须包含 `Cargo.toml`）
2. 运行 `cargo check` 看是否有编译错误
3. 重启 rust-analyzer: `Ctrl+Shift+P` → "rust-analyzer: Restart server"
4. 检查工作区是否有 `Cargo.lock`，没有则运行 `cargo check` 生成
