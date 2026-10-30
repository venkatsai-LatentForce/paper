# Design: Terminal

A professional trading desk, calm rather than loud. Dark espresso surfaces, graphite hairlines, sand text and
**one** accent, tan. Colour otherwise means only one thing: profit (sage) or loss (brick).
All tokens live at the top of `frontend/src/styles.css`. Use tokens, not raw values.

## Palette

The app is **dark only** (`color-scheme: dark`). A trading terminal is read for hours on a dark surface; one
excellent theme beats two average ones, and every contrast pair below is verified once.

| Token | Hex | Role |
| --- | --- | --- |
| `--espresso` / `--bg` | `#1A120E` | Page; text on tan, sage and brick fills |
| `--roast` / `--surface` | `#21170F` | Panes, status bar, tape, auth panel (derived) |
| `--well` | `#140E0B` | Input wells, segmented tracks (derived) |
| `--row` | `#2A1C14` | Table row hover (derived) |
| `--chocolate` | `#3A2418` | Active tab, button hover, result notes |
| `--walnut` | `#6B4A2E` | Text selection, input hover border |
| `--graphite` / `--rule` | `#4A4A46` | Hairline rules and borders |
| `--rule-soft` | `#2E241C` | Row separators inside panes and tables (derived) |
| `--sand` / `--text` | `#D5C4AE` | Primary text |
| `--muted` | `#A89A88` | Secondary text, labels (derived) |
| `--tan` / `--accent` | `#A88462` | Primary button, focus ring, logo, chart line, active underline |
| `--tan-hi` / `--link` | `#C9A27C` | Tan *as text*: links, highlighted words, step numbers (derived) |
| `--up` | `#A3B47C` | Profit text, Buy button (sage olive) |
| `--down` | `#D6806A` | Loss text, Sell button (brick) |

Rules: tan is a fill or a graphic; when tan is text, use `--tan-hi`. Never put tan text on chocolate (4.25:1).
No other hues. Shadows appear only on the two floating objects (practice ticket, product preview).

## Contrast (WCAG AA, all verified)

| Text | Background | Ratio |
| --- | --- | --- |
| Sand | Espresso / Roast / Well / Row / Chocolate / Walnut | 10.85 / 10.33 / 11.24 / 9.68 / 8.53 / 4.67 |
| Muted | Espresso / Roast / Well / Row / Chocolate | 6.72 / 6.40 / 6.96 / 6.00 / 5.29 |
| Tan-hi | Espresso / Roast / Well / Chocolate | 7.87 / 7.49 / 8.15 / 6.19 |
| Espresso | Tan / Tan hover `#B8956F` | 5.40 / 6.66 |
| Espresso | Sage / hover `#B2C28C` | 8.25 / 9.67 |
| Espresso | Brick / hover `#DF917D` | 6.29 / 7.46 |
| Sage (profit) | Espresso / Roast / Row / Chocolate / up flash | 8.25 / 7.85 / 7.36 / 6.49 / 6.22 |
| Brick (loss) | Espresso / Roast / Row / Chocolate / down flash | 6.29 / 5.99 / 5.61 / 4.95 / 4.97 |
| Tan glyphs (›, focus, logo; non-text ≥ 3) | Espresso / Roast / Well | 5.40 / 5.14 / 5.60 |

## Type

One family: **Open Sans** variable (`wdth` 75–100, `wght` 300–800), used on two axes on purpose.

- **Money and display** (`.num`, `h1–h3`, hero): condensed `75%`, weight 700, tabular lining figures, so columns
  align and ticking prices never jitter.
- **Labels** (`.label`): 11px, 700, uppercase, +0.08em, normal width, muted. Pane titles, column heads, stat names.
- **Body**: normal width, 400/600, 16px (14px in dense UI), line-height 1.6, measure ≤ 62ch.
- Brand and step titles use the semi-condensed cut (`87.5%`).

Scale (`--fs-*`): 11 · 12 · 14 · 16 · 20 · 24 · 32 · 48 · hero fluid 40–76.

## Spacing and shape

- 4-point scale (`--s-1`…`--s-9`: 4, 8, 12, 16, 24, 32, 48, 64, 96). Container 1200px; 24px gutters, 16px on mobile.
- Radii 4px (controls) and 6px (panes). Controls 40px tall; 32px small; 48px large.
- **Rules before boxes.** Tables are rows between hairlines, never boxed. The dashboard summary is one ruled strip.
  A **pane** (roast fill, graphite border, 40px header bar with a label and meta) is used only for things that
  are a unit: order ticket, details, position, funds, top holdings, Kite connection.

## Layout signature

- **App shell** like a terminal: a 48px command bar (brand, tabbed nav with `1`–`5` key hints, cash), and a 28px
  status bar fixed at the bottom with NSE session state, a live IST clock and shortcut hints.
- **Keyboard**: `1`–`5` switch pages, `/` focuses instrument search. Ignored while typing.
- **Landing sections** use a label gutter: heading in the left 4 columns (sticky), content in the right 8.

## Logo

A standalone line-drawn growth arrow, no tile (`components/BrandMark.jsx`, `public/favicon.svg`). Stroke is
`currentColor`: tan on dark surfaces; the favicon switches to walnut on light browser chrome via
`prefers-color-scheme`. On hover the arrow redraws.

## Buttons

`<button>` and `.btn` share one system. Keycap model: a 2px inner base shadow.

- Variants: `.primary` (tan), `.buy` (sage), `.sell` (brick), default (graphite outline), `.btn-quiet`.
- Hover (120ms): fill steps one shade. Outlined buttons take a chocolate fill and a tan underline draws in from
  the left. Brand buttons (`.primary`, `.buy`, `.sell`) get a light band that sweeps across, like the scan line.
- `.btn-arrow`: the arrow runs out right and comes back in from the left.
- Press (60ms): drops 1px, the base flattens, and a tan ring appears that fades out slowly (after-glow).
- Busy: `.spinner` + `aria-busy`, and a short bar runs along the bottom edge. Focus: 2px tan ring.
- Filled: after an order succeeds, the order button pops once and reads "Order filled" with a drawn tick (`.btn-done`).
- Tabs: `.seg-slide` glides one indicator between equal-width options (set `--n` and `--idx`).

## Motion

Fast and precise, 80–280ms on `--ease`. Everything is disabled under `prefers-reduced-motion`.

- **Tick flash**: a price cell washes sage or brick for 700ms in the direction of the move (`useTickDirection`).
- **Rows**: hover lights the row and draws a 2px tan edge.
- **Page load**: app pages settle in (4px, 200ms); a tan segment sweeps the page-head rule once.
- **Landing**: hero lines rise in 60ms steps, a block cursor blinks after the headline, and a scan line passes
  over the strategy tester once. Its payoff curve draws in on each tab change and the "now" marker glides with
  the price. The product preview gets the scan when it scrolls into view.
- **Scroll**: sections reveal once, 8px, staggered 70ms (`.reveal` + `useReveal`).
- **Auth**: new fills print to the order log with a brief chocolate highlight.

## Pages

- **Landing**: the message is *testing strategies and practising*. No rupee amounts and no word "dummy" anywhere
  on the page. Hero thesis is the **strategy tester** (`components/landing/StrategyTester.jsx`): protective put,
  hedged futures and long straddle, each with its legs and a payoff-at-expiry chart. It shows profit/loss zones,
  breakeven prices and a live "now" marker, and describes risk qualitatively ("capped by the put"), not in ₹.
  Under it a ticker tape labelled "Sample". Then: a strategies table, the three-step sequence, a sample hedged
  portfolio in percentages, markets table, real-vs-practice ledger, FAQ, a ruled command-line CTA and footer.
  Only strategies built from bought legs are shown, because the app can't short or write options.
- **Auth**: split screen. Form on espresso; roast panel with a live NIFTY pane and an order log (decorative,
  `aria-hidden`, hidden below 900px). Sign-up asks for no amount and shows no figures.
- **Dashboard**: summary strip, then top holdings and "Add practice funds" with a deposit-cap meter.
- **Trade**: quote header with a large ticking price; details and position panes; sticky order ticket.

Everything on landing and auth runs on simulated prices in the browser (`components/landing/sim.js`) and never
calls the API. Sample figures are always labelled "Simulated" or "Sample".
