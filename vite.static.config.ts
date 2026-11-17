import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/brandflow-studio-main/",
  resolve: {
    alias: {
      "@/lib/studioAuth": resolve("src/lib/staticStudioAuth.ts"),
    },
  },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: ".pages-root",
    // NOT "assets": a root-level assets/ folder is scanned by Nitro as server assets and breaks the
    // server build (vite build on Render/Lovable) when it contains .css files.
    assetsDir: "site-assets",
    emptyOutDir: true,
    rollupOptions: {
      input: "static-index.html",
    },
  },
});
