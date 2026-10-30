# Configuration

Backend settings come from environment variables or `backend/.env` (see `backend/.env.example`).

| Variable | Default | Notes |
| --- | --- | --- |
| `MONGO_URI` | `mongodb://localhost:27017` | `mongodb://mongo:27017` in compose |
| `MONGO_DB` | `paper_trading` | |
| `JWT_SECRET` | `dev-insecure-change-me` | **Set a long random value outside dev** |
| `JWT_EXPIRE_MINUTES` | `10080` (7 days) | |
| `PRICE_PROVIDER` | `auto` | `auto` \| `mock` \| `kite`, see [kite-connect.md](kite-connect.md) |
| `KITE_API_KEY` / `KITE_API_SECRET` | empty | Optional app-wide Kite app |
| `DEFAULT_BALANCE` | `100000` | Practice money every new account starts with (₹) |
| `MAX_DEPOSIT` | `1000000` | Lifetime deposit cap (₹), starting balance included |

With Docker Compose, put overrides in a `.env` file next to `docker-compose.yml`.
