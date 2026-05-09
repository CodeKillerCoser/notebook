# 控制台 I/O

## 读取用户输入

```rust
use std::io;

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("读取失败");
    println!("你输入了: {}", input);
}
```

### 逐行解析

- `use std::io;` — 导入标准库 I/O 模块
- `io::stdin()` — 获取标准输入句柄
- `.read_line(&mut input)` — 读取一行到可变字符串引用

## 关键陷阱

### `read_line` 包含末尾换行符

`read_line` 读取的字符串**包含末尾的换行符 `\n`**（Windows 下是 `\r\n`）。

```rust
let mut input = String::new();
io::stdin().read_line(&mut input).unwrap();
// 输入 "hello" → input = "hello\n"

let trimmed = input.trim();  // 去掉首尾空白 → "hello"
```

**始终对 `read_line` 的结果调用 `.trim()`**，否则字符串比较和数字解析会出问题。

### `read_line` 的返回值

`read_line` 返回 `io::Result<usize>`：

- `Ok(n)` — 读取成功，`n` 是读取的字节数（**包含**换行符）
- `Err(e)` — 读取失败，`e` 是错误信息

### 错误处理方式

```rust
// 方式 1: expect（快速失败，程序终止）
io::stdin().read_line(&mut input).expect("读取失败");

// 方式 2: match（灵活处理）
match io::stdin().read_line(&mut input) {
    Ok(n) => println!("读取了 {} 字节", n),
    Err(e) => eprintln!("错误: {}", e),
}
```

## 数字解析

```rust
let input = "42\n";
let num: i32 = input.trim().parse().expect("请输入数字");
```

- `.trim()` — 去掉换行和空白
- `.parse::<i32>()` — 解析为指定整型（也可用类型标注 `let num: i32 = ...`）
- `parse()` 返回 `Result`，需要处理解析失败的情况
