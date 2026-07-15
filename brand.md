# Brand — Verity (formerly PredictX)

_Status: active_

## Identity

- **Name:** Verity — from Latin *veritas*, truth. A prediction market is a machine for discovering truth; the brand states it plainly.
- **Protocol name:** Verity Protocol (contracts retain their deployed `PredictX` / `PRED` identifiers).
- **Token:** PRED (unchanged).
- **Tagline:** "Markets in truth."
- **Voice:** Assured, precise, unhurried. Say less; mean it. No exclamation marks, no hype adjectives ("revolutionary", "blazing"). Numbers do the persuading.

## Palette

Design tokens live in `frontend/src/app/globals.css` as CSS variables on `:root` (dark, default)
and `html.light` (light). All components — including inline styles — must reference tokens, never raw hex.

### Dark — "Obsidian" (default)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0B0A08` | Page background — warm obsidian |
| `--bg-2` | `#14120D` | Raised surfaces, dropdowns, footer |
| `--text` | `#F4F1E8` | Primary text — warm ivory |
| `--text-2` | `#DDD8CB` | Secondary text |
| `--muted` | `#A29D8F` | Muted labels |
| `--faint` | `#8A8474` | Faint captions / placeholders |
| `--faint-2` | `#5C574B` | Decorative, disabled |
| `--accent` | `#E2C178` | Champagne gold — primary accent |
| `--accent-2` | `#B98A2F` | Deep gold — gradient partner |
| `--accent-3` | `#B4A0E8` | Royal violet — staking/governance accent |
| `--on-accent` | `#14120D` | Text on gold fills |
| `--up` | `#10B981` | YES / gains |
| `--down` | `#E5484D` | NO / losses |
| `--warn` | `#F5A623` | Warnings, expiring |

`--fg-rgb: 244,241,232` — use `rgba(var(--fg-rgb), a)` for hairlines and glass surfaces; it flips automatically in light mode.

### Light — "Daybreak Ivory"

Ivory paper (`#F6F3EA`), ink text (`#1D1A13`), gold darkened to `#9A7B24` for AA contrast.
Never hand-tune light mode per component — the tokens flip everything.

### Gradients

- **Brand gold:** `linear-gradient(135deg, var(--accent), var(--accent-2))` — logo, primary CTAs, gradient text.
- **Regal:** `linear-gradient(135deg, var(--accent), var(--accent-3))` — reserved for governance/staking heroes.

## Typography

Wired via `next/font` in `frontend/src/app/layout.tsx`:

- **Display:** Fraunces (`--font-display`) — headlines, stat numerals in heroes. Weight 500–600, tight leading.
- **Body/UI:** Inter (`--font-sans`).
- **Numbers/code:** JetBrains Mono (`--font-mono`) — every price, percentage, address, countdown.

## Logo

`frontend/public/logo.svg` (full lockup) and `frontend/public/logo-mark.svg` / `favicon.svg` (mark only).
The mark: a gold "V" of two converging strokes meeting on a horizon line — signals converging on truth,
doubling as a rising-then-settling price path. Dark-ground first; use the outlined variant on light.

## Usage rules

1. Gold is scarce. One primary gold CTA per view; everything else is quiet ivory/obsidian.
2. YES is always `--up`, NO is always `--down` — never restyle semantics.
3. Serif (Fraunces) only at display sizes (≥ 28px); body text is always Inter.
4. Motion is slow and deliberate: 500–700ms entrances, `cubic-bezier(0.16, 1, 0.3, 1)`, and everything respects `prefers-reduced-motion`.
