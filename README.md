# Roster

A Steam account switcher for Windows. Import a refresh token and Roster writes
the encrypted login into Steam's own config, marks it active, and restarts the
client — no password re-entry.

Built with Tauri 2 (Rust) and React + TypeScript.

## Features

- Switch accounts from the window or the system tray
- Bulk token import (`steamid----token`, `username----token`, or a bare JWT)
- Live online / in-game status from public Steam profiles
- Per-account cooldowns with presets and a custom duration
- Streamer mode to mask names and logins

## Requirements

- Windows 10 or later, with Steam installed
- [Node.js](https://nodejs.org/) 20+ and the [Rust](https://rustup.rs/) toolchain

## Getting started

```bash
npm install
npm run tauri dev      # run in development
npm run tauri build    # build the installer -> src-tauri/target/release/bundle/nsis/
```

Prefer not to build? Every push publishes a fresh installer to the
[latest build](../../releases/tag/latest) release, so that link is always the
newest `.exe`.

## Usage

1. **Import** — paste one or more tokens; Roster stores each and signs in to the
   last.
2. **Switch** — click *Sign in* on any account, or pick it from the tray.
3. **Cooldown** — set a timer per account (e.g. after a trade or ban wait).

## Testing

```bash
cd src-tauri
cargo test
cargo clippy --all-targets -- -D warnings
```

## Architecture

Code is organized by domain action rather than technical layer, with Steam and
Windows integration isolated behind capability boundaries. Files stay small and
single-purpose.

**Backend** (`src-tauri/src`) — `roster`, `intake`, `login`, `forget`, `reset`,
`metadata`, `status`, `preferences`, and `presence` cover the app's actions;
`vdf`, `steam_config`, `steam_client`, and `secret` wrap Steam's file formats,
process, registry, and token encryption; `bridge` and `tray` are the edges.

**Frontend** (`src`) — feature folders mirror the backend domains behind a typed
`ipc` boundary, with shared `feedback` primitives and `theme` tokens.

## Security

Tokens are encrypted at rest with the Windows Data Protection API (DPAPI), so
they are readable only by the current user account.
