"""Link the user's own Kite Connect account for live prices.

Flow: the frontend sends the user to Kite's login page with their API key;
Kite redirects back to /connect?request_token=...; the frontend posts that
token here and we exchange it for an access token (valid until 6 AM IST).
The API secret is used for the exchange only and is never stored.
"""
import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..config import settings
from ..core.deps import get_current_user
from ..db import get_db
from ..models.schemas import KiteConnectIn
from ..services.prices import kite_session_active

router = APIRouter(prefix="/api/kite", tags=["kite"])


@router.get("/status")
async def status(user: dict = Depends(get_current_user)):
    kite = user.get("kite") or {}
    return {
        "connected": kite_session_active(user),
        "user_name": kite.get("user_name"),
        "connected_at": kite.get("connected_at"),
        "app_key_configured": bool(settings.kite_api_key),
        "price_provider": settings.price_provider,
    }


@router.get("/login-url")
async def login_url(api_key: str = ""):
    key = api_key or settings.kite_api_key
    if not key:
        raise HTTPException(400, "Enter your Kite Connect API key.")
    return {"url": f"https://kite.zerodha.com/connect/login?v=3&api_key={key}"}


@router.post("/connect")
async def connect(body: KiteConnectIn, user: dict = Depends(get_current_user)):
    from kiteconnect import KiteConnect
    from kiteconnect.exceptions import KiteException

    api_key = body.api_key or settings.kite_api_key
    api_secret = body.api_secret or settings.kite_api_secret
    if not api_key or not api_secret:
        raise HTTPException(400, "API key and secret are required.")

    kite = KiteConnect(api_key=api_key)
    try:
        session = await asyncio.to_thread(kite.generate_session, body.request_token, api_secret)
    except KiteException as e:
        raise HTTPException(400, f"Kite rejected the login: {e}")

    await get_db().users.update_one(
        {"_id": user["_id"]},
        {"$set": {"kite": {
            "api_key": api_key,
            "access_token": session["access_token"],
            "user_name": session.get("user_name"),
            "connected_at": datetime.now(timezone.utc),
        }}},
    )
    return {"connected": True, "user_name": session.get("user_name")}


@router.delete("")
async def disconnect(user: dict = Depends(get_current_user)):
    await get_db().users.update_one({"_id": user["_id"]}, {"$unset": {"kite": ""}})
    return {"connected": False}
