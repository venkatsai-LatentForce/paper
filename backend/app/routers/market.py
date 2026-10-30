"""Instrument search and quotes (Explore and Trade pages)."""
from fastapi import APIRouter, Depends, HTTPException, Query

from ..core.deps import get_current_user
from ..db import get_db
from ..models.schemas import Quote
from ..services.prices import get_provider, quotes_with_fallback
from ..services.trading import INSTRUMENT_FIELDS

router = APIRouter(prefix="/api/market", tags=["market"])

POPULAR = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "ITC", "BHARTIARTL"]


def _quote(inst: dict, ltp: float, prev: float) -> Quote:
    change = ltp - prev
    return Quote(
        **{k: v for k, v in inst.items() if v is not None},
        ltp=ltp,
        change=round(change, 2),
        change_pct=round(change / prev * 100, 2) if prev else 0.0,
    )


async def _quotes(provider, instruments: list[dict]) -> list[Quote]:
    prices = await quotes_with_fallback(provider, instruments)
    return [_quote(i, *prices[(i["exchange"], i["symbol"])]) for i in instruments]


@router.get("/search", response_model=list[Quote])
async def search(
    q: str = Query(min_length=1, max_length=40),
    limit: int = Query(20, ge=1, le=50),
    user: dict = Depends(get_current_user),
):
    provider = get_provider(user)
    return await _quotes(provider, await provider.search(q, limit))


@router.get("/popular", response_model=list[Quote])
async def popular(user: dict = Depends(get_current_user)):
    provider = get_provider(user)
    found = [await provider.lookup(s, "NSE") for s in POPULAR]
    return await _quotes(provider, [i for i in found if i])


@router.get("/quote", response_model=Quote)
async def quote(symbol: str, exchange: str = "NSE", user: dict = Depends(get_current_user)):
    provider = get_provider(user)
    inst = await provider.lookup(symbol, exchange)
    if inst is None:
        # A position opened on another price source is still quotable.
        held = await get_db().holdings.find_one(
            {"user_id": user["_id"], "symbol": symbol, "exchange": exchange}
        )
        if held is None:
            raise HTTPException(404, f"Unknown instrument {exchange}:{symbol}")
        inst = {k: held.get(k) for k in INSTRUMENT_FIELDS}
    return (await _quotes(provider, [inst]))[0]
