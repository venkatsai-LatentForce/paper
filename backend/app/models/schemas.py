"""Request/response schemas."""
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

from ..config import settings

InstrumentType = Literal["EQ", "FUT", "CE", "PE"]
Side = Literal["BUY", "SELL"]


# ---- Auth ----
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    starting_balance: float = Field(gt=0, le=settings.max_deposit)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    cash: float
    total_deposited: float
    max_deposit: float
    kite_connected: bool


# ---- Funds ----
class TopUpIn(BaseModel):
    amount: float = Field(gt=0)


# ---- Kite ----
class KiteConnectIn(BaseModel):
    api_key: str = ""
    api_secret: str = ""
    request_token: str = Field(min_length=1)


# ---- Instruments / quotes ----
class Instrument(BaseModel):
    symbol: str
    name: str
    exchange: str
    instrument_type: InstrumentType = "EQ"
    lot_size: int = 1
    underlying: str | None = None
    expiry: str | None = None
    strike: float | None = None


class Quote(Instrument):
    ltp: float
    change: float = 0.0
    change_pct: float = 0.0


# ---- Trading ----
class OrderIn(BaseModel):
    symbol: str
    exchange: str = "NSE"
    side: Side
    quantity: int = Field(gt=0)


class HoldingOut(BaseModel):
    symbol: str
    exchange: str
    name: str
    instrument_type: InstrumentType
    quantity: int
    avg_price: float
    ltp: float
    invested: float
    current_value: float
    pnl: float
    pnl_pct: float


class DashboardOut(BaseModel):
    cash: float
    invested: float
    holdings_value: float
    portfolio_value: float
    total_deposited: float
    unrealized_pnl: float
    realized_pnl: float
    total_pnl: float
    total_pnl_pct: float
    price_source: str
