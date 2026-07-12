import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import notebook from "../site/_data/notebook.js";

const CONTENT_DIR = path.join(process.cwd(), "content");
const OUTPUT_DIR = path.join(process.cwd(), "_site");
const STRUCTURAL_ELEMENTS = [
  "img",
  "picture",
  "source",
  "figure",
  "svg",
  "canvas",
  "video",
  "audio",
  "iframe",
  "object",
  "embed",
  "table",
  "details",
  "pre"
];
const VISUAL_CONTENT_SELECTOR = [
  ".demo",
  ".dash",
  ".chart",
  ".phone",
  ".swatch",
  ".role-color",
  ".random-color",
  ".modal-stack",
  ".states-grid",
  ".before-after"
].join(", ");
const PRESERVED_CONTENT_SCOPES = ["ui-guide"];
const failures = [];

function selectSource($) {
  let source = $("main.article").first();
  if (!source.length) source = $(".article-content").first();
  if (!source.length) source = $("article").first();
  if (!source.length) source = $("main").first();
  if (!source.length) source = $("body").length ? $("body") : $.root();
  return source;
}

function prepareExpectedSource($, title) {
  let source = selectSource($);
  source.find("script, style, template, link[rel='stylesheet'], nav, aside, header, .article-toc, #TOC, [data-toc]").remove();
  source.find(".hero, .article-hero, .title-block").each((_, element) => {
    const block = $(element);
    if (block.find("h1").length) block.remove();
  });

  const structuralChildren = source.children().filter((_, element) => {
    return !["script", "style", "template"].includes(element.tagName?.toLowerCase());
  });
  if (structuralChildren.length === 1 && structuralChildren.first().is("div, main, article")) {
    source = structuralChildren.first();
  }

  source.children(".breadcrumb, .breadcrumbs, .pathline, .meta, .meta-row, .badge-row").remove();
  source.find("h1").each((_, element) => {
    const heading = $(element);
    if (heading.text().replace(/\s+/g, "").includes(title.replace(/\s+/g, ""))) heading.remove();
  });
  return source;
}

function countElements(source, selector) {
  return source.find(selector).add(source.filter(selector)).length;
}

function compactText(value) {
  return value.replace(/\s+/g, "").trim();
}

function resourceUrls($, root) {
  const urls = [];
  root.find("img[src], source[src], source[srcset], video[src], video[poster], audio[src], iframe[src], object[data], embed[src]")
    .each((_, element) => {
      const current = $(element);
      for (const attribute of ["src", "srcset", "poster", "data"]) {
        const value = current.attr(attribute);
        if (!value) continue;
        if (attribute === "srcset") {
          for (const candidate of value.split(",")) urls.push(candidate.trim().split(/\s+/)[0]);
        } else {
          urls.push(value);
        }
      }
    });
  return urls;
}

function outputResourcePath(articlePath, resourceUrl) {
  const cleanUrl = resourceUrl.split(/[?#]/)[0];
  if (!cleanUrl || /^(?:[a-z]+:)?\/\//i.test(cleanUrl) || cleanUrl.startsWith("data:")) return "";
  let decoded;
  try {
    decoded = decodeURIComponent(cleanUrl);
  } catch {
    decoded = cleanUrl;
  }
  if (decoded.startsWith("/notebook/")) return path.join(OUTPUT_DIR, decoded.slice("/notebook/".length));
  if (decoded.startsWith("/")) return path.join(OUTPUT_DIR, decoded.slice(1));
  return path.resolve(path.dirname(articlePath), decoded);
}

for (const article of notebook.articles) {
  const sourcePath = path.join(CONTENT_DIR, article.sourcePath);
  const outputPath = path.join(OUTPUT_DIR, article.sourcePath);
  if (!fs.existsSync(outputPath)) {
    failures.push(`${article.sourcePath}: 缺少构建页面`);
    continue;
  }

  const parsed = matter(fs.readFileSync(sourcePath, "utf8"));
  const sourceDocument = /<html[\s>]/i.test(parsed.content)
    ? parsed.content
    : `<!doctype html><html><body>${parsed.content}</body></html>`;
  const source$ = load(sourceDocument, { decodeEntities: false });
  const expected = prepareExpectedSource(source$, article.title);
  const article$ = load(`<main>${article.html}</main>`, { decodeEntities: false });
  const actual = article$("main");
  const built$ = load(fs.readFileSync(outputPath, "utf8"), { decodeEntities: false });
  const builtBody = built$(".article-body").first();

  if (!builtBody.length) failures.push(`${article.sourcePath}: 构建页面缺少 .article-body`);
  if (built$("main h1").length !== 1) failures.push(`${article.sourcePath}: 页面标题数量不是 1`);
  if (builtBody.find("h1").length) failures.push(`${article.sourcePath}: 正文仍包含 h1`);

  for (const selector of STRUCTURAL_ELEMENTS) {
    const expectedCount = countElements(expected, selector);
    const actualCount = countElements(actual, selector);
    const builtCount = countElements(builtBody, selector);
    if (actualCount < expectedCount) {
      failures.push(`${article.sourcePath}: ${selector} 从 ${expectedCount} 减少为 ${actualCount}`);
    }
    if (builtCount !== actualCount) {
      failures.push(`${article.sourcePath}: 构建后的 ${selector} 数量 ${builtCount} 与数据层 ${actualCount} 不一致`);
    }
  }

  const expectedVisuals = countElements(expected, VISUAL_CONTENT_SELECTOR);
  const actualVisuals = countElements(actual, VISUAL_CONTENT_SELECTOR);
  if (actualVisuals < expectedVisuals) {
    failures.push(`${article.sourcePath}: 视觉案例从 ${expectedVisuals} 减少为 ${actualVisuals}`);
  }

  const expectedText = compactText(expected.text());
  const actualText = compactText(actual.text());
  if (expectedText.length >= 80 && actualText.length / expectedText.length < 0.94) {
    failures.push(`${article.sourcePath}: 正文文本保留率低于 94%`);
  }

  for (const className of PRESERVED_CONTENT_SCOPES) {
    const expectedScope = expected.hasClass(className) || expected.find(`.${className}`).length;
    if (!expectedScope) continue;
    if (!article.contentClasses.includes(className) || !builtBody.hasClass(className)) {
      failures.push(`${article.sourcePath}: 受控作用域 .${className} 未传递到文章模板`);
    }
    const expectedStyles = expected.find("[style]").add(expected.filter("[style]")).length;
    const actualStyles = actual.find("[style]").length;
    if (actualStyles < expectedStyles) {
      failures.push(`${article.sourcePath}: 视觉展示参数从 ${expectedStyles} 减少为 ${actualStyles}`);
    }
  }

  for (const resourceUrl of resourceUrls(article$, actual)) {
    const resourcePath = outputResourcePath(outputPath, resourceUrl);
    if (resourcePath && !fs.existsSync(resourcePath)) {
      failures.push(`${article.sourcePath}: 找不到资源 ${resourceUrl}`);
    }
  }
}

if (failures.length) {
  console.error(`正文完整性检查失败（${failures.length} 项）：`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`正文完整性检查通过：${notebook.articles.length} 篇文章，媒体、结构化内容与视觉案例均已保留。`);
