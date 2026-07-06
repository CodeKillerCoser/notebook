// tools/build-keywords.mjs
// 生成 site/_data/keywordCloud.json，用于首页“关键词星图”。
// 依赖仓库现有 gray-matter、cheerio；不需要新增运行时依赖。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_FILE = path.join(ROOT, "site/_data/keywordCloud.json");

const STOPWORDS = new Set(`
的 了 和 与 或 在 是 为 及 到 从 把 被 对 中 上 下 一个 一种 这个 那个 这些 那些
如何 什么 为什么 我们 你们 它们 以及 进行 使用 实现 通过 需要 可以 不是 没有
是否 不要 应该 必须 而是 而不是 如果 因为 所以 但是 然后 其中 这里 那里
方式 方法 问题 示例 推荐 阶段 目标 返回 输入 输出 操作 处理 生成 文件 数据
the a an and or of to in for on with by from is are be as this that these those
how what why use using used into about guide notes chapter section step
`.split(/\s+/).filter(Boolean));

const ALIASES = new Map([
  ["ai", "AI"],
  ["ui", "UI"],
  ["ux", "UX"],
  ["rust", "Rust"],
  ["github", "GitHub"],
  ["pages", "GitHub Pages"],
  ["github pages", "GitHub Pages"],
  ["eleventy", "Eleventy"],
  ["pagefind", "Pagefind"],
  ["agent", "Agent"],
  ["runtime", "Runtime"],
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["css", "CSS"],
  ["html", "HTML"]
]);

const segmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("zh-CN", { granularity: "word" })
  : null;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function stripHtml(html) {
  const $ = load(`<!doctype html><html><body>${html}</body></html>`);
  $("script, style, pre, code, svg").remove();
  return {
    title: $("title").first().text() || $("h1").first().text(),
    headings: $("h1,h2,h3").map((_, el) => $(el).text()).get().join(" "),
    body: $("body").text()
  };
}

function normalizeToken(token) {
  let value = String(token).trim();
  if (!value) return "";
  value = value.replace(/^[#*`"'“”‘’()[\]{}<>《》,，.。:：;；!?！？、/\\-]+|[#*`"'“”‘’()[\]{}<>《》,，.。:：;；!?！？、/\\-]+$/g, "");
  if (!value) return "";
  const lower = value.toLowerCase();
  if (ALIASES.has(lower)) return ALIASES.get(lower);
  if (STOPWORDS.has(lower) || STOPWORDS.has(value)) return "";
  if (/^\d+$/.test(value)) return "";
  if (value.length === 1) return "";
  return value;
}

function normalizePathPart(part) {
  return decodeURIComponent(part)
    .replace(/^\d{2}-/, "")
    .replace(/-/g, " ")
    .trim();
}

function tokensFromText(text) {
  const out = [];
  const raw = String(text || "");

  // English / technical terms.
  for (const match of raw.matchAll(/[A-Za-z][A-Za-z0-9+#._-]{1,}(?:\s+[A-Za-z][A-Za-z0-9+#._-]{1,})?/g)) {
    const token = normalizeToken(match[0]);
    if (token) out.push(token);
  }

  // Chinese word segmentation when available.
  if (segmenter) {
    for (const part of segmenter.segment(raw)) {
      if (!part.isWordLike) continue;
      const token = normalizeToken(part.segment);
      if (token) out.push(token);
    }
  } else {
    for (const match of raw.matchAll(/[\u4e00-\u9fa5]{2,8}/g)) {
      const token = normalizeToken(match[0]);
      if (token) out.push(token);
    }
  }

  return out;
}

function add(scores, token, amount, sourceUrl) {
  const text = normalizeToken(token);
  if (!text) return;
  const current = scores.get(text) || { text, score: 0, urls: new Map() };
  current.score += amount;
  current.urls.set(sourceUrl, (current.urls.get(sourceUrl) || 0) + amount);
  scores.set(text, current);
}

function slugifySearch(text) {
  return `/search.html?q=${encodeURIComponent(text)}`;
}

function generatePositions(items) {
  const max = Math.max(...items.map((item) => item.score), 1);
  const min = Math.min(...items.map((item) => item.score), 0);
  const tones = ["primary", "secondary", "tertiary"];
  return items.map((item, index) => {
    const t = max === min ? 1 : (item.score - min) / (max - min);
    const angle = (index * 137.508 + 18) * Math.PI / 180;
    const radius = 18 + Math.sqrt((index + 1) / items.length) * 38;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius * .72;
    const bestUrl = [...item.urls.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || slugifySearch(item.text);
    return {
      text: item.text,
      score: Number(item.score.toFixed(2)),
      url: slugifySearch(item.text),
      relatedUrl: bestUrl,
      x: Number(Math.max(8, Math.min(92, x)).toFixed(2)),
      y: Number(Math.max(10, Math.min(90, y)).toFixed(2)),
      size: Number((0.72 + t * 1.18).toFixed(2)),
      delay: Number((-(index % 11) * .28).toFixed(2)),
      duration: Number((7.8 + (index % 9) * .55).toFixed(2)),
      tone: tones[index % tones.length],
      weight: t > .72 ? "strong" : "normal"
    };
  });
}

const scores = new Map();

for (const file of walk(CONTENT_DIR)) {
  const rel = path.relative(CONTENT_DIR, file).split(path.sep).join("/");
  const url = `/${rel}`;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const parts = rel.split("/").slice(0, -1);
  const doc = stripHtml(parsed.content);
  const explicitTags = Array.isArray(parsed.data.tags)
    ? parsed.data.tags
    : typeof parsed.data.tags === "string"
      ? parsed.data.tags.split(/[,，]/)
      : [];

  const ageDays = parsed.data.date
    ? Math.max(0, (Date.now() - new Date(parsed.data.date).getTime()) / 86400000)
    : 180;
  const recencyBoost = 1 + 0.35 * Math.exp(-ageDays / 120);

  for (const tag of explicitTags) add(scores, tag, 14 * recencyBoost, url);
  for (const part of parts) add(scores, normalizePathPart(part), 8 * recencyBoost, url);

  for (const token of tokensFromText(parsed.data.title || doc.title)) add(scores, token, 8 * recencyBoost, url);
  for (const token of tokensFromText(doc.headings)) add(scores, token, 3.5 * recencyBoost, url);
  for (const token of tokensFromText(doc.body)) add(scores, token, 0.38 * recencyBoost, url);
}

const result = generatePositions(
  [...scores.values()]
    .filter((item) => item.score >= 2.6)
    .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text, "zh-CN"))
    .slice(0, 64)
);

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(ROOT, OUT_FILE)} with ${result.length} keywords.`);
