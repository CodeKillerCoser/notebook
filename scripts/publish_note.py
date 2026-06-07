#!/usr/bin/env python3
"""
Publish a local HTML note into the notebook source tree.

Example:
  python scripts/publish_note.py --source C:\\notes\\demo.html --path "AI工程/Agent/多agent设计.html" --tags "AI工程,Agent" --push
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
from pathlib import Path
from html.parser import HTMLParser


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
SEGMENT_TITLES = {
    "rust": "Rust",
    "AI工程": "AI 工程",
    "Git部署": "Git 部署",
}


class TitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._capture: str | None = None
        self.title = ""
        self.h1 = ""

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag.lower() in {"title", "h1"}:
            self._capture = tag.lower()

    def handle_endtag(self, tag: str) -> None:
        if self._capture == tag.lower():
            self._capture = None

    def handle_data(self, data: str) -> None:
        if self._capture == "title":
            self.title += data
        elif self._capture == "h1":
            self.h1 += data


def run(args: list[str], check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(args, cwd=ROOT, check=check, text=True)


def quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def strip_full_document(html: str) -> str:
    body_match = re.search(r"<body[^>]*>([\s\S]*?)</body>", html, re.IGNORECASE)
    return (body_match.group(1) if body_match else html).strip()


def title_from_html(html: str, fallback: str) -> str:
    parser = TitleParser()
    parser.feed(html)
    for candidate in (parser.title, parser.h1, fallback):
        value = re.sub(r"\s+", " ", candidate).strip()
        if value and "�" not in value:
            return value
    return fallback


def segment_title(segment: str) -> str:
    value = SEGMENT_TITLES.get(segment, segment)
    return re.sub(r"^\d{2}-", "", value).replace("-", " ")


def build_breadcrumbs(rel_path: Path, title: str) -> list[dict[str, str]]:
    parts = rel_path.as_posix().split("/")
    crumbs = [{"title": "Notebook", "url": "/index.html"}]
    for index, part in enumerate(parts[:-1]):
        crumbs.append({
            "title": segment_title(part),
            "url": "/" + "/".join(parts[: index + 1]) + "/index.html",
        })
    crumbs.append({"title": title, "url": "/" + rel_path.as_posix()})
    return crumbs


def front_matter(title: str, rel_path: Path, tags: list[str], category: str) -> str:
    lines = [
        "---",
        f"title: {quote(title)}",
        f"date: {quote(dt.datetime.now(dt.timezone.utc).isoformat())}",
        f"category: {quote(category)}",
        "tags:",
    ]
    for tag in tags:
        lines.append(f"  - {quote(tag)}")
    lines.append("breadcrumbs:")
    for crumb in build_breadcrumbs(rel_path, title):
        lines.append(f"  - title: {quote(crumb['title'])}")
        lines.append(f"    url: {quote(crumb['url'])}")
    lines.extend([
        "layout: layouts/article.njk",
        "type: article",
        "comments: true",
        f"permalink: {quote('/' + rel_path.as_posix())}",
        "---",
        "",
    ])
    return "\n".join(lines)


def normalize_tags(value: str, rel_path: Path) -> list[str]:
    tags = [part.strip() for part in re.split(r"[,，]", value) if part.strip()]
    if tags:
        return list(dict.fromkeys(tags))
    first = rel_path.parts[0] if rel_path.parts else "Notebook"
    return [segment_title(first)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish a local HTML note to the notebook blog.")
    parser.add_argument("--source", required=True, help="Local HTML file path.")
    parser.add_argument("--path", required=True, help="Blog path, e.g. rust/02-语法进阶/Option.html")
    parser.add_argument("--tags", default="", help="Comma-separated tags.")
    parser.add_argument("--title", default="", help="Override note title.")
    parser.add_argument("--message", default="", help="Git commit message.")
    parser.add_argument("--no-build", action="store_true", help="Skip npm build.")
    parser.add_argument("--no-commit", action="store_true", help="Skip git commit.")
    parser.add_argument("--push", action="store_true", help="Push HEAD to origin/main after commit.")
    args = parser.parse_args()

    source = Path(args.source).expanduser().resolve()
    if not source.exists() or source.suffix.lower() != ".html":
        raise SystemExit(f"source must be an existing .html file: {source}")

    rel_path = Path(args.path.replace("\\", "/"))
    if rel_path.is_absolute() or ".." in rel_path.parts or rel_path.suffix.lower() != ".html":
        raise SystemExit("--path must be a safe relative .html path")

    raw = source.read_text(encoding="utf-8")
    title = args.title.strip() or title_from_html(raw, rel_path.stem)
    tags = normalize_tags(args.tags, rel_path)
    category = segment_title(rel_path.parts[0]) if rel_path.parts else "Notebook"
    target = SRC / rel_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(front_matter(title, rel_path, tags, category) + strip_full_document(raw) + "\n", encoding="utf-8")

    if not args.no_build:
      run(["npm", "run", "build"])

    if not args.no_commit:
        run(["git", "add", str(target.relative_to(ROOT)).replace("\\", "/")])
        if not args.no_build:
            run(["git", "add", "package-lock.json"], check=False)
        message = args.message or f"docs({category}): publish {title}"
        diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT)
        if diff.returncode != 0:
            run(["git", "commit", "-m", message])

    if args.push:
        run(["git", "push", "origin", "HEAD:main"])


if __name__ == "__main__":
    main()
