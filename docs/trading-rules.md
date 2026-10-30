# Trading rules

## Balance

- At sign-up the user picks a starting balance, up to **₹10,00,000**.
- Top-ups are allowed until lifetime deposits (`total_deposited`) reach ₹10,00,000.
- Past that, the balance grows only through trading profits.
- Total P&L = portfolio value − total deposited.

## Orders

- Market orders only. They fill instantly at the current price (live Kite or simulated).
- No brokerage or taxes.
- **No short selling.** You can sell only what you hold.
- F&O quantities must be a multiple of the lot size; the UI takes lots.

## Cash and P&L

Every holding tracks `cost`, the cash locked in it.

| Type | Buy debits | `cost` |
| --- | --- | --- |
| Stock (EQ) | qty × price | qty × avg |
| Option (CE/PE) | qty × premium | qty × avg |
| Future (FUT) | qty × price × **15% margin** | qty × avg × 15% |

Selling `q` units at `p`:

```
realized_pnl = (p − avg_price) × q
cash        += cost × q / held_qty + realized_pnl
```

For stocks and options this equals `q × p`. For futures it releases the margin and settles the P&L.
A large futures loss can therefore push cash below zero.

Average price on adding to a position is the quantity-weighted average.

## What each screen shows

- **Holdings:** unrealised P&L = (LTP − avg) × qty.
- **Orders:** sells show realised P&L; buys show P&L against the current price.
- **Dashboard:** portfolio value, cash, invested, unrealised, realised and total P&L.

## Known limits

- Expired F&O contracts are not auto-settled; they keep pricing at intrinsic value (mock) until sold.
- Futures margin is a flat 15%, not SPAN.
