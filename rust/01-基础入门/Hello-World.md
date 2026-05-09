# Hello World — 第一个 Rust 程序

## 最简单的 Rust 程序

```rust
fn main() {
    println!("Hello, world!");
}
```

### 要点

- `fn` 声明函数，`main()` 是程序入口
- `println!` 是**宏**（macro），不是普通函数——后缀 `!` 标识宏调用
- 语句以分号 `;` 结尾
- 字符串用双引号 `""`，字符用单引号 `''`

## 直接运行 .rs 文件

Rust 不直接解释执行 `.rs` 文件，必须先编译：

```bash
rustc hello.rs     # 编译 → 生成 hello.exe（Windows）或 hello（Unix）
./hello           # 运行
```

### 适用场景

- **单文件**、小型实验代码可以用 `rustc` 直接编译
- **多文件项目**请用 Cargo（见 Cargo 入门文档）

## 完整示例

```rust
// ch1/1.2/hello.rs
fn main() {
    println!("hello rust");
}
```

编译运行：

```bash
rustc ch1/1.2/hello.rs
./hello       # 输出: hello rust
```
