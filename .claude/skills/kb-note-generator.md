---
name: kb-note-generator
description: Generate Eleventy-compatible HTML knowledge notes in content/**/*.html, following notebook UI rules, search metadata, and GitHub workflow.
---

# kb-note-generator (Claude)

> 此文件是 Claude Code 的 skill 发现入口。规范 skill 文件位于 `.skills/kb-note-generator/`。

## Instructions

When this skill is triggered, read the canonical skill file at `.skills/kb-note-generator/SKILL.md` for the complete workflow.

Reference files (read as needed):
- `.skills/kb-note-generator/references/output_structure.md`
- `.skills/kb-note-generator/references/output_template.md`
- `.skills/kb-note-generator/references/github_workflow.md`

## Quick Reference

- Extract knowledge points from conversation history and generate structured HTML notes
- Write only semantic fragments under `content/**/*.html`; do not add an `<article>` wrapper, page shell, hero, TOC, inline CSS, or article `<h1>`
- Organize by topic into existing notebook directories and include `description` for homepage/directory summaries
- Let the content path define the URL; do not add `permalink`
- Run `npm run build` so keywordCloud, Eleventy pages, RSS, and Pagefind stay current
- Target repo: `https://github.com/CodeKillerCoser/notebook` (branch: `main`)
- Commit format: `docs(<topic>): <brief description>`
