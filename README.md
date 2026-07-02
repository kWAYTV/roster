# Roster

A minimal Windows desktop app for switching between Steam accounts using saved
refresh tokens. Import a token, and Roster writes the encrypted login into
Steam's own config, sets it as the active account, and restarts Steam.

Built with Tauri v2 (Rust) and React + TypeScript.

## Architecture

The codebase is organized by what the app does, not by technical layer. Each
top-level module names a domain action; Steam and Windows integration is
isolated behind capability boundaries. Files stay small and single-purpose, and
no folder mixes loose files with nested subfolders (aside from the two
language-mandated roots).

### Backend — `src-tauri/src`

| Module | Responsibility |
| --- | --- |
| `roster` | Read and model the remembered accounts (`loginusers.vdf`, avatars). |
| `intake` | Read the clipboard, split batches, parse formats, decode JWTs, import. |
| `login` | Activate an account and (re)launch Steam. |
| `forget` | Remove an account everywhere Steam remembers it. |
| `reset` | Clear all local Steam login data. |
| `metadata` | Per-account last-used time and cooldowns, stored outside Steam's files. |
| `status` | Online/in-game state fetched from Steam Community profile XML. |
| `preferences` | The settings model and its JSON store. |
| `presence` | Persona, notification, and download tweaks applied at login. |
| `vdf` | Read and edit the Valve KeyValues text format. |
| `steam_config` | Editors for `loginusers.vdf`, `config.vdf`, `local.vdf`, `localconfig.vdf`. |
| `steam_client` | Steam's install location, process control, and autologin registry. |
| `secret` | The CRC32 store key and DPAPI token encryption. |
| `bridge` | Thin Tauri command adapters into the domains. |
| `tray` | System tray menu, actions, and close-to-tray. |

### Frontend — `src`

Feature folders mirror the backend domains (`roster`, `intake`, `login`,
`forget`, `reset`, `cooldown`, `status`, `preferences`), with a typed `ipc`
boundary, shared `feedback` primitives (toast, modal, confirm), and `theme`
tokens.

## Development

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

The Windows installer is written to
`src-tauri/target/release/bundle/nsis/`.

## Tests

```bash
cd src-tauri
cargo test
cargo clippy --all-targets -- -D warnings
```

## Import formats

- `steamid----token`
- `username----token` (trailing `----metadata` is ignored)
- a bare JWT

Paste several accounts at once, one per line or separated by blank lines.
