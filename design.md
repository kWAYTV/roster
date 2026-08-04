# Design — Roster

Locked design system for this app. Dense desktop utility — not a landing page.

## Genre
modern-minimal (dark utility register)

## Macrostructure family
- App pages: Workbench — dense list, quiet chrome, no enrichment

## Theme
Custom dark austere (catalog Cobalt is light; this is the dark instrument panel).

- `--color-paper`   oklch(0.17 0.008 260)
- `--color-paper-2` oklch(0.21 0.008 260)
- `--color-ink`     oklch(0.93 0.006 260)
- `--color-ink-2`   oklch(0.62 0.01 260)
- `--color-rule`    oklch(0.30 0.01 260)
- `--color-accent`  oklch(0.88 0.01 260)   /* near-ink fill for primary actions */
- `--color-focus`   oklch(0.72 0.08 250)   /* quiet cool focus only */

Light mode is the inverted sibling (cool near-white paper, charcoal ink). Same radii, same type, same CTA voice.

## Typography
System stacks only (Tauri CSP — no remote fonts).

- Display / body: Segoe UI Variable / Segoe UI / system-ui
- Mono: Cascadia Mono / Consolas (login names, version, codes only — never all-caps chrome)
- Display tracking: normal to `-0.01em` on titles
- No uppercase mono labels, no tracked wordmarks, no section kickers

## Spacing
4-point scale via existing `--spacing` / `--space-*`. Dense: row padding ~6–8px, toolbar ~40px.

## Motion
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
- Hover/press only; no enter staggers, no grid reveals
- Reduced-motion: opacity only ≤150ms

## Microinteractions stance
- Silent chrome: feedback lives in the footer status line (errors linger; click to dismiss)
- Scale on press `0.97` for buttons
- No glow, no glass blur stacks, no background patterns

## CTA voice
- Primary: filled near-ink (dark) / filled charcoal (light), 6px radius
- Secondary: ghost / hairline outline
- Icon buttons: ghost, quiet

## App chrome rules
- Toolbar: plain title + count + icon actions. No mark glow, no segmented wells.
- Rows: avatar · two-line info · trailing actions. No leading CTA column, no left accent stripe, no action wells.
- Badges: small, sentence case or as-data, hairline border — not UPPERCASE mono chips.
- List: flat stack with hairline dividers OR 1px gap — no card-in-card.
- Bulk bar: quiet strip, normal case labels.
- No decorative grids, sheens, or multi-layer hard shadows.

## What pages MUST share
- Dark default appearance
- Quiet zinc palette + cool focus
- System font stacks
- Compact row density

## What pages MAY differ on
- Dialog content structure only
