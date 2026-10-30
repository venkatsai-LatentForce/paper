"""Price providers.

Every provider exposes the same three calls:
  - search(query)              -> instruments matching a query
  - lookup(symbol, exchange)   -> one instrument, or None
  - quotes(instruments)        -> {(exchange, symbol): (ltp, prev_close)}

`get_provider(user)` picks Kite when the user has a live Kite session (and the
PRICE_PROVIDER setting allows it), otherwise the mock provider.
"""
import asyncio
import hashlib
import math
import time
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException

from ..config import settings
from . import catalog

Key = tuple[str, str]  # (exchange, symbol)


def _key(inst: dict) -> Key:
    return inst["exchange"], inst["symbol"]


def _tick(price: float) -> float:
    """Round to the NSE tick size of 0.05."""
    return round(round(price / 0.05) * 0.05, 2)


def _match(items, query: str, limit: int) -> list[dict]:
    """Every word of the query must appear in the symbol or name."""
    words = query.upper().split()
    if not words:
        return []
    starts, contains = [], []
    for inst in items:
        sym = inst["symbol"]
        text = f"{sym} {inst['name'].upper()}"
        if not all(w in text for w in words):
            continue
        (starts if sym.startswith(words[0]) else contains).append(inst)
    # Equities first, then shorter symbols (front-month before back-month).
    rank = lambda i: (i["instrument_type"] != "EQ", len(i["symbol"]), i["symbol"])
    return (sorted(starts, key=rank) + sorted(contains, key=rank))[:limit]


# ---------------------------------------------------------------- mock ----
class MockProvider:
    """Deterministic simulated prices: smooth, plausible, moving every few seconds."""

    source = "mock"

    @staticmethod
    def _seed(symbol: str) -> list[float]:
        h = hashlib.sha256(symbol.encode()).digest()
        return [b / 255 * 2 * math.pi for b in h[:3]]

    def _underlying_price(self, symbol: str, t: float) -> float:
        ref = catalog.reference_price(symbol)
        if ref is None:  # unknown symbol: derive a stable price from its hash
            ref = 100 + int(hashlib.sha256(symbol.encode()).hexdigest()[:6], 16) % 4900
        a, b, c = self._seed(symbol)
        drift = (
            0.04 * math.sin(2 * math.pi * t / (3 * 86400) + a)
            + 0.01 * math.sin(2 * math.pi * t / 7200 + b)
            + 0.002 * math.sin(2 * math.pi * t / 90 + c)
        )
        return ref * (1 + drift)

    def _price(self, inst: dict, t: float) -> float:
        itype = inst.get("instrument_type", "EQ")
        if itype == "EQ":
            return _tick(self._underlying_price(inst["symbol"], t))

        spot = self._underlying_price(inst["underlying"], t)
        expiry = date.fromisoformat(inst["expiry"])
        days = max((expiry - datetime.fromtimestamp(t, timezone.utc).date()).days, 0)
        if itype == "FUT":
            return _tick(spot * (1 + 0.065 * days / 365))

        strike = inst["strike"]
        intrinsic = max(spot - strike, 0) if itype == "CE" else max(strike - spot, 0)
        # Time value: peaks at the money, decays with distance and time to expiry.
        time_value = (
            spot * 0.012 * math.sqrt(days / 30 + 0.02)
            * math.exp(-abs(spot - strike) / (spot * 0.04))
        )
        return max(_tick(intrinsic + time_value), 0.05)

    async def search(self, query: str, limit: int = 20) -> list[dict]:
        return _match(catalog.all_instruments(), query, limit)

    async def lookup(self, symbol: str, exchange: str) -> dict | None:
        return catalog.find(symbol, exchange)

    async def quotes(self, instruments: list[dict]) -> dict[Key, tuple[float, float]]:
        now = time.time()
        day_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ).timestamp()
        return {
            _key(i): (self._price(i, now), self._price(i, day_start))
            for i in instruments
        }


# ---------------------------------------------------------------- kite ----
class KiteSessionError(Exception):
    """Raised when the user's Kite session is no longer valid."""


_kite_instruments: dict[str, object] = {"day": None, "items": ()}
_kite_instruments_lock = asyncio.Lock()


class KiteProvider:
    """Live prices from the user's own Kite Connect session."""

    source = "kite"

    def __init__(self, api_key: str, access_token: str):
        from kiteconnect import KiteConnect

        self.kite = KiteConnect(api_key=api_key)
        self.kite.set_access_token(access_token)

    async def _call(self, fn, *args):
        from kiteconnect import exceptions as kex

        try:
            return await asyncio.to_thread(fn, *args)
        except kex.TokenException as e:
            raise KiteSessionError(str(e)) from e
        except kex.KiteException as e:
            raise HTTPException(502, f"Kite error: {e}") from e

    async def _instruments(self) -> tuple[dict, ...]:
        """Kite's instrument dump for NSE equities and NFO, cached for the day."""
        today = date.today()
        async with _kite_instruments_lock:
            if _kite_instruments["day"] != today:
                items: list[dict] = []
                for row in await self._call(self.kite.instruments, "NSE"):
                    if row["instrument_type"] == "EQ" and row["segment"] == "NSE":
                        items.append(
                            {"symbol": row["tradingsymbol"],
                             "name": row["name"] or row["tradingsymbol"],
                             "exchange": "NSE", "instrument_type": "EQ",
                             "lot_size": 1}
                        )
                for row in await self._call(self.kite.instruments, "NFO"):
                    if row["instrument_type"] not in ("FUT", "CE", "PE"):
                        continue
                    exp = row["expiry"]
                    items.append(
                        {"symbol": row["tradingsymbol"],
                         "name": row["tradingsymbol"],
                         "exchange": "NFO",
                         "instrument_type": row["instrument_type"],
                         "lot_size": int(row["lot_size"] or 1),
                         "underlying": row["name"],
                         "expiry": exp.isoformat() if exp else None,
                         "strike": float(row["strike"]) if row["strike"] else None}
                    )
                _kite_instruments.update(day=today, items=tuple(items))
            return _kite_instruments["items"]  # type: ignore[return-value]

    async def search(self, query: str, limit: int = 20) -> list[dict]:
        return _match(await self._instruments(), query, limit)

    async def lookup(self, symbol: str, exchange: str) -> dict | None:
        for inst in await self._instruments():
            if inst["symbol"] == symbol and inst["exchange"] == exchange:
                return inst
        return None

    async def quotes(self, instruments: list[dict]) -> dict[Key, tuple[float, float]]:
        if not instruments:
            return {}
        names = [f"{i['exchange']}:{i['symbol']}" for i in instruments]
        data = await self._call(self.kite.quote, names)
        out: dict[Key, tuple[float, float]] = {}
        for inst, name in zip(instruments, names):
            q = data.get(name)
            if q:
                close = q.get("ohlc", {}).get("close") or q["last_price"]
                out[_key(inst)] = (float(q["last_price"]), float(close))
        return out


# ------------------------------------------------------------ selection ----
_mock = MockProvider()
IST = timezone(timedelta(hours=5, minutes=30))


def kite_session_active(user: dict) -> bool:
    """Kite access tokens expire at 6 AM IST the day after login."""
    kite = user.get("kite") or {}
    connected_at = kite.get("connected_at")
    if not kite.get("access_token") or connected_at is None:
        return False
    if connected_at.tzinfo is None:  # Mongo returns naive UTC datetimes
        connected_at = connected_at.replace(tzinfo=timezone.utc)
    now = datetime.now(IST)
    cutoff = now.replace(hour=6, minute=0, second=0, microsecond=0)
    if now < cutoff:
        cutoff -= timedelta(days=1)
    return connected_at >= cutoff


def get_provider(user: dict) -> MockProvider | KiteProvider:
    mode = settings.price_provider
    kite = user.get("kite") or {}
    connected = kite_session_active(user)
    if mode == "mock" or (mode == "auto" and not connected):
        return _mock
    if not connected:
        raise HTTPException(409, "Connect your Kite account to get live prices.")
    return KiteProvider(kite["api_key"], kite["access_token"])


async def quotes_with_fallback(
    provider, instruments: list[dict]
) -> dict[Key, tuple[float, float]]:
    """Quote via the provider; anything it can't price falls back to the mock.

    This covers e.g. positions opened on mock instruments before connecting Kite.
    """
    out = await provider.quotes(instruments)
    missing = [i for i in instruments if _key(i) not in out]
    if missing and provider is not _mock:
        out.update(await _mock.quotes(missing))
    return out
