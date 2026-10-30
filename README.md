# Paper Trade

Learn to trade stocks, futures and options with dummy INR at real prices. No real money is ever involved.

**Stack:** FastAPI (Python) · React (Vite) · MongoDB · Docker

## Run it

```bash
docker compose up --build
```

Open http://localhost:8000. That's the whole app: MongoDB plus one container that serves the API and the React build.

Prices are simulated until you link your own Kite Connect app on the **Connect** page.

## Develop locally

Needs Python 3.12, Node 22 and a local MongoDB.

```bash
# backend (http://localhost:8000, API docs at /docs)
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/uvicorn app.main:app --reload

# frontend (http://localhost:5173, proxies /api to :8000)
cd frontend && npm install && npm run dev
```

## Docs

See [docs/](docs/README.md): architecture, trading rules, Kite setup and the API.
