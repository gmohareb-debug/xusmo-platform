import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      name: "XusmoComponents",
      fileName: () => "xusmo-components.js",
      formats: ["iife"],
    },
    outDir: "assets/js",
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: "[name][extname]",
      },
    },
    minify: "esbuild",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
