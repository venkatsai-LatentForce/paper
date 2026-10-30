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

## Logo

A lime growth arrow rising inside a purple rounded tile (`components/BrandMark.jsx`, same artwork in `public/favicon.svg`).
On hover the arrow redraws itself.

## Spacing and layout

- 8-point scale (`--s-1`…`--s-10`: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128).
- Content max width 1160px; 24px gutters (16px on mobile).
- **Depth means "floats".** Only things that sit above the page get a shadow: the practice ticket, product preview,
  portfolio card and the trade form. Everyday surfaces are flat: hairline border, 14px radius.
- **Avoid rows of identical boxes.** Shape follows content: related stats share one ruled strip; comparisons are a
  table; paired lists are a ledger split by one rule; FAQs are a hairline list. Section starts are marked by a 2px rule.
- Controls are 44px tall (36px small, 54px large CTAs).

## Buttons

One system for `<button>` and links styled as buttons (`.btn`). Never nest a button inside a link.

- Variants: `.primary` (purple), `.accent` / `.buy` (lime), `.sell` (red), `.ghost`, default (outlined).
- Hover: 1px lift and a deeper coloured shadow; brand buttons also get a light **sheen** that sweeps across.
- Press: settles down and scales to 98.5%.
- `.btn-arrow` adds an arrow that springs right on hover. Busy buttons show a `.spinner` and set `aria-busy`.

## Login and sign-up

Split screen: the form on a white half, and an ink panel on the other with a live (simulated) NIFTY chart and
"order filled" cards that slide in every few seconds. The panel is decorative (`aria-hidden`) and hidden below 900px.

## Motion

Purposeful and quick (`--ease`, 0.35–0.9s). All of it is disabled under `prefers-reduced-motion`.

- **Landing load**: hero copy rises in sequence; the practice ticket follows.
- **Scroll**: sections rise in once, staggered (`.reveal` + `useReveal`).
- **Prices**: a brief green/red flash when a price ticks (`useTickDirection`).
- **Portfolio value**: rolls to each new value instead of jumping (`useTween`).
- **Navigation**: each app page fades up. Loading states use shimmer placeholders, not spinners.

## Landing page

The hero's signature is a working practice ticket with a live intraday chart: visitors buy, watch the entry line
and live P&L, and sell before signing up. Below the hero runs a ticker tape of sample prices (labelled as such).
Then: how it works, a browser-framed product preview that tilts upright on scroll, the markets comparison table,
the real-vs-practice ledger, FAQ, closing CTA and footer.

Everything on the landing and auth pages runs in the browser on simulated prices (`components/landing/sim.js`) and
never calls the API. Sample figures are always labelled "Simulated" or "Sample".
