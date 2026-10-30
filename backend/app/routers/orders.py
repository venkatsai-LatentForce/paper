"""Place orders and list executed order history with P&L."""
from fastapi import APIRouter, Depends, Query

from ..core.deps import get_current_user
from ..db import get_db
from ..models.schemas import OrderIn
from ..services.prices import get_provider, quotes_with_fallback
from ..services.trading import INSTRUMENT_FIELDS, place_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _out(o: dict, pnl: float | None, pnl_type: str) -> dict:
    return {
        "id": str(o["_id"]),
        **{k: o.get(k) for k in INSTRUMENT_FIELDS},
        "side": o["side"],
        "quantity": o["quantity"],
        "price": o["price"],
        "value": o["value"],
        "cash_impact": o.get("cash_impact"),
        "pnl": pnl,
        # realized: closed by this SELL. unrealized: this BUY marked to the latest price.
        "pnl_type": pnl_type,
        "created_at": o["created_at"],
    }


@router.post("", status_code=201)
async def create_order(body: OrderIn, user: dict = Depends(get_current_user)):
    order = await place_order(
        user, body.symbol.upper(), body.exchange.upper(), body.side, body.quantity
    )
    if body.side == "SELL":
        return _out(order, order["realized_pnl"], "realized")
    return _out(order, 0.0, "unrealized")


@router.get("")
async def list_orders(
    limit: int = Query(100, ge=1, le=500), user: dict = Depends(get_current_user)
):
    orders = await (
        get_db().orders.find({"user_id": user["_id"]})
        .sort("created_at", -1).limit(limit).to_list(None)
    )
    buys = {(o["exchange"], o["symbol"]): o for o in orders if o["side"] == "BUY"}
    prices = await quotes_with_fallback(
        get_provider(user), [{k: o.get(k) for k in INSTRUMENT_FIELDS} for o in buys.values()]
    )
    out = []
    for o in orders:
        if o["side"] == "SELL":
            out.append(_out(o, o["realized_pnl"], "realized"))
        else:
            ltp = prices[(o["exchange"], o["symbol"])][0]
            out.append(_out(o, round((ltp - o["price"]) * o["quantity"], 2), "unrealized"))
    return out
