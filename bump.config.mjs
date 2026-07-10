import { defineConfig } from "bumpp";

export default defineConfig({
  all: true,
  files: [
    "package.json",
    "package-lock.json",
    "src-tauri/tauri.conf.json",
    "src-tauri/Cargo.toml",
    "src-tauri/Cargo.lock",
  ],
  commit: "chore(release): bump version to %s",
  tag: "v",
  noGitCheck: false,
});
