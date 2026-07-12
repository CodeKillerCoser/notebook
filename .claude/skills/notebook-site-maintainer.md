---
name: notebook-site-maintainer
description: Maintain the notebook Eleventy templates, homepage, themes, fonts, article normalization, keyword corpus, search, responsive UI, and GitHub Pages deployment.
---

# notebook-site-maintainer (Claude)

Read `.skills/notebook-site-maintainer/SKILL.md` and its referenced files before changing the site system.

Core rules:

- Keep article content semantic; templates own all page styling and structure.
- Preserve the unified homepage masthead and keyword map background.
- Apply themes and reading fonts consistently across homepage and articles.
- Rebuild keyword data through `tools/build-keywords.mjs`; do not hand-edit generated rankings.
- Run full build, link checks, structural checks, and desktop/mobile browser QA.
