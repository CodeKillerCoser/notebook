import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import MarkdownIt from "markdown-it";
import matter from "gray-matter";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const CONTENT_ROOTS = ["Agent", "AI工程", "Git部署", "rust", "代码大全阅读笔记"];
const ROOT_LINKS = new Set(["index.html", "README.html", "search.html", "feed.xml", "tags", "assets", "pagefind"]);
const SEGMENT_TITLES = {
  rust: "Rust",
  "AI工程": "AI 工程",
  "Git部署": "Git 部署"
};
const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

function slash(value) {
  return value.split(path.sep).join("/");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() ? [fullPath] : [];
  });
}

function stripTags(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTitle(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function titleFromMarkdown(raw, fallback) {
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? normalizeTitle(match[1]) : fallback;
}

function titleFromHtml(raw, fallback) {
  const $ = cheerio.load(raw, { decodeEntities: false });
  const candidates = [
    $("title").first().text().trim(),
    ...$("h1").map((_, element) => $(element).text().trim()).get()
  ].map(normalizeTitle).filter(Boolean);
  return candidates.find((candidate) => !candidate.includes("�")) || candidates[0] || fallback;
}

function updateLinks(html, relOutput) {
  const rootSegment = relOutput.split("/")[0];
  const $ = cheerio.load(`<main>${html}</main>`, { decodeEntities: false });
  $("header#title-block-header").each((_, element) => {
    if ($(element).text().includes("�")) $(element).remove();
  });
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return;
    let updated = href.replace(/\.md(?=($|#|\?))/i, ".html");
    if (updated.startsWith("/") && rootSegment && !ROOT_LINKS.has(rootSegment)) {
      const first = updated.replace(/^\//, "").split("/")[0];
      if (!ROOT_LINKS.has(first) && first !== rootSegment && !CONTENT_ROOTS.includes(first)) {
        updated = `/${rootSegment}${updated}`;
      }
    }
    $(element).attr("href", updated);
  });
  return $("main").html() || html;
}

function getGitDate(relPath) {
  try {
    const output = execFileSync("git", ["log", "-1", "--format=%cI", "--", relPath], {
      cwd: ROOT,
      encoding: "utf8"
    }).trim();
    return output || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function segmentTitle(segment) {
  return (SEGMENT_TITLES[segment] || segment).replace(/^\d{2}-/, "").replace(/-/g, " ");
}

function tagsFor(relOutput) {
  const parts = relOutput.split("/");
  const tags = [];
  if (parts[0] && parts[0] !== "README.html") tags.push(segmentTitle(parts[0]));
  for (const part of parts.slice(1, -1)) tags.push(segmentTitle(part));
  return [...new Set(tags.length ? tags : ["Notebook"])];
}

function categoryFor(relOutput) {
  const first = relOutput.split("/")[0];
  return first && first !== "README.html" ? segmentTitle(first) : "Notebook";
}

function breadcrumbsFor(relOutput, title) {
  const parts = relOutput.split("/");
  const crumbs = [{ title: "Notebook", url: "/index.html" }];
  parts.slice(0, -1).forEach((part, index) => {
    crumbs.push({
      title: segmentTitle(part),
      url: `/${parts.slice(0, index + 1).join("/")}/index.html`
    });
  });
  crumbs.push({ title, url: `/${relOutput}` });
  return crumbs;
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function frontMatter(data) {
  const lines = ["---"];
  lines.push(`title: ${yamlString(data.title)}`);
  lines.push(`date: ${yamlString(data.date)}`);
  lines.push(`category: ${yamlString(data.category)}`);
  lines.push("tags:");
  for (const tag of data.tags) lines.push(`  - ${yamlString(tag)}`);
  lines.push("breadcrumbs:");
  for (const crumb of data.breadcrumbs) {
    lines.push(`  - title: ${yamlString(crumb.title)}`);
    lines.push(`    url: ${yamlString(crumb.url)}`);
  }
  lines.push("layout: layouts/article.njk");
  lines.push("type: article");
  lines.push("comments: true");
  lines.push(`permalink: ${yamlString(`/${data.relOutput}`)}`);
  lines.push("---");
  return `${lines.join("\n")}\n`;
}

function markdownToHtml(raw, relOutput) {
  const parsed = matter(raw);
  return updateLinks(md.render(parsed.content), relOutput);
}

function htmlBody(raw, relOutput) {
  const $ = cheerio.load(raw, { decodeEntities: false });
  const body = $("body").length ? $("body").html() : $.root().html();
  return updateLinks(body || raw, relOutput);
}

function convertFile(filePath, relOutput) {
  const raw = fs.readFileSync(filePath, "utf8");
  const originalRel = slash(path.relative(ROOT, filePath));
  const fallback = path.basename(relOutput, ".html");
  const isMarkdown = filePath.toLowerCase().endsWith(".md");
  const title = isMarkdown ? titleFromMarkdown(raw, fallback) : titleFromHtml(raw, fallback);
  const content = isMarkdown ? markdownToHtml(raw, relOutput) : htmlBody(raw, relOutput);
  const outputPath = path.join(SRC, relOutput);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(
    outputPath,
    `${frontMatter({
      title,
      date: getGitDate(originalRel),
      category: categoryFor(relOutput),
      tags: tagsFor(relOutput),
      breadcrumbs: breadcrumbsFor(relOutput, title),
      relOutput
    })}${content.trim()}\n`,
    "utf8"
  );
  return relOutput;
}

function migrate() {
  const written = [];

  for (const rootName of CONTENT_ROOTS) {
    const rootPath = path.join(ROOT, rootName);
    for (const filePath of walk(rootPath)) {
      const ext = path.extname(filePath).toLowerCase();
      if (![".html", ".md"].includes(ext)) continue;
      if (path.basename(filePath).toLowerCase() === "index.html") continue;

      const rel = slash(path.relative(ROOT, filePath));
      const relOutput = rel.replace(/\.md$/i, ".html");
      written.push(convertFile(filePath, relOutput));
    }
  }

  const readme = path.join(ROOT, "README.md");
  if (fs.existsSync(readme)) {
    written.push(convertFile(readme, "README.html"));
  }

  console.log(`Migrated ${written.length} files:`);
  for (const file of written) console.log(`- src/${file}`);
}

migrate();
