import path from "node:path";

function cleanUrl(url = "") {
  return String(url).replace(/^\//, "");
}

function tagSlug(tag) {
  return String(tag).trim().replace(/[\\/#?%*:|"<>]/g, "-").replace(/\s+/g, "-");
}

function relativeUrl(target, fromUrl = "/index.html") {
  if (!target) return "";
  const value = String(target);
  if (/^(https?:|mailto:|tel:|#)/.test(value)) return value;

  const cleanTarget = cleanUrl(value);
  const cleanFrom = cleanUrl(fromUrl || "/index.html");
  const fromDir = cleanFrom.endsWith("/")
    ? cleanFrom.replace(/\/$/, "")
    : path.posix.dirname(cleanFrom);
  const baseDir = fromDir === "." ? "" : fromDir;
  const result = path.posix.relative(baseDir, cleanTarget);
  return result || path.posix.basename(cleanTarget);
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("relativeUrl", relativeUrl);
  eleventyConfig.addFilter("tagUrl", (tag) => `/tags/${tagSlug(tag)}.html`);
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("readableDate", (date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(date));
  });
  eleventyConfig.addFilter("rfc822Date", (date) => new Date(date).toUTCString());

  eleventyConfig.addFilter("limit", (items, count) => {
    return Array.isArray(items) ? items.slice(0, count) : [];
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "11ty.js"],
    pathPrefix: "/notebook/"
  };
}
