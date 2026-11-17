import { rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

// Build temp folder, legacy root-level Pages output, and the generated parts of docs/.
// (docs/ also holds hand-written notes such as new-interface-workflow.md, so it is not wiped.)
for (const entry of [
  ".pages-root",
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
  "docs/site-assets",
  "docs/index.html",
  "docs/404.html",
  "docs/_headers",
  "docs/.nojekyll",
]) {
  rmSync(join(root, entry), { recursive: true, force: true });
}
