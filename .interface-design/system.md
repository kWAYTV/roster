# Roster UI System

## Direction
Dense desktop tool for Steam account switching. Cold Steam-adjacent palette, one blue accent, terminal-like metadata.

## Palette
- Background stack: `#0e1419` → `#171a21` → `#1e232d`
- Accent: `#1a9fff` (primary actions, selection, online presence)
- Text: `#e8edf4` primary, `#9aa8b8` secondary, `#6b7a8f` muted
- Semantic: danger `#f2555a`, warn `#e8a838`, success `#3ecf8e`

## Depth
Borders-only elevation on dark surfaces. Menus/modals use ring + soft shadow (`--shadow-menu`, `--shadow-modal`).

## Spacing
4px base grid. Row padding `8px 12px`. Toolbar `12px 16px`.

## Typography
- UI: Geist Variable 13px, weights 400/500/600
- Metadata: Geist Mono 11px (usernames, logs)
- Hierarchy via weight + color, not size jumps
- Section labels: 10px uppercase tracked

## Components
- Toolbar: search (flex) + count + Import btn-sm + settings icon
- Account row: 36px squircle avatar, mono login line, btn-sm Sign in + icon actions
- Context menu: 200px flat, section labels, 2-col cooldown grid, portal to body
- Modal: max-height `100dvh - 32px`, scrollable body
- Settings: grouped sections Sign-in / Privacy / App, compact toggles

## Z-index
`--z-menu: 40`, `--z-overlay: 100`, `--z-toast: 200`

## Window
Fixed 560×620 — no flyout submenus, no horizontal scroll, clamp menus to viewport.
