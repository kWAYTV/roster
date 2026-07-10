import { defineConfig } from "bumpp";
import tauri from "tauri-version";

export default defineConfig({
  files: ["package.json", "package-lock.json"],
  commit: "chore(release): bump version to %s",
  tag: "v",
  noGitCheck: false,
  execute: tauri(),
});
