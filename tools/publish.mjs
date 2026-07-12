import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { load } from "cheerio";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const md = new MarkdownIt({ html: true, linkify: true, typographer: false });

function usage() {
  console.log(`Usage:
  node tools/publish.mjs <source.md|source.html> <blog/path.html> [options]

Options:
  --title <title>       Override title
  --tags <a,b,c>        Optional tags stored inside the content file
  --date <iso-date>     Override publish date
  --category <name>     Override category
  --description <text> Override homepage/search summary
  --message <message>   Commit message
  --no-build           Skip npm build and link check
  --no-commit          Skip git commit
  --push               Push HEAD to origin/main after commit

Examples:
  node tools/publish.mjs notes/cargo.md rust/01-基础入门/Cargo-补充.html
  node tools/publish.mjs notes/agent.html AI工程/Agent/多Agent设计.html --tags AI工程,Agent --push

Tip:
  npm run publish -- <source> <target> 也可以用于无额外参数的简单发布。`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });
  if (result.status !== 0 && options.check !== false) {
    process.exit(result.status || 1);
  }
  return result;
}

function parseArgs(argv) {
  const positional = [];
  const options = {
    title: "",
    tags: "",
    date: "",
    category: "",
    description: "",
    message: "",
    build: true,
    commit: true,
    push: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else if (arg === "--title") {
      options.title = argv[++index] || "";
    } else if (arg === "--tags") {
      options.tags = argv[++index] || "";
    } else if (arg === "--date") {
      options.date = argv[++index] || "";
    } else if (arg === "--category") {
      options.category = argv[++index] || "";
    } else if (arg === "--description") {
      options.description = argv[++index] || "";
    } else if (arg === "--message") {
      options.message = argv[++index] || "";
    } else if (arg === "--no-build") {
      options.build = false;
    } else if (arg === "--no-commit") {
      options.commit = false;
    } else if (arg === "--push") {
      options.push = true;
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 2) {
    usage();
    process.exit(2);
  }
  return { source: positional[0], target: positional[1], options };
}

function safeTargetPath(value) {
  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  const rel = normalized.endsWith(".html") ? normalized : `${normalized}.html`;
  const parts = rel.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error("Target path must be a safe relative path.");
  }
  return rel;
}

function stripTags(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromMarkdown(markdown, fallback) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : fallback;
}

function titleFromHtml(html, fallback) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return stripTags(title?.[1] || h1?.[1] || fallback);
}

function bodyFromHtml(html) {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return (body ? body[1] : html).trim();
}

function comparableTitle(value = "") {
  return stripTags(value)
    .toLocaleLowerCase("zh-CN")
    .replace(/[\s:：,，.。!！?？、·•—–\-_()（）《》“”"'`|]/g, "");
}

function sameTitle(left, right) {
  const normalizedLeft = comparableTitle(left);
  const normalizedRight = comparableTitle(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function normalizeHtmlFragment(html, title) {
  const wrapped = /<html[\s>]/i.test(html)
    ? html
    : `<!doctype html><html><body><div id="publish-source">${html}</div></body></html>`;
  const $ = load(wrapped, { decodeEntities: false });
  const body = $("body").length ? $("body") : $.root();
  let source = $("main.article").first();
  if (!source.length) source = $(".article-content").first();
  if (!source.length) source = $("article").first();
  if (!source.length) source = $("main").first();
  if (!source.length) source = $("#publish-source").first();
  if (!source.length) source = body;

  const preservedContentScopes = ["ui-guide"].filter((className) => {
    return source.hasClass(className) || source.find(`.${className}`).length;
  });

  function hasPreservedPresentation(element) {
    const current = $(element);
    return preservedContentScopes.some((className) => {
      return source.hasClass(className) || current.closest(`.${className}`).length;
    });
  }

  source.find("script, style, template, link[rel='stylesheet'], header, nav, aside, .toc, .article-toc, #TOC, [data-toc]").remove();
  source.children(".breadcrumb, .breadcrumbs, .pathline, .meta, .meta-row, .badge-row, .tags, .tag-list").remove();
  source.find(".hero, .article-hero, .title-block").each((_, element) => {
    const block = $(element);
    if (block.find("h1").length) block.remove();
  });

  source.find("h1").each((_, element) => {
    const heading = $(element);
    if (sameTitle(heading.text(), title)) {
      heading.remove();
      return;
    }
    heading.replaceWith(`<h2>${heading.html() || ""}</h2>`);
  });

  source.find("[style]").each((_, element) => {
    const current = $(element);
    if (!current.closest("svg").length && !hasPreservedPresentation(element)) {
      current.removeAttr("style");
    }
  });
  source.find(".card, .container, .layout, .page").each((_, element) => {
    const current = $(element);
    current.removeClass("card container layout page soft");
    if (!current.attr("class")?.trim()) current.removeAttr("class");
  });

  const normalized = (source.html() || "").trim();
  const sourceScopes = preservedContentScopes.filter((className) => source.hasClass(className));
  return sourceScopes.length
    ? `<div class="${sourceScopes.join(" ")}">${normalized}</div>`
    : normalized;
}

function descriptionFromHtml(html) {
  const $ = load(`<main>${html}</main>`);
  const text = stripTags($("main p").first().text());
  return text.length > 160 ? `${text.slice(0, 157).trim()}...` : text;
}

function normalizeTags(value, parsedTags) {
  const fromOption = value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
  const fromFrontMatter = Array.isArray(parsedTags)
    ? parsedTags.map((tag) => String(tag).trim()).filter(Boolean)
    : typeof parsedTags === "string"
      ? parsedTags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
      : [];
  return [...new Set([...fromOption, ...fromFrontMatter])];
}

function frontMatter({ title, date, category, description, tags }) {
  const lines = ["---", `title: ${JSON.stringify(title)}`, `date: ${JSON.stringify(date)}`];
  if (category) lines.push(`category: ${JSON.stringify(category)}`);
  if (description) lines.push(`description: ${JSON.stringify(description)}`);
  if (tags.length) {
    lines.push("tags:");
    for (const tag of tags) lines.push(`  - ${JSON.stringify(tag)}`);
  }
  lines.push("---", "");
  return `${lines.join("\n")}\n`;
}

function renderSource(sourcePath, targetRel, options) {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const ext = path.extname(sourcePath).toLowerCase();
  const fallback = path.basename(targetRel, ".html");
  const parsed = matter(raw);

  if (ext === ".md" || ext === ".markdown") {
    const title = options.title || parsed.data.title || titleFromMarkdown(parsed.content, fallback);
    const html = normalizeHtmlFragment(md.render(parsed.content), title);
    return {
      title,
      tags: normalizeTags(options.tags, parsed.data.tags),
      date: parsed.data.date,
      category: parsed.data.category,
      description: parsed.data.description || descriptionFromHtml(html),
      html
    };
  }

  if (ext === ".html" || ext === ".htm") {
    const body = bodyFromHtml(parsed.content);
    const title = options.title || parsed.data.title || titleFromHtml(parsed.content, fallback);
    const html = normalizeHtmlFragment(body, title);
    return {
      title,
      tags: normalizeTags(options.tags, parsed.data.tags),
      date: parsed.data.date,
      category: parsed.data.category,
      description: parsed.data.description || descriptionFromHtml(html),
      html
    };
  }

  throw new Error("Source must be a Markdown or HTML file.");
}

function categoryFromTarget(targetRel) {
  const root = targetRel.split("/")[0];
  return ({
    AI工程: "AI 工程",
    Git部署: "Git 部署",
    UI设计: "UI 设计",
    rust: "Rust"
  })[root] || root;
}

function isoDate(value) {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

const { source, target, options } = parseArgs(process.argv.slice(2));
const sourcePath = path.resolve(source);
if (!fs.existsSync(sourcePath)) throw new Error(`Source not found: ${sourcePath}`);

const targetRel = safeTargetPath(target);
const targetPath = path.join(CONTENT, targetRel);
const rendered = renderSource(sourcePath, targetRel, options);
const date = isoDate(options.date || rendered.date) || new Date().toISOString();
const category = options.category || rendered.category || categoryFromTarget(targetRel);
const description = options.description || rendered.description;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(
  targetPath,
  `${frontMatter({ title: rendered.title, date, category, description, tags: rendered.tags })}${rendered.html.trim()}\n`,
  "utf8"
);

console.log(`Wrote content/${targetRel}`);

if (options.build) {
  run("npm", ["run", "build"]);
  run("npm", ["run", "check:content"]);
  run("npm", ["run", "check:links"]);
}

if (options.commit) {
  run("git", ["add", `content/${targetRel}`, "site/_data/keywordCloud.json"]);
  const diff = spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: ROOT, shell: process.platform === "win32" });
  if (diff.status !== 0) {
    const message = options.message || `docs: publish ${rendered.title}`;
    run("git", ["commit", "-m", message]);
  }
}

if (options.push) {
  run("git", ["push", "origin", "HEAD"]);
}
