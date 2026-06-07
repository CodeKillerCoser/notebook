# GitHub 工作流

将生成的笔记提交到 notebook 仓库的标准流程。

## 前置条件

- 本地已配置 GitHub 认证（SSH key 或 Personal Access Token）
- 仓库 `https://github.com/CodeKillerCoser/notebook` 可访问

## 流程

### 1. 克隆仓库

```bash
git clone https://github.com/CodeKillerCoser/notebook.git .kb-notebook-tmp
```

如果临时目录已存在，先进入目录执行 `git pull` 获取最新版本。

### 2. 放置文件

将生成的 HTML 笔记复制到仓库中对应主题的目录下。

```bash
cp -r .kb-tmp/<主题>/* .kb-notebook-tmp/<主题>/
```

目录结构应与知识库现有结构保持一致。

### 3. 提交

```bash
cd .kb-notebook-tmp
git add <主题>/
git commit -m "docs(<主题>): add study notes"
```

提交信息格式：`docs(<主题>): <简短描述>`

### 4. 推送

```bash
git push origin main
```

### 5. 清理

```bash
rm -rf .kb-notebook-tmp .kb-tmp
```

## 注意事项

- 推送前确认工作区干净，没有误修改其他文件
- 如果推送失败（如远程有更新），先 `git pull --rebase` 再推送
- 所有操作限于 notebook 仓库，不修改用户其他仓库
