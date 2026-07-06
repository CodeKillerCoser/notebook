import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import { load } from "cheerio";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import site from "./site.js";

const CONTENT_DIR = path.join(process.cwd(), "content");
loadLanguages(["rust", "bash", "json", "yaml", "toml", "javascript", "typescript", "css", "markup", "python", "powershell"]);

const SEGMENT_TITLES = {
  rust: "Rust",
  "AI工程": "AI 工程",
  "Git部署": "Git 部署"
};

const LANGUAGE_ALIASES = {
  html: "markup",
  htm: "markup",
  xml: "markup",
  svg: "markup",
  js: "javascript",
  mjs: "javascript",
  ts: "typescript",
  shell: "bash",
  sh: "bash",
  ps: "powershell",
  ps1: "powershell",
  yml: "yaml",
  rs: "rust",
  py: "python",
  plain: "text",
  plaintext: "text",
  txt: "text"
};

const TITLE_PREFIX_RE = /^\s*(?:第?[一二三四五六七八九十百千]+[、.．)）]\s*|[（(]?[一二三四五六七八九十]+[)）]\s*|\d+[、.．)）]\s*|[（(]\d+[)）]\s*)/u;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function slash(value) {
  return value.split(path.sep).join("/");
}

function stripTags(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeading(value = "") {
  return String(value).replace(TITLE_PREFIX_RE, "").replace(/\s+/g, " ").trim();
}

function titleFromSegment(segment) {
  const decoded = decodeURIComponent(segment);
  return (SEGMENT_TITLES[decoded] || decoded)
    .replace(/^\d{2}-/, "")
    .replace(/-/g, " ");
}

function tagSlug(tag) {
  return String(tag).trim().replace(/[\\/#?%*:|"<>]/g, "-").replace(/\s+/g, "-");
}

function slugify(text, used) {
  const base = String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";
  let slug = base;
  let index = 2;
  while (used.has(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  used.add(slug);
  return slug;
}

function languageFromClass(value = "") {
  const match = String(value).match(/(?:^|\s)(?:language|lang)-([a-z0-9+-]+)/i);
  if (!match) return "text";
  const raw = match[1].toLowerCase();
  return LANGUAGE_ALIASES[raw] || raw;
}

function languageLabel(language) {
  if (language === "markup") return "html";
  return language || "text";
}

function highlightCodeBlocks($, source) {
  source.find("pre > code").each((_, element) => {
    const code = $(element);
    const pre = code.parent("pre");
    const language = languageFromClass(`${code.attr("class") || ""} ${pre.attr("class") || ""}`);
    const raw = code.text();
    const grammar = Prism.languages[language];
    const normalizedLanguage = grammar ? language : "text";

    if (grammar) {
      code.html(Prism.highlight(raw, grammar, language));
    } else {
      code.text(raw);
    }

    pre.attr("class", `language-${normalizedLanguage}`);
    pre.attr("data-language", languageLabel(normalizedLanguage));
    code.attr("class", `language-${normalizedLanguage}`);
  });
}

function parentDir(dirPath) {
  if (!dirPath || !dirPath.includes("/")) return "";
  return dirPath.split("/").slice(0, -1).join("/");
}

function makeCrumbs(parts, includeFile, title) {
  const crumbs = [{ title: site.title, url: "/index.html" }];
  const folderParts = includeFile ? parts.slice(0, -1) : parts;
  folderParts.forEach((part, index) => {
    const dirPath = parts.slice(0, index + 1).join("/");
    crumbs.push({
      title: titleFromSegment(part),
      url: `/${dirPath}/index.html`
    });
  });
  if (includeFile) {
    crumbs.push({ title, url: `/${parts.join("/")}` });
  }
  return crumbs;
}

function gitDate(relPath) {
  const result = spawnSync("git", ["log", "-1", "--format=%cI", "--", `content/${relPath}`], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function normalizeTags(tags, relPath) {
  const explicit = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(/[,，]/)
      : [];
  const fromPath = relPath
    .split("/")
    .slice(0, -1)
    .map(titleFromSegment)
    .filter(Boolean);
  return [...new Set([...explicit.map((tag) => String(tag).trim()).filter(Boolean), ...fromPath])];
}

function readArticleHtml(content, fallbackTitle) {
  const documentHtml = `<!doctype html><html><body>${content}</body></html>`;
  const $ = load(/<html[\s>]/i.test(content) ? content : documentHtml, { decodeEntities: false });
  const body = $("body").length ? $("body") : $.root();
  const title =
    stripTags($("title").first().text()) ||
    stripTags($("h1").first().text()) ||
    fallbackTitle;
  const subtitle = stripTags($(".subtitle").first().text());
  const eyebrow = stripTags($(".eyebrow").first().text());
  const chips = $(".meta .chip")
    .map((_, element) => stripTags($(element).text()))
    .get()
    .filter(Boolean);

  let source = $("main.article").first();
  if (!source.length) source = $(".article-content").first();
  if (!source.length) source = $("article").first();
  if (!source.length) source = body;

  source.find("script, style, nav.toc, aside.toc, .article-toc, #TOC, header.hero, #title-block-header").remove();
  const firstHeading = source.children("h1").first();
  if (firstHeading.length && stripTags(firstHeading.text()) === title) {
    firstHeading.remove();
  }

  const usedIds = new Set();
  const toc = [];
  source.find("h2, h3").each((index, element) => {
    const heading = $(element);
    heading.find(".section-number, .section-index").remove();
    const rawText = stripTags(heading.text());
    const text = cleanHeading(rawText) || rawText || `章节 ${index + 1}`;
    const existingId = heading.attr("id");
    const id = existingId || slugify(text, usedIds);
    if (existingId) usedIds.add(existingId);
    heading.attr("id", id);
    if (element.tagName.toLowerCase() === "h2") {
      if (!heading.find(".section-index").length) {
        heading.html(`<span class="section-index">${toc.length + 1}</span><span class="section-title">${heading.html()}</span>`);
      }
      toc.push({ id, text });
    }
  });

  highlightCodeBlocks($, source);

  const tagName = source.get(0)?.tagName?.toLowerCase();
  const shouldKeepSourceWrapper = tagName === "article" && Object.keys(source.attr() || {}).length > 0;
  const html = (shouldKeepSourceWrapper ? $.html(source) : source.html())?.trim() || "";
  return { title, subtitle, eyebrow, chips, html, text: stripTags(html), toc };
}

function loadArticles() {
  return walk(CONTENT_DIR)
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);
      const relPath = slash(path.relative(CONTENT_DIR, filePath));
      const parts = relPath.split("/");
      const dirPath = parts.slice(0, -1).join("/");
      const fallbackTitle = path.basename(relPath, ".html");
      const extracted = readArticleHtml(parsed.content, fallbackTitle);
      const title = parsed.data.title || extracted.title;
      const stat = fs.statSync(filePath);
      const date = parsed.data.date || gitDate(relPath) || stat.mtime.toISOString();
      const category = parsed.data.category || titleFromSegment(parts[0] || site.title);
      const tags = normalizeTags(parsed.data.tags, relPath);

      return {
        title,
        url: `/${relPath}`,
        permalink: `/${relPath}`,
        sourcePath: relPath,
        dirPath,
        category,
        tags,
        date,
        excerpt: parsed.data.description || extracted.subtitle || extracted.text.slice(0, 180),
        eyebrow: parsed.data.eyebrow || extracted.eyebrow,
        chips: Array.isArray(parsed.data.chips) ? parsed.data.chips : extracted.chips,
        html: extracted.html,
        toc: extracted.toc,
        breadcrumbs: makeCrumbs(parts, true, title)
      };
    })
    .sort((a, b) => {
      const dateDelta = new Date(b.date) - new Date(a.date);
      if (dateDelta) return dateDelta;
      return a.title.localeCompare(b.title, "zh-CN");
    });
}

function buildDirectories(articles) {
  const directories = new Map();

  function ensure(dirPath) {
    if (!dirPath || directories.has(dirPath)) return;
    const parts = dirPath.split("/");
    const title = titleFromSegment(parts[parts.length - 1]);
    directories.set(dirPath, {
      path: dirPath,
      title,
      permalink: `/${dirPath}/index.html`,
      breadcrumbs: makeCrumbs(parts, false, title),
      parent: parentDir(dirPath),
      children: [],
      articles: []
    });
    ensure(parentDir(dirPath));
  }

  for (const article of articles) {
    ensure(article.dirPath);
    directories.get(article.dirPath)?.articles.push(article);
  }

  const list = [...directories.values()];
  for (const dir of list) {
    if (!dir.parent) continue;
    directories.get(dir.parent)?.children.push(dir);
  }

  for (const dir of list) {
    dir.children.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    dir.articles.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "zh-CN"));
  }

  return list.sort((a, b) => a.path.localeCompare(b.path, "zh-CN"));
}

function buildTags(articles) {
  const tags = new Map();
  for (const article of articles) {
    for (const tag of article.tags) {
      if (!tags.has(tag)) {
        tags.set(tag, {
          name: tag,
          slug: tagSlug(tag),
          permalink: `/tags/${tagSlug(tag)}.html`,
          breadcrumbs: [
            { title: site.title, url: "/index.html" },
            { title: "标签", url: "/tags/index.html" },
            { title: tag, url: `/tags/${tagSlug(tag)}.html` }
          ],
          articles: []
        });
      }
      tags.get(tag).articles.push(article);
    }
  }
  return [...tags.values()].sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

const articles = loadArticles();
const directories = buildDirectories(articles);
const tags = buildTags(articles);

export default {
  articles,
  directories,
  tags,
  topDirectories: directories.filter((dir) => !dir.parent)
};
