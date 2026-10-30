# API

All endpoints are under `/api`. Except register/login/health, they need `Authorization: Bearer <jwt>`.
Interactive docs: `http://localhost:8000/docs`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | `{name, email, password}` → `{access_token}`; account starts with `DEFAULT_BALANCE` |
| POST | `/auth/login` | `{email, password}` → `{access_token}` |
| GET | `/me` | Current user, cash, deposits, Kite status |
| POST | `/me/topup` | `{amount}`; rejected past the ₹10,00,000 lifetime cap |
| GET | `/kite/status` | Connection state |
| GET | `/kite/login-url?api_key=` | Kite login URL |
| POST | `/kite/connect` | `{api_key, api_secret, request_token}` |
| DELETE | `/kite` | Disconnect |
| GET | `/dashboard` | Portfolio summary and `price_source` |
| GET | `/holdings` | Positions marked to market |
| GET | `/market/search?q=&limit=` | Instruments + quotes; every word must match |
| GET | `/market/popular` | A few liquid stocks |
| GET | `/market/quote?symbol=&exchange=` | One quote |
| POST | `/orders` | `{symbol, exchange, side: BUY\|SELL, quantity}` |
| GET | `/orders?limit=` | Executed orders, newest first, each with `pnl` and `pnl_type` |
| GET | `/health` | Liveness |

Errors are `{"detail": "<message>"}` with a 4xx status. A 409 on price endpoints means the Kite session expired.
