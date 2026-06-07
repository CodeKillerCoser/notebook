import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SRC_DIR = path.join(process.cwd(), "src");
const SEGMENT_TITLES = {
  rust: "Rust",
  "AI工程": "AI 工程",
  "Git部署": "Git 部署"
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name === "assets") return [];
      return walk(fullPath);
    }
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

function titleFromHtml(content, fallback) {
  const h1 = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]) || fallback;
  return fallback;
}

function titleFromSegment(segment) {
  const decoded = decodeURIComponent(segment);
  return (SEGMENT_TITLES[decoded] || decoded)
    .replace(/^\d{2}-/, "")
    .replace(/-/g, " ");
}

function makeCrumbs(parts, includeFile, title) {
  const crumbs = [{ title: "Notebook", url: "/index.html" }];
  const folderParts = includeFile ? parts.slice(0, -1) : parts;
  folderParts.forEach((part, index) => {
    const dirPath = parts.slice(0, index + 1).join("/");
    crumbs.push({
      title: titleFromSegment(part),
      url: `/${dirPath}/index.html`
    });
  });

  if (includeFile) {
    crumbs.push({
      title,
      url: `/${parts.join("/")}`
    });
  }

  return crumbs;
}

function tagSlug(tag) {
  return String(tag).trim().replace(/[\\/#?%*:|"<>]/g, "-").replace(/\s+/g, "-");
}

function parentDir(dirPath) {
  if (!dirPath || !dirPath.includes("/")) return "";
  return dirPath.split("/").slice(0, -1).join("/");
}

function loadArticles() {
  return walk(SRC_DIR)
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);
      if (parsed.data.type !== "article") return null;

      const relPath = slash(path.relative(SRC_DIR, filePath));
      const parts = relPath.split("/");
      const fallbackTitle = path.basename(relPath, ".html");
      const title = parsed.data.title || titleFromHtml(parsed.content, fallbackTitle);
      const dirPath = parts.slice(0, -1).join("/");
      const text = stripTags(parsed.content);

      return {
        title,
        url: `/${relPath}`,
        sourcePath: relPath,
        dirPath,
        category: parsed.data.category || titleFromSegment(parts[0] || "Notebook"),
        tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
        date: parsed.data.date || new Date(0).toISOString(),
        excerpt: parsed.data.description || text.slice(0, 180),
        breadcrumbs: parsed.data.breadcrumbs || makeCrumbs(parts, true, title)
      };
    })
    .filter(Boolean)
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
    const dir = directories.get(article.dirPath);
    if (dir) dir.articles.push(article);
  }

  const list = [...directories.values()];
  for (const dir of list) {
    if (!dir.parent) continue;
    const parent = directories.get(dir.parent);
    if (parent) parent.children.push(dir);
  }

  for (const dir of list) {
    dir.children.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    dir.articles.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
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
            { title: "Notebook", url: "/index.html" },
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
