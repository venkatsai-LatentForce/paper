# Kite Connect

Each user links **their own** Kite Connect app for live prices. Kite is used for market data only; no orders are ever sent to Zerodha.

## Setup

1. Create an app at https://developers.kite.trade.
2. Set its redirect URL to `<app origin>/connect`, e.g. `http://localhost:8000/connect` (Docker) or `http://localhost:5173/connect` (Vite dev).
3. In the app, open **Connect**, enter the API key and secret, and click **Log in with Kite**.

## Flow

1. Frontend gets the login URL from `GET /api/kite/login-url` and redirects to Kite.
2. Kite redirects back to `/connect?request_token=…&status=success`.
3. Frontend posts the token to `POST /api/kite/connect`; the server exchanges it for an access token.
4. The server stores the API key and access token. **The API secret is never stored.**

The key and secret sit in the browser's `sessionStorage` only during the redirect round trip.

## Session expiry

Kite access tokens expire at **6 AM IST** the next day. After that the app treats the user as
disconnected and falls back to simulated prices (in `auto` mode). Reconnect daily for live prices.

## Price modes (`PRICE_PROVIDER`)

| Value | Behaviour |
| --- | --- |
| `auto` (default) | Kite when connected, otherwise simulated |
| `mock` | Always simulated |
| `kite` | Require Kite; API calls fail with 409 until connected |

Optional `KITE_API_KEY` / `KITE_API_SECRET` set an app-wide Kite app, so users only log in.
