/**
 * Static export: OG tags at start of <head> for LinkedIn/Discord crawlers.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const siteUrl =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://corpus-search.vercel.app";
const ogImageUrl = `${siteUrl}/linkedin-share.jpg`;
const title = "CorpusSearch — markdown FTS demo";
const description =
  "Keyword search with snippet extraction and intent-aware ranking over markdown docs.";

const inject = `<!-- crawler-og -->
<meta property="og:image" content="${ogImageUrl}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="627"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:url" content="${siteUrl}"/>
<meta property="og:type" content="website"/>
<link rel="canonical" href="${siteUrl}"/>
<link rel="image_src" href="${ogImageUrl}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="${ogImageUrl}"/>
`;

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".html")) patch(path);
  }
}

function patch(file: string) {
  let html = readFileSync(file, "utf8");
  if (html.includes("crawler-og")) return;
  if (html.includes("<head>")) html = html.replace("<head>", `<head>${inject}`);
  else if (html.includes("<head ")) html = html.replace(/<head[^>]*>/, (m) => `${m}${inject}`);
  else return;
  writeFileSync(file, html);
}

walk(join(import.meta.dirname, "..", "out"));
console.log(`Patched HTML (site: ${siteUrl})`);
