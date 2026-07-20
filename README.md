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

Releases are driven by [conventional commits](https://www.conventionalcommits.org/) via [release-please](https://github.com/googleapis/release-please):

1. Land commits on `main` via PR or direct push (`feat:`, `fix:`, `feat!:`, …).
2. On every `main` push the Release workflow runs **CI first** (`backend` + `frontend`). If either fails, release-please does not run.
3. When CI is green, release-please opens/updates a **Release PR** with version bumps + `CHANGELOG.md`.
4. Merge that Release PR when ready → tag + GitHub Release → signed NSIS + updater (only if CI was green on that merge push too).

CI also runs on pull requests. Prefer branch protection on `main` with required checks.

Artifacts land on [Releases](https://github.com/kWAYTV/roster/releases/latest).

## Import formats

- `steamid----token`
- `username----token`
- bare JWT

## Tests

```bash
cd src-tauri && cargo test
```

Tokens are encrypted at rest with DPAPI (per-user).
