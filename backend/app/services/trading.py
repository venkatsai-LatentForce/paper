"""Order execution, portfolio valuation and funds.

Cash model (one formula for every instrument type):
  - A holding tracks `cost`: the cash locked in it.
      EQ / CE / PE : cost = quantity * avg_price          (full premium/price)
      FUT          : cost = quantity * avg_price * margin (only margin is blocked)
  - BUY  q @ p : cash -= q * p * rate             (rate = margin for FUT, else 1)
  - SELL q @ p : pnl = (p - avg) * q; cash += cost * q / qty + pnl
For EQ/options the SELL credit reduces to q * p, as expected.

Short selling is not supported: you can only sell what you hold.
"""
import asyncio
from collections import defaultdict
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException

from ..config import settings
from ..db import get_db
from .prices import get_provider, quotes_with_fallback

FUT_MARGIN_RATE = 0.15

INSTRUMENT_FIELDS = (
    "symbol", "exchange", "name", "instrument_type",
    "lot_size", "underlying", "expiry", "strike",
)

# Serialises trades per user within this process (run a single worker).
_locks: defaultdict[str, asyncio.Lock] = defaultdict(asyncio.Lock)


def _rate(instrument_type: str) -> float:
    return FUT_MARGIN_RATE if instrument_type == "FUT" else 1.0


def _instrument(doc: dict) -> dict:
    return {k: doc.get(k) for k in INSTRUMENT_FIELDS}


def _r(x: float) -> float:
    return round(x, 2)


def inr(x: float) -> str:
    """Format rupees with Indian digit grouping, e.g. ₹10,00,000.00."""
    whole, frac = f"{abs(x):.2f}".split(".")
    head, tail = whole[:-3], whole[-3:]
    groups = []
    while len(head) > 2:
        groups.insert(0, head[-2:])
        head = head[:-2]
    if head:
        groups.insert(0, head)
    return f"{'-' if x < 0 else ''}₹{','.join(groups + [tail])}.{frac}"


async def place_order(user: dict, symbol: str, exchange: str, side: str, quantity: int) -> dict:
    db = get_db()
    uid = user["_id"]
    provider = get_provider(user)
    holding_q = {"user_id": uid, "symbol": symbol, "exchange": exchange}

    async with _locks[str(uid)]:
        holding = await db.holdings.find_one(holding_q)
        # Prefer the stored instrument for positions we hold, so a position opened
        # on one price source can still be closed after switching sources.
        inst = _instrument(holding) if holding else await provider.lookup(symbol, exchange)
        if inst is None:
            raise HTTPException(404, f"Unknown instrument {exchange}:{symbol}")

        lot = inst.get("lot_size") or 1
        if quantity % lot:
            raise HTTPException(400, f"Quantity must be a multiple of the lot size ({lot}).")

        quote = await quotes_with_fallback(provider, [inst])
        price = quote[(exchange, symbol)][0]
        itype = inst["instrument_type"]
        realized_pnl = None

        if side == "BUY":
            debit = _r(quantity * price * _rate(itype))
            res = await db.users.update_one(
                {"_id": uid, "cash": {"$gte": debit}}, {"$inc": {"cash": -debit}}
            )
            if res.modified_count == 0:
                cash = (await db.users.find_one({"_id": uid}, {"cash": 1}))["cash"]
                raise HTTPException(
                    400, f"Insufficient funds: need {inr(debit)}, available {inr(cash)}."
                )
            old_qty = holding["quantity"] if holding else 0
            old_avg = holding["avg_price"] if holding else 0.0
            new_qty = old_qty + quantity
            await db.holdings.update_one(
                holding_q,
                {"$set": {
                    **inst,
                    "quantity": new_qty,
                    "avg_price": (old_qty * old_avg + quantity * price) / new_qty,
                    "cost": (holding["cost"] if holding else 0.0) + debit,
                    "updated_at": datetime.now(timezone.utc),
                }},
                upsert=True,
            )
            cash_impact = -debit
        else:
            held = holding["quantity"] if holding else 0
            if quantity > held:
                raise HTTPException(400, f"You hold {held} of {symbol}; cannot sell {quantity}.")
            released = holding["cost"] * quantity / held
            realized_pnl = _r((price - holding["avg_price"]) * quantity)
            credit = _r(released + realized_pnl)
            await db.users.update_one({"_id": uid}, {"$inc": {"cash": credit}})
            if quantity == held:
                await db.holdings.delete_one({"_id": holding["_id"]})
            else:
                await db.holdings.update_one(
                    {"_id": holding["_id"]},
                    {"$inc": {"quantity": -quantity, "cost": -released},
                     "$set": {"updated_at": datetime.now(timezone.utc)}},
                )
            cash_impact = credit

        order = {
            "user_id": uid,
            **inst,
            "side": side,
            "quantity": quantity,
            "price": price,
            "value": _r(quantity * price),
            "cash_impact": cash_impact,
            "realized_pnl": realized_pnl,
            "price_source": provider.source,
            "created_at": datetime.now(timezone.utc),
        }
        order["_id"] = (await db.orders.insert_one(order)).inserted_id
        return order


async def valued_holdings(user: dict) -> tuple[list[dict], str]:
    """Holdings marked to the latest price. Returns (holdings, price_source)."""
    provider = get_provider(user)
    docs = await get_db().holdings.find({"user_id": user["_id"]}).sort("symbol", 1).to_list(None)
    quotes = await quotes_with_fallback(provider, [_instrument(d) for d in docs])
    out = []
    for d in docs:
        ltp = quotes[(d["exchange"], d["symbol"])][0]
        pnl = (ltp - d["avg_price"]) * d["quantity"]
        out.append({
            **_instrument(d),
            "quantity": d["quantity"],
            "avg_price": _r(d["avg_price"]),
            "ltp": ltp,
            "invested": _r(d["cost"]),
            "current_value": _r(d["cost"] + pnl),
            "pnl": _r(pnl),
            "pnl_pct": _r(pnl / d["cost"] * 100) if d["cost"] else 0.0,
        })
    return out, provider.source


async def realized_pnl_total(user_id: ObjectId) -> float:
    rows = await get_db().orders.aggregate([
        {"$match": {"user_id": user_id, "side": "SELL"}},
        {"$group": {"_id": None, "total": {"$sum": "$realized_pnl"}}},
    ]).to_list(1)
    return _r(rows[0]["total"]) if rows else 0.0


async def top_up(user: dict, amount: float) -> dict:
    """Add dummy funds, never letting lifetime deposits exceed MAX_DEPOSIT."""
    cap = settings.max_deposit
    res = await get_db().users.find_one_and_update(
        {"_id": user["_id"], "total_deposited": {"$lte": cap - amount}},
        {"$inc": {"cash": amount, "total_deposited": amount}},
        return_document=True,
    )
    if res is None:
        room = max(cap - user["total_deposited"], 0)
        raise HTTPException(
            400,
            f"Deposits are capped at {inr(cap)}. You can add up to {inr(room)} more; "
            "beyond that your balance can only grow through trading profits.",
        )
    return res
