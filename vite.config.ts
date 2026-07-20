import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

// Tauri drives the dev server; keep the port fixed so the Rust side can find it.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
