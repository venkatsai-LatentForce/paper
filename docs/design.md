# Design

Calm, minimal UI: neutral surfaces, brand colour for actions, colour otherwise reserved for P&L.
All tokens live at the top of `frontend/src/styles.css`.

## Palette

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--purple` / `--primary` | `#6C3FA0` | same | Primary buttons, active nav, hero, brand mark |
| `--lime` / `--accent` | `#B7F34A` | same | Buy button, "Live" badge, highlights (fill only) |
| `--surface` | `#FFFFFF` | `#1D1629` | Cards, top bar |
| `--bg` | `#F7F5FB` | `#140F1E` | Page background |
| `--text` / `--on-accent` | `#1F1530` | `#F3F0F8` | Body text; text on lime |
| `--muted` | `#6B6280` | `#A79DBA` | Secondary text |
| `--link` | `#6C3FA0` | `#C3A6EE` | Links, active nav text |
| `--up` | `#1E7A3C` | `#B7F34A` | Profit |
| `--down` | `#C62F3C` | `#FF7A85` | Loss, Sell button |

## Contrast rules

- White on purple: **7.4:1**. Use purple as a fill with white text, or as text on white.
- Lime on white: **1.3:1**. **Never** use lime as text or as the only cue on white; use it as a fill with `--on-accent` text (**13:1**).
- On dark surfaces, purple text is too dim; use `--link` instead.
- Profit is green text in light mode (`--up`), lime in dark mode.

## Type

Open Sans (Google Fonts) at 400 / 600 / 700, with a system-ui fallback. Numbers use tabular figures.
