"""Bundled instrument catalog used when Kite is not connected.

Equities are a fixed list of liquid NSE names. Futures and options are
generated for a few underlyings across the next two monthly expiries, using
Kite-style trading symbols (e.g. NIFTY25NOVFUT, NIFTY25NOV24000CE) so the
rest of the app treats mock and live instruments the same way.
"""
from datetime import date, timedelta
from functools import lru_cache

# symbol: (name, reference price)
EQUITIES: dict[str, tuple[str, float]] = {
    "RELIANCE": ("Reliance Industries", 2950.0),
    "TCS": ("Tata Consultancy Services", 4100.0),
    "HDFCBANK": ("HDFC Bank", 1720.0),
    "INFY": ("Infosys", 1850.0),
    "ICICIBANK": ("ICICI Bank", 1280.0),
    "HINDUNILVR": ("Hindustan Unilever", 2650.0),
    "ITC": ("ITC", 480.0),
    "SBIN": ("State Bank of India", 820.0),
    "BHARTIARTL": ("Bharti Airtel", 1650.0),
    "KOTAKBANK": ("Kotak Mahindra Bank", 1780.0),
    "LT": ("Larsen & Toubro", 3650.0),
    "AXISBANK": ("Axis Bank", 1150.0),
    "ASIANPAINT": ("Asian Paints", 2900.0),
    "MARUTI": ("Maruti Suzuki", 12500.0),
    "SUNPHARMA": ("Sun Pharmaceutical", 1800.0),
    "TITAN": ("Titan Company", 3400.0),
    "BAJFINANCE": ("Bajaj Finance", 7100.0),
    "WIPRO": ("Wipro", 560.0),
    "ULTRACEMCO": ("UltraTech Cement", 11200.0),
    "NESTLEIND": ("Nestle India", 2450.0),
    "TATAMOTORS": ("Tata Motors", 980.0),
    "TATASTEEL": ("Tata Steel", 155.0),
    "POWERGRID": ("Power Grid Corporation", 330.0),
    "NTPC": ("NTPC", 400.0),
    "ONGC": ("Oil & Natural Gas Corp", 290.0),
    "ADANIENT": ("Adani Enterprises", 3000.0),
    "HCLTECH": ("HCL Technologies", 1750.0),
    "TECHM": ("Tech Mahindra", 1600.0),
    "COALINDIA": ("Coal India", 480.0),
    "JSWSTEEL": ("JSW Steel", 950.0),
    "M&M": ("Mahindra & Mahindra", 2900.0),
    "DRREDDY": ("Dr. Reddy's Laboratories", 6500.0),
    "CIPLA": ("Cipla", 1550.0),
    "BAJAJFINSV": ("Bajaj Finserv", 1700.0),
    "HEROMOTOCO": ("Hero MotoCorp", 5200.0),
    "EICHERMOT": ("Eicher Motors", 4800.0),
    "BRITANNIA": ("Britannia Industries", 5600.0),
    "DIVISLAB": ("Divi's Laboratories", 5000.0),
    "GRASIM": ("Grasim Industries", 2700.0),
    "INDUSINDBK": ("IndusInd Bank", 1400.0),
    "ZOMATO": ("Zomato", 260.0),
    "IRCTC": ("IRCTC", 880.0),
    "DMART": ("Avenue Supermarts", 4600.0),
    "PIDILITIND": ("Pidilite Industries", 3100.0),
    "HAVELLS": ("Havells India", 1800.0),
}

# Underlyings with derivatives: name -> (reference price, lot size, strike step)
DERIVATIVE_UNDERLYINGS: dict[str, tuple[float, int, int]] = {
    "NIFTY": (24500.0, 75, 100),
    "BANKNIFTY": (52000.0, 30, 500),
    "RELIANCE": (2950.0, 500, 20),
    "INFY": (1850.0, 400, 20),
    "HDFCBANK": (1720.0, 550, 20),
    "TCS": (4100.0, 175, 50),
}

INDEX_NAMES = {"NIFTY": "Nifty 50", "BANKNIFTY": "Nifty Bank"}
STRIKES_EACH_SIDE = 6


def _last_thursday(year: int, month: int) -> date:
    nxt = date(year + (month == 12), month % 12 + 1, 1)
    d = nxt - timedelta(days=1)
    while d.weekday() != 3:  # Thursday
        d -= timedelta(days=1)
    return d


def upcoming_expiries(today: date | None = None, count: int = 2) -> list[date]:
    today = today or date.today()
    out: list[date] = []
    y, m = today.year, today.month
    while len(out) < count:
        exp = _last_thursday(y, m)
        if exp >= today:
            out.append(exp)
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    return out


def _sym_prefix(underlying: str, expiry: date) -> str:
    return f"{underlying}{expiry:%y}{expiry:%b}".upper()


def _underlying_name(underlying: str) -> str:
    return INDEX_NAMES.get(underlying) or EQUITIES.get(underlying, (underlying,))[0]


@lru_cache(maxsize=4)
def _build(today: date) -> tuple[dict, ...]:
    items: list[dict] = []
    for sym, (name, _) in EQUITIES.items():
        items.append(
            {"symbol": sym, "name": name, "exchange": "NSE",
             "instrument_type": "EQ", "lot_size": 1}
        )
    for und, (ref, lot, step) in DERIVATIVE_UNDERLYINGS.items():
        uname = _underlying_name(und)
        atm = round(ref / step) * step
        for exp in upcoming_expiries(today):
            prefix = _sym_prefix(und, exp)
            exp_s = exp.isoformat()
            label = f"{exp:%d %b}"
            items.append(
                {"symbol": f"{prefix}FUT", "name": f"{uname} {label} FUT",
                 "exchange": "NFO", "instrument_type": "FUT", "lot_size": lot,
                 "underlying": und, "expiry": exp_s}
            )
            for i in range(-STRIKES_EACH_SIDE, STRIKES_EACH_SIDE + 1):
                strike = atm + i * step
                for opt in ("CE", "PE"):
                    items.append(
                        {"symbol": f"{prefix}{strike}{opt}",
                         "name": f"{uname} {label} {strike} {opt}",
                         "exchange": "NFO", "instrument_type": opt,
                         "lot_size": lot, "underlying": und,
                         "expiry": exp_s, "strike": float(strike)}
                    )
    return tuple(items)


def all_instruments() -> tuple[dict, ...]:
    return _build(date.today())


def find(symbol: str, exchange: str) -> dict | None:
    for inst in all_instruments():
        if inst["symbol"] == symbol and inst["exchange"] == exchange:
            return inst
    return None


def reference_price(symbol: str) -> float | None:
    """Reference price for an equity or index underlying in the mock catalog."""
    if symbol in DERIVATIVE_UNDERLYINGS:
        return DERIVATIVE_UNDERLYINGS[symbol][0]
    if symbol in EQUITIES:
        return EQUITIES[symbol][1]
    return None
