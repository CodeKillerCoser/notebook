import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const SITE = path.join(process.cwd(), "_site");
const ATTRS = [
  ["a", "href"],
  ["link", "href"],
  ["script", "src"],
  ["img", "src"]
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

function isExternal(value) {
  return /^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(value);
}

function stripSuffix(value) {
  return value.split("#")[0].split("?")[0];
}

function existsTarget(target) {
  if (!target) return true;
  const clean = decodeURIComponent(target);
  if (fs.existsSync(clean) && fs.statSync(clean).isFile()) return true;
  const indexFile = path.join(clean, "index.html");
  return fs.existsSync(indexFile) && fs.statSync(indexFile).isFile();
}

const failures = [];

for (const file of walk(SITE)) {
  const html = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(html);
  for (const [selector, attr] of ATTRS) {
    $(selector).each((_, element) => {
      const raw = $(element).attr(attr);
      if (!raw || isExternal(raw)) return;
      const clean = stripSuffix(raw);
      if (!clean) return;

      const target = clean.startsWith("/")
        ? path.join(SITE, clean)
        : path.resolve(path.dirname(file), clean);

      if (!existsTarget(target)) {
        failures.push(`${path.relative(SITE, file)} -> ${raw}`);
      }
    });
  }
}

if (failures.length) {
  console.error("Broken local links:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Checked ${walk(SITE).length} HTML files. No broken local links found.`);
