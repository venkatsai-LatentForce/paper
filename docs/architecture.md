# Architecture

```
paper/
├── Dockerfile            multi-stage: build React → run FastAPI serving the build
├── docker-compose.yml    app + MongoDB
├── backend/app/
│   ├── main.py           FastAPI app, routers, serves the React build
│   ├── config.py         settings from env / .env
│   ├── db.py             Motor client, indexes
│   ├── core/             JWT + password hashing, auth dependency
│   ├── models/           Pydantic request/response schemas
│   ├── routers/          auth, connect (Kite), portfolio, market, orders
│   └── services/
│       ├── catalog.py    bundled instruments for mock mode (NSE + generated NFO)
│       ├── prices.py     price providers: Mock and Kite, picked per user
│       └── trading.py    order execution, valuation, top-ups
├── frontend/src/
│   ├── api/client.js     fetch wrapper (JWT, errors)
│   ├── context/          auth state
│   ├── components/       layout + small UI pieces
│   └── pages/            one file per screen
└── docs/
```

## Request flow

React calls `/api/*` with a bearer JWT. Routers resolve the user, pick a price provider
(`services/prices.get_provider`) and delegate to `services/trading`.

## Price providers

Both implement `search`, `lookup` and `quotes`.

- **MockProvider:** deterministic simulated prices that drift over minutes, hours and days. Futures and options are priced off the simulated underlying.
- **KiteProvider:** the user's own Kite session; instrument dump cached daily.

Instruments Kite can't price (e.g. a position opened in mock mode) fall back to mock prices.

## Data model (MongoDB)

| Collection | Key fields |
| --- | --- |
| `users` | email (unique), password_hash, cash, total_deposited, kite{api_key, access_token, user_name, connected_at} |
| `holdings` | user_id, symbol, exchange, instrument fields, quantity, avg_price, cost |
| `orders` | user_id, instrument fields, side, quantity, price, value, cash_impact, realized_pnl, price_source, created_at |

Instrument fields: `symbol, exchange, name, instrument_type (EQ|FUT|CE|PE), lot_size, underlying, expiry, strike`.

## Concurrency

Orders are serialised per user with an in-process lock, and cash debits use a conditional
Mongo update so a balance never goes below the order cost. Run a **single** API worker.
