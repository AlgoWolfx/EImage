import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, loadEnv } from "vite";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
const path = "dist/site/index.html";
let html = await readFile(path, "utf8");
const server = await createServer({
  configFile: "apps/website/vite.config.ts",
  server: { middlewareMode: true, hmr: false },
});
try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${renderToString(createElement(App))}</div>`,
  );
} finally {
  await server.close();
}
html = html
  .replace(/<!--eimage-seo:start-->[\s\S]*?<!--eimage-seo:end-->/g, "")
  .replace("index,follow", "noindex,nofollow");
const configured = (
  process.env.PUBLIC_SITE_URL ||
  loadEnv("production", process.cwd(), "PUBLIC_").PUBLIC_SITE_URL ||
  ""
).trim();
let canonical;
if (configured) {
  const url = new URL(configured);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    ["localhost", "127.0.0.1", "0.0.0.0", "example.com"].includes(url.hostname)
  )
    throw new Error(
      "PUBLIC_SITE_URL must be the real HTTPS website address, without credentials, query or fragment.",
    );
  canonical = url.href.replace(/\/$/, "") + "/";
}
if (canonical) {
  const escape = (s) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;");
  html = html
    .replace("noindex,nofollow", "index,follow")
    .replace(
      "</head>",
      `<!--eimage-seo:start--><link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "EIMAGE", url: canonical, applicationCategory: "MultimediaApplication", operatingSystem: "Windows, macOS, Linux", isAccessibleForFree: true, license: "https://github.com/AlgoWolfx/EIMAGE/blob/main/LICENSE", codeRepository: "https://github.com/AlgoWolfx/EIMAGE", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Free, open-source desktop screenshot capture and annotation. Platform validation and release availability are documented separately." }).replaceAll("<", "\\u003c")}</script><!--eimage-seo:end--></head>`,
    );
  await writeFile(
    "dist/site/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${canonical}sitemap.xml\n`,
  );
  await writeFile(
    "dist/site/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(canonical)}</loc></url></urlset>`,
  );
} else {
  await writeFile("dist/site/robots.txt", "User-agent: *\nDisallow: /\n");
  await writeFile(
    "dist/site/sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
  );
}
await writeFile(path, html);
await mkdir("dist/site/licenses", { recursive: true });
await copyFile("LICENSE", "dist/site/licenses/LICENSE.txt");
await copyFile(
  "docs/THIRD_PARTY_NOTICES.md",
  "dist/site/licenses/THIRD_PARTY_NOTICES.md",
);
console.log(
  canonical
    ? `SEO configured: ${canonical}`
    : "Preview SEO: noindex; set PUBLIC_SITE_URL for publishing.",
);
