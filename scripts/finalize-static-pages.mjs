import { copyFileSync, cpSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pagesDir = join(root, ".pages-root");
const builtHtml = join(pagesDir, "static-index.html");
const indexHtml = join(root, "index.html");
const notFoundHtml = join(root, "404.html");

if (!existsSync(builtHtml)) {
  throw new Error("Missing static-index.html. Run vite build --config vite.static.config.ts first.");
}

// Legacy folder name: a root-level assets/ breaks the Nitro server build, so always remove it.
rmSync(join(root, "assets"), { recursive: true, force: true });
rmSync(join(root, "site-assets"), { recursive: true, force: true });
cpSync(join(pagesDir, "site-assets"), join(root, "site-assets"), { recursive: true });
copyFileSync(builtHtml, indexHtml);
copyFileSync(indexHtml, notFoundHtml);

// Mirror every public/ asset (favicon, robots.txt, gear2/ video, etc.) to the repo
// root, since GitHub Pages serves this branch's root directly.
const publicDir = join(root, "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, root, { recursive: true });
}

writeFileSync(join(root, ".nojekyll"), "");
writeFileSync(
  join(root, "_headers"),
  ["/site-assets/*", "  Cache-Control: public, max-age=31536000, immutable", ""].join("\n"),
);
