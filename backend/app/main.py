"""FastAPI entrypoint: API routers plus the built React app (when present)."""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .db import close_client, init_indexes
from .routers import auth, connect, market, orders, portfolio
from .services.prices import KiteSessionError

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_indexes()
    yield
    await close_client()


app = FastAPI(title="Paper Trading API", lifespan=lifespan)

for r in (auth, connect, portfolio, market, orders):
    app.include_router(r.router)


@app.exception_handler(KiteSessionError)
async def kite_session_expired(_: Request, __: KiteSessionError):
    return JSONResponse(
        status_code=409,
        content={"detail": "Your Kite session has expired. Reconnect on the Connect page."},
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ---- Serve the React build (production / Docker). In dev, Vite serves it. ----
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    async def spa(path: str):
        if path.startswith("api/"):
            raise HTTPException(404)
        file = (STATIC_DIR / path).resolve()
        if path and file.is_file() and file.is_relative_to(STATIC_DIR):
            return FileResponse(file)
        return FileResponse(STATIC_DIR / "index.html")
