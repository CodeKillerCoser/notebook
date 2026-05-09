# match 模式匹配陷阱：裸标识符 vs 值比较

## 问题：match 臂中的标识符是模式，不是引用

```rust
let secret_number = 42;
let some_value = 100;

// ❌ 这段代码看起来是对的，实际永远匹配第一个臂
match some_value {
    secret_number => println!("You win!"),  // 这不是值比较！
    _ => println!("Try again!"),           // 永远走不到
}
```

### 为什么？

在 `match` 臂中，裸露的标识符（如 `secret_number`）被 Rust 解释为**新绑定的模式变量**，而不是对外部变量 `secret_number` 的引用：

- `secret_number =>` 等价于 `x =>`——**任何值都会匹配**
- 它会将匹配的值绑定到新变量 `secret_number`（遮蔽了外部的同名变量）
- 第二个臂 `_ =>` 是通配符，但第一个臂已匹配一切，永远不会到达

## 解决方案

### 方式 1：`if` 守卫（推荐）

```rust
match some_value {
    x if x == secret_number => println!("You win!"),
    _ => println!("Try again!"),
}
```

用 `if` 守卫明确告诉 Rust：**这里是对比，不是绑定**。

### 方式 2：直接用 `if` 语句

```rust
if some_value == secret_number {
    println!("You win!");
} else {
    println!("Try again!");
}
```

如果只是简单比较，`if` 比 `match` 更清晰。

## 这是 Rust 的常见新手陷阱

Rust 的 `match` 是**模式匹配**（pattern matching），不是值比较。模式匹配中：

| 模式语法 | 含义 |
|----------|------|
| `x` | 匹配任何值，绑定到 `x` |
| `_` | 匹配任何值，忽略 |
| `1 \| 2` | 匹配 1 或 2 |
| `1..=10` | 匹配范围 |
| `x if cond` | 在匹配后附加条件 |

### 正确使用 match 比较值

```rust
use std::cmp::Ordering;

let guess = 50;
let secret_number = 42;

match guess.cmp(&secret_number) {
    Ordering::Less => println!("Too small!"),
    Ordering::Greater => println!("Too big!"),
    Ordering::Equal => println!("You win!"),
}
```

这里用 `cmp()` 方法返回 `Ordering` 枚举，在枚举值上做模式匹配——不会产生遮蔽问题。

## 核心记忆法

> **在 `match` 臂中，裸露的标识符 = 新变量绑定，不是取值引用。**
> **要比较外部变量，必须用 `if` 守卫。**
