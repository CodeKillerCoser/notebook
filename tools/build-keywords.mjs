// Build the homepage corpus map from article titles, headings and body text.
// The corpus is intentionally recomputed on every build: the current site is
// small enough that a full pass is cheap and it also handles edits/deletions.

import fs from "node:fs";
import path from "node:path";

import { load } from "cheerio";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_FILE = path.join(ROOT, "site/_data/keywordCloud.json");
const MAX_KEYWORDS = 50;

const STOPWORDS = new Set(`
的 了 和 与 或 在 是 为 及 到 从 把 被 对 中 上 下 内 外 前 后 一个 一种 这个 那个 这些 那些
如何 什么 为什么 我们 你们 它们 以及 进行 使用 实现 通过 需要 可以 不是 没有 是否 不要 应该
必须 而是 如果 因为 所以 但是 然后 其中 这里 那里 方式 方法 问题 示例 推荐 阶段 目标 返回
输入 输出 操作 处理 生成 文件 数据 文章 内容 相关 完整 关键 核心 主要 基本 常见 具体 当前
目前 后续 例如 同时 可能 直接 仍然 只要 无法 并且 另外 最终 此时 此外 这样 那么 已经 之后
之前 时候 情况 过程 结果 作用 说明 定义 理解 判断 对应 确保 支持 包含 提供 负责 发现 看到
认为 意味着 适合 建议 注意 下面 上面 第一 第二 第三 一次 多个 每个 整个 所有 任何 这种
作为 只有 由于 对于 根据 之间 选择 形式 主题 章节 部分 角度 位置 方案 结构 逻辑 笔记 指南
入门 进阶 案例 阅读 顺序 新增 一篇 一套 一类 两种 三个 中的 原因 正确 有权 解决
而不是 只是 不能 明确 真实 简单 复杂 解释 比较 不会 通常 常用 创建 修改 进入 检查 标准
统一 场景 对比 两个 文档
the a an and or of to in for on with by from is are be as this that these those how what why use using
used into about guide notes chapter section step can could should would may might must will just also
than then when where which who whose it its they them their we our you your not no yes do does did done
let const var fn pub mut impl mod return true false null undefined self crate super href class div span if
`.split(/\s+/).filter(Boolean).map((word) => word.toLowerCase()));

// Casing and spelling normalization only. These entries never introduce a
// keyword: a term still has to be present in the article corpus.
const CANONICAL = new Map(Object.entries({
  ai: "AI",
  agent: "Agent",
  "agent runtime": "Agent Runtime",
  api: "API",
  arc: "Arc",
  cargo: "Cargo",
  "chars nth": "chars().nth()",
  css: "CSS",
  git: "Git",
  github: "GitHub",
  "github actions": "GitHub Actions",
  "github pages": "GitHub Pages",
  hashmap: "HashMap",
  html: "HTML",
  javascript: "JavaScript",
  leetcode: "LeetCode",
  linux: "Linux",
  mvp: "MVP",
  option: "Option",
  os: "OS",
  pagefind: "Pagefind",
  rust: "Rust",
  runtime: "Runtime",
  sandbox: "Sandbox",
  send: "Send",
  "send sync": "Send + Sync",
  sop: "SOP",
  string: "String",
  typescript: "TypeScript",
  ui: "UI",
  utf8: "UTF-8",
  "utf-8": "UTF-8",
  ux: "UX",
  windows: "Windows"
}));

const PHRASE_BREAKS = new Set(`
的 了 和 与 或 在 是 为 及 到 从 把 被 对 中 上 下 内 外 前 后 一个 一种 这个 那个 这些 那些
如何 什么 为什么 我们 你们 它们 以及 进行 使用 通过 需要 可以 不是 没有 是否 不要 应该
必须 而是 如果 因为 所以 但是 然后 其中 这里 那里 例如 同时 可能 直接 并且 另外 最终
作为 只有 由于 对于 根据 之间 之后 之前 时候 那么 这样 笔记 两 两个 个
the a an and or of to in for on with by from is are be as this that these those how what why
`.split(/\s+/).filter(Boolean).map((word) => word.toLowerCase()));

const segmenter = new Intl.Segmenter("zh-CN", { granularity: "word" });

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function cleanToken(raw) {
  const value = String(raw || "")
    .normalize("NFKC")
    .trim()
    .replace(/^[#*`"'“”‘’()[\]{}<>《》,，.。:：;；!?！？、/\\|&=+_-]+|[#*`"'“”‘’()[\]{}<>《》,，.。:：;；!?！？、/\\|&=+_-]+$/g, "");
  if (!value || /^\d+(?:\.\d+)?$/.test(value)) return "";

  const lower = value.toLowerCase();
  if (STOPWORDS.has(lower) || /^https?:|^www\./i.test(value)) return "";
  if (/^[a-z]$/i.test(value) || /^[\u4e00-\u9fff]$/.test(value)) return "";
  if (value.length > 36) return "";
  if (CANONICAL.has(lower)) return CANONICAL.get(lower);

  return /^[A-Za-z][A-Za-z0-9+#._:/-]*$/.test(value) ? lower : value;
}

function cleanPhrasePart(raw) {
  const value = String(raw || "")
    .normalize("NFKC")
    .trim()
    .replace(/^[#*`"'“”‘’()[\]{}<>《》,，.。:：;；!?！？、/\\|&=+_-]+|[#*`"'“”‘’()[\]{}<>《》,，.。:：;；!?！？、/\\|&=+_-]+$/g, "");
  if (!value || /^\d+(?:\.\d+)?$/.test(value)) return "";

  const lower = value.toLowerCase();
  if (PHRASE_BREAKS.has(lower) || /^https?:|^www\./i.test(value)) return "";
  if (/^[a-z]$/i.test(value) || value.length > 24) return "";
  if (CANONICAL.has(lower)) return CANONICAL.get(lower);

  return /^[A-Za-z][A-Za-z0-9+#._:/-]*$/.test(value) ? lower : value;
}

function phraseLabel(parts) {
  const allChinese = parts.every((part) => /^[\u4e00-\u9fff]+$/.test(part));
  const joined = allChinese ? parts.join("") : parts.join(" ");
  return CANONICAL.get(joined.toLowerCase()) || joined;
}

function tokenize(text) {
  const unigramSequences = [];
  const phraseSequences = [];
  const technical = [];
  const normalized = String(text || "").normalize("NFKC");

  for (const sentence of normalized.split(/[。！？!?；;\n]+/)) {
    const unigramSequence = [];
    let phraseSequence = [];
    const flushPhraseSequence = () => {
      if (phraseSequence.length) phraseSequences.push(phraseSequence);
      phraseSequence = [];
    };

    for (const part of segmenter.segment(sentence)) {
      if (!part.isWordLike) continue;
      const token = cleanToken(part.segment);
      if (token) unigramSequence.push(token);

      const phrasePart = cleanPhrasePart(part.segment);
      if (phrasePart) phraseSequence.push(phrasePart);
      else flushPhraseSequence();
    }
    flushPhraseSequence();
    if (unigramSequence.length) unigramSequences.push(unigramSequence);

    for (const match of sentence.matchAll(/[A-Za-z][A-Za-z0-9]*(?:(?:\+\+)|(?:#[A-Za-z0-9]*)|(?:[._:/-][A-Za-z0-9+#]+))+/g)) {
      const token = cleanToken(match[0]);
      if (token) technical.push(token);
    }
  }

  const unigrams = new Map();
  const phrases = new Map();
  const phraseParts = new Map();
  const phrasePartCounts = new Map();
  const add = (map, token, amount = 1) => map.set(token, (map.get(token) || 0) + amount);

  for (const sequence of unigramSequences) {
    for (const token of sequence) add(unigrams, token);
  }

  for (const sequence of phraseSequences) {
    for (const part of sequence) add(phrasePartCounts, part);
    for (const size of [2, 3]) {
      for (let index = 0; index <= sequence.length - size; index += 1) {
        const parts = sequence.slice(index, index + size);
        if (new Set(parts).size === 1) continue;
        const phrase = phraseLabel(parts);
        if (STOPWORDS.has(phrase.toLowerCase()) || phrase.length > 30) continue;
        add(phrases, phrase);
        phraseParts.set(phrase, parts);
      }
    }
  }

  for (const token of technical) add(unigrams, token);
  return { unigrams, phrases, phraseParts, phrasePartCounts };
}

function mergeWeighted(target, source, boost) {
  for (const [term, count] of source) {
    target.set(term, (target.get(term) || 0) + count * boost);
  }
}

function mergeCounts(target, source) {
  for (const [term, count] of source) {
    target.set(term, (target.get(term) || 0) + count);
  }
}

function extractDocument(file) {
  const relativePath = path.relative(CONTENT_DIR, file).split(path.sep).join("/");
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const $ = load(`<main id="keyword-source">${parsed.content}</main>`);
  const root = $("#keyword-source");

  root.find("script,style,svg,noscript,iframe,nav,aside,.toc,.breadcrumbs,.meta,.kicker,.tags,.tag-list,.pagination,.back,.article-nav,footer").remove();

  const fallbackTitle = root.find("h1").first().text().trim();
  const title = String(parsed.data.title || fallbackTitle || "")
    .replace(/\s*[·•]\s*Rust\s*笔记.*$/i, "")
    .split(/\s*[|｜]\s*/)[0]
    .trim();
  const headings = root.find("h2,h3")
    .map((_, element) => $(element).text().replace(/^\s*\d+(?:\.\d+)*[.、]?\s*/, "").trim())
    .get()
    .join("。 ");
  const inlineCode = root.find("code")
    .filter((_, element) => !$(element).closest("pre").length)
    .map((_, element) => $(element).text())
    .get()
    .join(" ");

  root.find("pre,code,h1,h2,h3").remove();
  const body = root.text().replace(/\s+/g, " ").trim();
  const permalink = String(parsed.data.permalink || `/${relativePath}`);

  return {
    relativePath,
    url: permalink.startsWith("/") ? permalink : `/${permalink}`,
    title,
    headings,
    body,
    inlineCode
  };
}

const sourceFiles = walk(CONTENT_DIR);
const documents = sourceFiles
  .filter((file) => !/[/\\](?:README|index)\.html$/i.test(file))
  .map(extractDocument)
  .filter((document) => document.title || document.body);

if (!documents.length) {
  throw new Error(`No article HTML files found in ${CONTENT_DIR}`);
}

const perDocument = [];
const globalRawUnigrams = new Map();
const globalRawPhrases = new Map();
const globalRawPhraseParts = new Map();
const phraseParts = new Map();

for (const document of documents) {
  const fields = [
    [tokenize(document.title), 3],
    [tokenize(document.headings), 1.6],
    [tokenize(document.body), 1],
    [tokenize(document.inlineCode), 0.8]
  ];
  const weightedUnigrams = new Map();
  const weightedPhrases = new Map();
  const prominentUnigrams = new Set();
  const prominentPhrases = new Set();
  const rawUnigrams = new Map();
  const rawPhrases = new Map();

  for (const [field, boost] of fields) {
    mergeWeighted(weightedUnigrams, field.unigrams, boost);
    mergeWeighted(weightedPhrases, field.phrases, boost);
    mergeCounts(rawUnigrams, field.unigrams);
    mergeCounts(rawPhrases, field.phrases);
    mergeCounts(globalRawPhraseParts, field.phrasePartCounts);
    for (const [phrase, parts] of field.phraseParts) phraseParts.set(phrase, parts);
    if (boost > 1) {
      for (const term of field.unigrams.keys()) prominentUnigrams.add(term);
      for (const term of field.phrases.keys()) prominentPhrases.add(term);
    }
  }

  mergeCounts(globalRawUnigrams, rawUnigrams);
  mergeCounts(globalRawPhrases, rawPhrases);
  perDocument.push({
    ...document,
    unigrams: weightedUnigrams,
    phrases: weightedPhrases,
    unigramLength: [...weightedUnigrams.values()].reduce((sum, value) => sum + value, 0),
    phraseLength: [...weightedPhrases.values()].reduce((sum, value) => sum + value, 0),
    rawUnigrams,
    rawPhrases,
    prominentUnigrams,
    prominentPhrases
  });
}

function aggregate(kind) {
  const totals = new Map();
  const rawTotals = kind === "word" ? globalRawUnigrams : globalRawPhrases;
  const key = kind === "word" ? "unigrams" : "phrases";
  const rawKey = kind === "word" ? "rawUnigrams" : "rawPhrases";
  const prominentKey = kind === "word" ? "prominentUnigrams" : "prominentPhrases";
  const lengthKey = kind === "word" ? "unigramLength" : "phraseLength";
  const averageLength = perDocument.reduce((sum, document) => sum + document[lengthKey], 0) / perDocument.length || 1;
  const k1 = 1.2;
  const b = 0.68;

  for (const document of perDocument) {
    const lengthNormalization = 1 - b + b * document[lengthKey] / averageLength;
    for (const [term, weightedCount] of document[key]) {
      const normalizedFrequency = weightedCount * (k1 + 1) / (weightedCount + k1 * lengthNormalization);
      const current = totals.get(term) || {
        term,
        kind,
        normalizedFrequency: 0,
        documents: 0,
        prominentDocuments: 0,
        occurrences: 0,
        urlScores: new Map()
      };
      current.normalizedFrequency += normalizedFrequency;
      current.documents += 1;
      current.occurrences += document[rawKey].get(term) || 0;
      current.urlScores.set(document.url, normalizedFrequency);
      if (document[prominentKey].has(term)) current.prominentDocuments += 1;
      totals.set(term, current);
    }
  }

  const maxSpecificity = Math.log(1 + documents.length / 1.5);
  return [...totals.values()].map((item) => {
    const coverage = item.documents / documents.length;
    const specificity = Math.log(1 + documents.length / (item.documents + 0.5)) / maxSpecificity;
    let association = 0;

    if (kind === "phrase") {
      const parts = phraseParts.get(item.term) || [];
      const counts = parts.map((part) => globalRawPhraseParts.get(part) || 1);
      const geometricMean = counts.length
        ? Math.pow(counts.reduce((product, count) => product * count, 1), 1 / counts.length)
        : 1;
      association = item.occurrences / geometricMean;
    }

    const phraseBoost = kind === "phrase" ? 0.84 + Math.min(0.38, association * 1.5) : 1;
    const prominenceBoost = 1 + Math.min(0.14, item.prominentDocuments * 0.025);
    const score = item.normalizedFrequency * (0.72 + 0.28 * specificity) * phraseBoost * prominenceBoost;
    const relatedUrl = [...item.urlScores.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0];

    return {
      ...item,
      occurrences: rawTotals.get(item.term) || item.occurrences,
      coverage,
      specificity,
      association,
      score,
      relatedUrl
    };
  }).filter((item) => {
    if (item.kind === "word") return item.occurrences >= 2;
    return item.occurrences >= 3 && item.association >= 0.09;
  });
}

const candidates = [...aggregate("word"), ...aggregate("phrase")]
  .sort((left, right) => right.score - left.score || right.documents - left.documents || left.term.localeCompare(right.term, "zh-CN"));

const coreThreshold = Math.max(1, Math.ceil(documents.length * 0.25));
const recurringThreshold = Math.max(1, Math.ceil(documents.length * 0.075));
const selected = [];
const selectedTerms = new Set();

function selectTier(tier, quota, predicate) {
  for (const item of candidates) {
    if (selected.filter((selectedItem) => selectedItem.tier === tier).length >= quota) break;
    if (selectedTerms.has(item.term) || !predicate(item)) continue;
    selected.push({ ...item, tier });
    selectedTerms.add(item.term);
  }
}

selectTier("core", 20, (item) => item.documents >= coreThreshold);
selectTier("recurring", 20, (item) => item.documents >= recurringThreshold && item.documents < coreThreshold);
selectTier("niche", 10, (item) => item.documents < recurringThreshold && (item.prominentDocuments > 0 || item.occurrences >= 8));

for (const item of candidates) {
  if (selected.length >= MAX_KEYWORDS) break;
  if (selectedTerms.has(item.term)) continue;
  const tier = item.documents >= coreThreshold
    ? "core"
    : item.documents >= recurringThreshold
      ? "recurring"
      : "niche";
  selected.push({ ...item, tier });
  selectedTerms.add(item.term);
}

const cooccurrence = new Map();
const selectedByTerm = new Map(selected.map((item) => [item.term, item]));
const pairKey = (left, right) => [left, right].sort((a, b) => a.localeCompare(b, "zh-CN")).join("\u0000");

for (const document of perDocument) {
  const present = selected
    .filter((item) => (item.kind === "word" ? document.unigrams : document.phrases).has(item.term))
    .map((item) => item.term);
  for (let leftIndex = 0; leftIndex < present.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < present.length; rightIndex += 1) {
      const key = pairKey(present[leftIndex], present[rightIndex]);
      cooccurrence.set(key, (cooccurrence.get(key) || 0) + 1);
    }
  }
}

function similarity(leftTerm, rightTerm) {
  const count = cooccurrence.get(pairKey(leftTerm, rightTerm)) || 0;
  const leftDocuments = selectedByTerm.get(leftTerm)?.documents || 1;
  const rightDocuments = selectedByTerm.get(rightTerm)?.documents || 1;
  return count / Math.sqrt(leftDocuments * rightDocuments);
}

function orderByRelationship(items) {
  if (!items.length) return [];
  const remaining = [...items].sort((left, right) => right.score - left.score);
  const ordered = [remaining.shift()];

  while (remaining.length) {
    const previous = ordered.at(-1);
    remaining.sort((left, right) => {
      const relationshipDifference = similarity(previous.term, right.term) - similarity(previous.term, left.term);
      return relationshipDifference || right.score - left.score || left.term.localeCompare(right.term, "zh-CN");
    });
    ordered.push(remaining.shift());
  }
  return ordered;
}

const layout = new Map();
// Adjacent rings are offset by half a slot, keeping labels separated for the
// complete rotation instead of only at their initial positions.
const orbitStarts = [20, 38, 20, 38, 25];

function placeAcrossOrbits(items, orbits) {
  const ordered = orderByRelationship(items);
  const slots = new Map(orbits.map((orbit) => [orbit, 0]));
  ordered.forEach((item, index) => {
    const orbit = orbits[index % orbits.length];
    const slot = slots.get(orbit);
    slots.set(orbit, slot + 1);
    layout.set(item.term, {
      orbit,
      angle: (orbitStarts[orbit] + slot * 36) % 360
    });
  });
}

placeAcrossOrbits(selected.filter((item) => item.tier === "core"), [0, 1]);
placeAcrossOrbits(selected.filter((item) => item.tier === "recurring"), [2, 3]);
placeAcrossOrbits(selected.filter((item) => item.tier === "niche"), [4]);

const maxScore = Math.max(...selected.map((item) => item.score), 1);
const ranked = [...selected]
  .sort((left, right) => right.score - left.score || left.term.localeCompare(right.term, "zh-CN"))
  .map((item, index) => {
    const position = layout.get(item.term);
    const related = selected
      .filter((candidate) => candidate.term !== item.term)
      .map((candidate) => ({ term: candidate.term, similarity: similarity(item.term, candidate.term) }))
      .filter((candidate) => candidate.similarity > 0)
      .sort((left, right) => right.similarity - left.similarity || left.term.localeCompare(right.term, "zh-CN"))
      .slice(0, 3)
      .map((candidate) => candidate.term);
    const relativeWeight = item.score / maxScore;

    return {
      rank: index + 1,
      text: item.term,
      kind: item.kind,
      tier: item.tier,
      score: Number(item.score.toFixed(6)),
      relativeWeight: Number((relativeWeight * 100).toFixed(1)),
      importance: Number((0.22 + Math.sqrt(relativeWeight) * 0.78).toFixed(3)),
      occurrences: item.occurrences,
      documents: item.documents,
      coveragePercent: Number((item.coverage * 100).toFixed(1)),
      orbit: position.orbit,
      angle: position.angle,
      counterAngle: -position.angle,
      distance: Number((position.angle / 3.6).toFixed(3)),
      delay: Number((position.angle / -360 * 260).toFixed(3)),
      url: `/search.html?q=${encodeURIComponent(item.term)}`,
      relatedUrl: item.relatedUrl,
      related
    };
  });

if (new Set(ranked.map((item) => item.text)).size !== ranked.length) {
  throw new Error("Keyword generation produced duplicate terms.");
}
if (ranked.some((item) => !Number.isFinite(item.score) || !Number.isFinite(item.importance))) {
  throw new Error("Keyword generation produced a non-finite score.");
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, `${JSON.stringify(ranked, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(ROOT, OUT_FILE)} from ${documents.length} equal-weight articles (${ranked.length} keywords).`);
