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

Same idea as the [portfolio changelog workflow](https://github.com/kWAYTV/portfolio/blob/master/.github/workflows/changelog.yml): bump locally, tag triggers CI + release notes + installer.

```bash
npm run release      # bumpp — pick conventional / version, commits + tags v* + pushes
```

On `v*` tags the Release workflow:

1. Runs CI (`backend` + `frontend`) — red CI stops the release
2. Generates GitHub release notes with [changelogithub](https://github.com/antfu/changelogithub) (from conventional commits)
3. Builds/uploads the signed NSIS installer + updater manifest

CI also runs on pull requests.

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
