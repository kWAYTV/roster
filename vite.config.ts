import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

// Tauri drives the dev server; keep the port fixed so the Rust side can find it.
export default defineConfig({
  build: {
    outDir: "dist",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "motion",
              test: /node_modules[\\/](motion|framer-motion)[\\/]/,
            },
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            {
              name: "base-ui",
              test: /node_modules[\\/]@base-ui[\\/]/,
            },
          ],
        },
      },
    },
    target: "es2022",
  },
  clearScreen: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
});
