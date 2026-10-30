# Design

Calm and precise: neutral surfaces, brand colour for actions, colour otherwise reserved for P&L.
All tokens live at the top of `frontend/src/styles.css`. Use tokens, not raw values.

## Palette

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--purple` / `--primary` | `#6C3FA0` | same | Primary buttons, active nav, CTA band, brand mark |
| `--ink-deep` | `#2A1748` | `#1F1433` | Landing hero, portfolio card |
| `--lime` / `--accent` | `#B7F34A` | same | Buy, sign-up CTAs, profit chip, "Live" badge (fill only) |
| `--surface` | `#FFFFFF` | `#1B1329` | Cards, top bar |
| `--bg` | `#FAF8FD` | `#120B1D` | Page background |
| `--text` / `--on-accent` | `#1A1029` | `#F4F1F9` | Body text; text on lime |
| `--muted` | `#675D7A` | `#A99FBC` | Secondary text, labels |
| `--link` | `#6C3FA0` | `#C7AEF0` | Links, active nav text |
| `--up` / `--down` | `#1E7A3C` / `#C62F3C` | `#B7F34A` / `#FF7A85` | Profit / loss |

## Contrast rules

Every text/background pair in use is at least **4.5:1** (WCAG AA), light and dark.

- White on purple: 7.4:1. White on ink: 16:1.
- Lime on white is **1.3:1**: never use lime as text on light surfaces. Use it as a fill with `--on-accent` text (13.9:1).
- On dark surfaces purple text is too dim; use `--link`.

## Type

One family, two cuts: **Open Sans** variable (`wdth` 75–100, `wght` 300–800).

- **Display** (`h1–h3`, hero, every rupee amount): condensed (`font-stretch` 75–80%), weight 700–800, tight tracking.
- **Body**: normal width, 400/600, 16px, line-height 1.6, measure ≤ 62ch.
- **Labels** (`.eyebrow`): 12px, 700, uppercase, +0.1em tracking.
- Money uses `.num`: condensed + tabular figures, so columns align and values don't jitter as they update.

Scale (`--fs-*`): 12 · 14 · 16 · 18 · 22 · 28 · 36 · fluid 36–48 · fluid hero 44–76.

## Spacing and layout

- 8-point scale (`--s-1`…`--s-9`: 4, 8, 12, 16, 24, 32, 48, 64, 96).
- Content max width 1120px; 24px gutters (16px on mobile).
- Cards: 14px radius, hairline border, soft layered shadow. Hero surfaces: 20px radius.
- Controls are 44px tall (52px for large CTAs).

## Motion

Purposeful and quick (`--ease`, 0.35–0.9s). All of it is disabled under `prefers-reduced-motion`.

- **Landing load**: hero copy rises in sequence; the practice ticket follows.
- **Scroll**: sections rise in once, staggered (`.reveal` + `useReveal`).
- **Prices**: a brief green/red flash when a price ticks (`useTickDirection`).
- **Portfolio value**: rolls to each new value instead of jumping (`useTween`).
- **Navigation**: each app page fades up. Loading states use shimmer placeholders, not spinners.

## Landing page

The hero's signature is a working practice ticket: visitors buy, watch live P&L and sell before signing up.
It runs entirely in the browser on simulated prices and never calls the API.
