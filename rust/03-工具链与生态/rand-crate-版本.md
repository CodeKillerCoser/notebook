# rand crate 版本兼容

`rand` crate 是 Rust 生态中最常用的随机数生成库。不同版本的 API 差异很大，升级时需要对照迁移。

## 版本速查表

| rand 版本 | 获取 RNG | 生成范围随机数 | 需要 use |
|-----------|----------|---------------|----------|
| **0.7 及以前** | `rand::thread_rng()` | `.gen_range(1, 101)` | `use rand::Rng;` |
| **0.8** | `rand::thread_rng()` | `.gen_range(1..=100)` | `use rand::Rng;` |
| **0.10+** | `rand::rng()` | `.random_range(1..=100)` | 无需额外 use |

## 最新版写法（0.10+）

```rust
use rand;

fn main() {
    // 最简方式：直接用自由函数
    let num = rand::random_range(1..=100);
    println!("{}", num);
}
```

- 无需 `use rand::Rng;`
- 无需创建 RNG 实例
- 直接调用 `rand::random_range()` 即可

## 各版本迁移对比

### 0.7 → 0.8

```rust
// 0.7 及以前
rand::thread_rng().gen_range(1, 101);

// 0.8
rand::thread_rng().gen_range(1..=100);
```

变化：范围参数从 `(low, high)` 元组改为 Range 语法 `low..=high`。

### 0.8 → 0.10+

```rust
// 0.8
let mut rng = rand::thread_rng();
rng.gen_range(1..=100);

// 0.10+
let num = rand::random_range(1..=100);
```

变化：
- `rand::thread_rng()` → `rand::rng()`
- `.gen_range()` → `.random_range()`
- 可以直接用自由函数，无需显式创建 RNG

## API 完整迁移对照

| 功能 | 0.7 | 0.8 | 0.10+ |
|------|-----|-----|-------|
| 获取 RNG | `rand::thread_rng()` | `rand::thread_rng()` | `rand::rng()` |
| 范围随机数 | `.gen_range(1, 101)` | `.gen_range(1..=100)` | `.random_range(1..=100)` |
| 随机 bool | `rand::random()` | `.gen::<bool>()` | `rand::random_bool()` |
| 从数组选 | `rng.choose(&arr)` | `rng.choose(&arr)` | `rand::seq::index::sample` |

## 猜数字游戏中的实际用法

```toml
[dependencies]
rand = "0.10.1"
```

```rust
use rand;

let secret_number = rand::random_range(1..=100);
```
