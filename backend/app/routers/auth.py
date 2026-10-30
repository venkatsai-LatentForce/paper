"""Registration, login, current user and dummy-fund top-ups."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from ..config import settings
from ..core.deps import get_current_user
from ..core.security import create_access_token, hash_password, verify_password
from ..db import get_db
from ..models.schemas import LoginIn, RegisterIn, TokenOut, TopUpIn, UserOut
from ..services.prices import kite_session_active
from ..services.trading import top_up

router = APIRouter(prefix="/api", tags=["auth"])


def user_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        cash=round(user["cash"], 2),
        total_deposited=user["total_deposited"],
        max_deposit=settings.max_deposit,
        kite_connected=kite_session_active(user),
    )


@router.post("/auth/register", response_model=TokenOut, status_code=201)
async def register(body: RegisterIn):
    doc = {
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "cash": body.starting_balance,
        "total_deposited": body.starting_balance,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        res = await get_db().users.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(409, "An account with this email already exists.")
    return TokenOut(access_token=create_access_token(str(res.inserted_id)))


@router.post("/auth/login", response_model=TokenOut)
async def login(body: LoginIn):
    user = await get_db().users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Incorrect email or password.")
    return TokenOut(access_token=create_access_token(str(user["_id"])))


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return user_out(user)


@router.post("/me/topup", response_model=UserOut)
async def add_funds(body: TopUpIn, user: dict = Depends(get_current_user)):
    return user_out(await top_up(user, body.amount))
