import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The static GitHub Pages build is written to docs/ (Pages: "Deploy from a branch" -> main -> /docs).
// It must NOT live in the repo root: Nitro (the server build used on Render/Lovable) treats a root
// index.html as its page template and a root assets/ folder as server assets, which hijacks "/" and
// breaks `vite build`.
const root = process.cwd();
const pagesDir = join(root, ".pages-root");
const outDir = join(root, "docs");
const builtHtml = join(pagesDir, "static-index.html");

if (!existsSync(builtHtml)) {
  throw new Error("Missing static-index.html. Run vite build --config vite.static.config.ts first.");
}

// Remove legacy root-level output from older versions of this script.
for (const entry of [
  "assets",
  "site-assets",
  "index.html",
  "404.html",
  "favicon.ico",
  "robots.txt",
  "_headers",
  ".nojekyll",
  "book",
  "gear2",
]) {
  rmSync(join(root, entry), { recursive: true, force: true });
}

mkdirSync(outDir, { recursive: true });
for (const entry of ["site-assets", "index.html", "404.html", "_headers", ".nojekyll"]) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

cpSync(join(pagesDir, "site-assets"), join(outDir, "site-assets"), { recursive: true });
copyFileSync(builtHtml, join(outDir, "index.html"));
copyFileSync(join(outDir, "index.html"), join(outDir, "404.html"));

// Mirror every public/ asset (favicon, robots.txt, book/ + gear2/ videos, etc.) next to the page.
const publicDir = join(root, "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, outDir, { recursive: true });
}

writeFileSync(join(outDir, ".nojekyll"), "");
writeFileSync(
  join(outDir, "_headers"),
  ["/site-assets/*", "  Cache-Control: public, max-age=31536000, immutable", ""].join("\n"),
);
