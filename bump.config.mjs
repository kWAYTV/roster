import { defineConfig } from "bumpp";

export default defineConfig({
  all: true,
  commit: "chore(release): bump version to %s",
  execute: "cargo update -p roster --manifest-path src-tauri/Cargo.toml",
  files: [
    "package.json",
    "package-lock.json",
    "src-tauri/tauri.conf.json",
    "src-tauri/Cargo.toml",
  ],
  noGitCheck: false,
  tag: "v",
});
