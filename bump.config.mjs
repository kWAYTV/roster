import { defineConfig } from "bumpp";

export default defineConfig({
  all: true,
  files: [
    "package.json",
    "package-lock.json",
    "src-tauri/tauri.conf.json",
    "src-tauri/Cargo.toml",
  ],
  execute: "cargo update -p roster --manifest-path src-tauri/Cargo.toml",
  commit: "chore(release): bump version to %s",
  tag: "v",
  noGitCheck: false,
});
