---
name: kb-note-generator
description: Generate structured HTML knowledge notes from chat history and commit to GitHub notebook repo.
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
- Organize by topic into `01-基础入门/` … `04-综合案例/` directories
- Target repo: `https://github.com/CodeKillerCoser/notebook` (branch: `main`)
- Commit format: `docs(<topic>): <brief description>`
