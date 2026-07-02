import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri drives the dev server; keep the port fixed so the Rust side can find it.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
