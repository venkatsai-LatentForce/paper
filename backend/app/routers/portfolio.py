"""Dashboard summary and holdings."""
from fastapi import APIRouter, Depends

from ..core.deps import get_current_user
from ..models.schemas import DashboardOut, HoldingOut
from ..services.trading import realized_pnl_total, valued_holdings

router = APIRouter(prefix="/api", tags=["portfolio"])


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(user: dict = Depends(get_current_user)):
    holdings, source = await valued_holdings(user)
    invested = sum(h["invested"] for h in holdings)
    holdings_value = sum(h["current_value"] for h in holdings)
    portfolio = user["cash"] + holdings_value
    deposited = user["total_deposited"]
    total_pnl = portfolio - deposited
    return DashboardOut(
        cash=round(user["cash"], 2),
        invested=round(invested, 2),
        holdings_value=round(holdings_value, 2),
        portfolio_value=round(portfolio, 2),
        total_deposited=deposited,
        unrealized_pnl=round(holdings_value - invested, 2),
        realized_pnl=await realized_pnl_total(user["_id"]),
        total_pnl=round(total_pnl, 2),
        total_pnl_pct=round(total_pnl / deposited * 100, 2) if deposited else 0.0,
        price_source=source,
    )


@router.get("/holdings", response_model=list[HoldingOut])
async def holdings(user: dict = Depends(get_current_user)):
    return (await valued_holdings(user))[0]
