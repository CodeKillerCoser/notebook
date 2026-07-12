# 构建与 Git 工作流

## 本地验证

在仓库根目录运行：

```bash
npm ci
npm run build
npm run check:links
```

`npm run build` 会重新计算正文关键词、生成 Eleventy 页面并更新 Pagefind。需要提交源文章和发生变化的 `site/_data/keywordCloud.json`；不要提交 `_site/`。

依赖由 `package-lock.json` 管理，GitHub Pages 使用 `npm ci`。修改 `package.json` 时必须同步更新并提交 `package-lock.json`。

## 发布工具

```bash
npm run publish -- <source> <target> --no-commit
```

常用选项：

- `--title`
- `--date`
- `--category`
- `--description`
- `--tags a,b,c`
- `--no-build`
- `--no-commit`
- `--push`

先用 `--no-commit` 审查输出更稳妥。发布工具默认写入 `content/<target>`，运行构建和链接检查，并暂存文章及生成的关键词数据。

## 提交

1. 先运行 `git status --short`，保留用户已有改动。
2. 用明确路径暂存，不使用会混入无关文件的宽泛命令。
3. 运行 `git diff --cached --check` 和 `git diff --cached --stat`。
4. 笔记提交使用 `docs(<主题>): <说明>`；站点代码使用 `feat(site):` 或 `fix(site):`。
5. 只有用户明确要求时才提交或推送。默认在功能分支工作；用户明确要求直接提交仓库时才推送当前分支。
6. 推送前 `git fetch origin`，确认当前分支没有落后；有远端更新时先安全整合，不覆盖远端历史。
