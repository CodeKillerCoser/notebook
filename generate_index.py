#!/usr/bin/env python3
"""
generate_index.py — 扫描仓库目录结构，自动生成 index.html 文件浏览器。
在 GitHub Actions 中自动运行，也可本地手动执行。
"""

import os
import html
from pathlib import Path
from datetime import datetime

REPO = Path(__file__).resolve().parent
OUTPUT = REPO / "index.html"

# 不需要出现在文件列表中的目录/文件
EXCLUDE_DIRS = {".git", ".deepseek", "__pycache__", "node_modules", ".github"}
EXCLUDE_FILES = {"generate_index.py", "index.html", ".DS_Store", "Thumbs.db", "README.md"}


def collect_tree(base: Path, rel_prefix: str = "") -> list:
    """递归扫描目录，返回排序后的文件/目录列表。"""
    entries = []
    try:
        names = sorted(os.listdir(base), key=lambda x: (not os.path.isdir(base / x), x.lower()))
    except PermissionError:
        return entries

    for name in names:
        path = base / name
        rel = f"{rel_prefix}/{name}" if rel_prefix else name

        if path.is_dir():
            if name in EXCLUDE_DIRS or name.startswith("."):
                continue
            children = collect_tree(path, rel)
            entries.append({
                "type": "dir",
                "name": name,
                "path": rel,
                "children": children,
            })
        else:
            if name in EXCLUDE_FILES:
                continue
            # 只保留常见可浏览文件
            ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
            entries.append({
                "type": "file",
                "name": name,
                "path": rel,
                "ext": ext,
            })

    return entries


def render_html(tree: list) -> str:
    """将目录树渲染为完整的 HTML 页面。"""
    body = _render_tree(tree, depth=0)

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Notebook — 文件目录</title>
<style>
  :root {{
    --bg: #f8f9fa;
    --card: #ffffff;
    --text: #1f2937;
    --muted: #6b7280;
    --line: #e5e7eb;
    --accent: #2563eb;
    --accent-soft: #e8f0fe;
    --hover: #f3f4f6;
    --icon-dir: #f59e0b;
    --icon-file: #6b7280;
    --icon-md: #2563eb;
    --icon-html: #dc2626;
    --icon-py: #16a34a;
    --icon-rs: #c026d3;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --bg: #111827;
      --card: #1f2937;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --line: #374151;
      --accent: #60a5fa;
      --accent-soft: #1e3a5f;
      --hover: #374151;
      --icon-dir: #fbbf24;
      --icon-file: #9ca3af;
      --icon-md: #60a5fa;
      --icon-html: #f87171;
      --icon-py: #4ade80;
      --icon-rs: #d946ef;
    }}
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", "PingFang SC", sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
  }}
  .header {{
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 24px 8px;
  }}
  .header h1 {{
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }}
  .header p {{
    color: var(--muted);
    font-size: 14px;
    margin-top: 4px;
  }}
  .container {{
    max-width: 900px;
    margin: 0 auto;
    padding: 16px 24px 64px;
  }}
  .tree {{ list-style: none; padding-left: 0; }}
  .tree ul {{ list-style: none; padding-left: 20px; }}
  .tree li {{ margin: 1px 0; }}
  .tree a {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border-radius: 6px;
    color: var(--text);
    text-decoration: none;
    font-size: 15px;
    transition: background 0.15s;
    width: 100%;
    max-width: 100%;
  }}
  .tree a:hover {{ background: var(--hover); text-decoration: none; }}
  .tree a:visited {{ color: var(--text); }}
  .icon {{ width: 18px; height: 18px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; }}
  .icon-dir {{ color: var(--icon-dir); }}
  .icon-md {{ color: var(--icon-md); }}
  .icon-html {{ color: var(--icon-html); }}
  .icon-py {{ color: var(--icon-py); }}
  .icon-rs {{ color: var(--icon-rs); }}
  .icon-file {{ color: var(--icon-file); }}
  .name {{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
  .ext {{ color: var(--muted); font-size: 12px; margin-left: auto; flex-shrink: 0; }}
  .dir-toggle {{
    cursor: pointer;
    user-select: none;
    padding: 4px 4px 4px 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    transition: background 0.15s;
  }}
  .dir-toggle:hover {{ background: var(--hover); }}
  .dir-toggle .arrow {{ display: inline-block; width: 14px; transition: transform 0.2s; font-size: 12px; color: var(--muted); }}
  .dir-toggle .arrow.open {{ transform: rotate(90deg); }}
  .dir-toggle .icon {{ pointer-events: none; }}
  .dir-children {{ display: none; }}
  .dir-children.open {{ display: block; }}
  .readme-link {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
    padding: 8px 14px;
    background: var(--accent-soft);
    border-radius: 8px;
    color: var(--accent);
    font-size: 14px;
    text-decoration: none;
  }}
  .readme-link:hover {{ opacity: 0.8; text-decoration: none; }}
  .footer {{
    text-align: center;
    color: var(--muted);
    font-size: 13px;
    padding: 32px 24px;
  }}
  @media (max-width: 600px) {{
    .header {{ padding: 24px 16px 8px; }}
    .container {{ padding: 8px 16px 40px; }}
    .tree ul {{ padding-left: 12px; }}
    .tree a {{ font-size: 14px; padding: 3px 8px; }}
  }}
</style>
</head>
<body>
<div class="header">
  <h1>📒 Notebook</h1>
  <p>{_count_summary(tree)}</p>
</div>
<div class="container">
  <a class="readme-link" href="README.md">📄 README.md</a>
  <ul class="tree">
{body}
  </ul>
</div>
<div class="footer">
  自动生成于 {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
</div>
<script>
  document.querySelectorAll('.dir-toggle').forEach(toggle => {{
    toggle.addEventListener('click', function(e) {{
      e.preventDefault();
      const children = this.nextElementSibling;
      const arrow = this.querySelector('.arrow');
      if (children && children.classList.contains('dir-children')) {{
        children.classList.toggle('open');
        arrow.classList.toggle('open');
      }}
    }});
  }});
</script>
</body>
</html>
"""


def _icon_class(ext: str) -> tuple:
    icons = {
        "md": ("📝", "icon-md"),
        "html": ("🌐", "icon-html"),
        "py": ("🐍", "icon-py"),
        "rs": ("🦀", "icon-rs"),
        "json": ("📋", "icon-file"),
        "toml": ("⚙️", "icon-file"),
        "yaml": ("⚙️", "icon-file"),
        "yml": ("⚙️", "icon-file"),
        "txt": ("📄", "icon-file"),
        "css": ("🎨", "icon-file"),
        "js": ("📜", "icon-file"),
        "ts": ("📘", "icon-file"),
    }
    return icons.get(ext, ("📄", "icon-file"))


def _render_tree(entries: list, depth: int) -> str:
    lines = []
    indent = "  " * (depth + 2)
    for entry in entries:
        name = html.escape(entry["name"])
        path = html.escape(entry["path"])

        if entry["type"] == "dir":
            children_html = _render_tree(entry["children"], depth + 1)
            lines.append(f'{indent}<li>')
            lines.append(f'{indent}  <span class="dir-toggle"><span class="arrow">▶</span><span class="icon icon-dir">📁</span><span class="name">{name}</span></span>')
            lines.append(f'{indent}  <ul class="dir-children">')
            lines.append(children_html)
            lines.append(f'{indent}  </ul>')
            lines.append(f'{indent}</li>')
        else:
            ext = entry.get("ext", "")
            emoji, ic = _icon_class(ext)
            lines.append(f'{indent}<li><a href="{path}"><span class="icon {ic}">{emoji}</span><span class="name">{name}</span><span class="ext">{ext.upper() if ext else ""}</span></a></li>')
    return "\n".join(lines)


def _count_summary(tree: list) -> str:
    files = dirs = 0
    def walk(entries):
        nonlocal files, dirs
        for e in entries:
            if e["type"] == "dir":
                dirs += 1
                walk(e["children"])
            else:
                files += 1
    walk(tree)
    parts = []
    if dirs: parts.append(f"{dirs} 个目录")
    if files: parts.append(f"{files} 个文件")
    return " · ".join(parts) if parts else "空仓库"


def main():
    tree = collect_tree(REPO)
    html_content = render_html(tree)
    OUTPUT.write_text(html_content, encoding="utf-8")
    print(f"[OK] index.html generated, {len(html_content)} bytes")
    print(f"     dirs: {sum(1 for e in tree if e['type']=='dir')}, files: {sum(1 for e in tree if e['type']=='file')} (top-level)")


if __name__ == "__main__":
    main()
