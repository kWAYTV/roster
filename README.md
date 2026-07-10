# Roster

Windows Steam account switcher. Import refresh tokens, Roster writes the encrypted login into Steam's config and switches — no password re-entry.

Tauri 2 + Rust backend, React frontend.

## Requirements

- Windows 10+, Steam installed
- Node.js 22+, Rust stable

## Dev

```bash
npm install
npm run tauri dev
npm run tauri build    # installer in src-tauri/target/release/bundle/nsis/
```

Signed local build (needs `signing/roster.key`):

```bat
.scripts\build.bat
```

## Release

```bash
npm run release      # bumpp — pick "conventional", commits + tags v* + pushes
```

CI builds on `v*` tags and publishes a signed NSIS installer + updater manifest to [Releases](https://github.com/kWAYTV/roster/releases/latest).

## Import formats

- `steamid----token`
- `username----token`
- bare JWT

## Tests

```bash
cd src-tauri && cargo test
```

Tokens are encrypted at rest with DPAPI (per-user).
