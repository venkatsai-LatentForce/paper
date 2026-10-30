import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { ErrorText, Pnl, Skeleton, SourceBadge, TypeTag } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { money, pct, tone } from "../format.js";
import { PRICE_REFRESH_MS, useApi, useTickDirection } from "../hooks.js";

// Must match FUT_MARGIN_RATE in backend/app/services/trading.py.
const FUT_MARGIN_RATE = 0.15;

function Details({ q }) {
  const rows = [
    ["Exchange", q.exchange],
    q.underlying && ["Underlying", q.underlying],
    q.expiry && ["Expiry", new Date(q.expiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
    q.strike && ["Strike", money(q.strike)],
    q.lot_size > 1 && ["Lot size", q.lot_size],
  ].filter(Boolean);
  return rows.map(([k, v]) => (
    <div className="kv" key={k}><span className="muted">{k}</span><span>{v}</span></div>
  ));
}

function OrderForm({ q, holding, onFilled }) {
  const { user, refresh } = useAuth();
  const [side, setSide] = useState("BUY");
  const [units, setUnits] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const isFno = q.lot_size > 1;
  const qty = (parseInt(units, 10) || 0) * q.lot_size;
  const value = qty * q.ltp;
  const isFut = q.instrument_type === "FUT";
  const required = isFut ? value * FUT_MARGIN_RATE : value;
  const held = holding?.quantity ?? 0;
  const estPnl = holding ? (q.ltp - holding.avg_price) * qty : 0;

  const blocker =
    qty <= 0 ? "Enter a quantity."
    : side === "BUY" && required > user.cash ? `Not enough cash (available ${money(user.cash)}).`
    : side === "SELL" && qty > held ? (held ? `You hold only ${held}.` : "You don't hold this instrument.")
    : "";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const order = await api("/orders", {
        method: "POST",
        body: { symbol: q.symbol, exchange: q.exchange, side, quantity: qty },
      });
      setResult(order);
      await refresh();
      onFilled();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <div className="segmented" style={{ marginBottom: 16 }}>
        {["BUY", "SELL"].map((s) => (
          <button type="button" key={s} className={side === s ? "on" : ""} onClick={() => { setSide(s); setResult(null); }}>
            {s === "BUY" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <div className="field">
        <label htmlFor="units">{isFno ? `Lots (1 lot = ${q.lot_size})` : "Quantity"}</label>
        <input id="units" type="number" min="1" step="1" value={units} onChange={(e) => setUnits(e.target.value)} />
      </div>

      <div className="kv"><span className="muted">Quantity</span><span>{qty}</span></div>
      <div className="kv"><span className="muted">Order value</span><span>{money(value)}</span></div>
      {isFut && side === "BUY" && (
        <div className="kv"><span className="muted">Margin blocked (15%)</span><span>{money(required)}</span></div>
      )}
      {side === "BUY" ? (
        <div className="kv"><span className="muted">Available cash</span><span>{money(user.cash)}</span></div>
      ) : (
        <>
          <div className="kv"><span className="muted">You hold</span><span>{held}</span></div>
          {holding && qty > 0 && qty <= held && (
            <div className="kv"><span className="muted">Est. P&L on this sale</span><Pnl value={estPnl} /></div>
          )}
        </>
      )}

      <p className="muted small" style={{ margin: "12px 0" }}>Executes instantly at the live price. Dummy money only.</p>
      {blocker && qty > 0 && <p className="error">{blocker}</p>}
      <ErrorText>{error}</ErrorText>
      <button className={`btn-block ${side === "BUY" ? "buy" : "sell"}`} disabled={busy || Boolean(blocker)}>
        {busy ? "Placing…" : `${side === "BUY" ? "Buy" : "Sell"} ${qty || ""} ${q.symbol}`}
      </button>

      {result && (
        <div className="success" style={{ marginTop: 12 }}>
          {result.side === "BUY" ? "Bought" : "Sold"} {result.quantity} @ {money(result.price)}.
          {result.pnl_type === "realized" && <> Realised P&L: <Pnl value={result.pnl} />.</>}{" "}
          <Link to="/orders">View orders</Link>
        </div>
      )}
    </form>
  );
}

export default function Trade() {
  const { exchange, symbol } = useParams();
  const quote = useApi(`/market/quote?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}`, PRICE_REFRESH_MS);
  const holdings = useApi("/holdings");
  const { data: summary } = useApi("/dashboard");
  const q = quote.data;
  const tick = useTickDirection(q?.ltp);
  const holding = holdings.data?.find((h) => h.symbol === symbol && h.exchange === exchange);

  if (quote.error && !q) {
    return <div className="stack"><ErrorText>{quote.error}</ErrorText><Link to="/explore">Back to Explore</Link></div>;
  }
  if (!q) {
    return (
      <div className="trade-grid">
        <Skeleton height={220} style={{ borderRadius: "var(--radius)" }} />
        <Skeleton height={380} style={{ borderRadius: "var(--radius)" }} />
      </div>
    );
  }

  return (
    <div className="stack">
      <Link to="/explore" className="small">← Explore</Link>
      <div className="trade-grid">
        <div className="stack">
          <div className="card">
            <div className="spread">
              <div>
                <h1>{q.symbol} <TypeTag type={q.instrument_type} /></h1>
                <p className="muted small">{q.name}</p>
              </div>
              <SourceBadge source={summary?.price_source} />
            </div>
            <div className={`price-big ${tick}`}>{money(q.ltp)}</div>
            <div className={tone(q.change)} style={{ fontWeight: 600, marginTop: "var(--s-1)" }}>
              {q.change > 0 ? "+" : ""}{q.change.toFixed(2)} ({pct(q.change_pct)}) today
            </div>
          </div>
          <div className="card">
            <h2>Details</h2>
            <Details q={q} />
          </div>
          {holding && (
            <div className="card">
              <h2>Your position</h2>
              <div className="kv"><span className="muted">Quantity</span><span>{holding.quantity}</span></div>
              <div className="kv"><span className="muted">Avg price</span><span>{money(holding.avg_price)}</span></div>
              <div className="kv"><span className="muted">Invested</span><span>{money(holding.invested)}</span></div>
              <div className="kv"><span className="muted">P&L</span><Pnl value={holding.pnl} percent={holding.pnl_pct} /></div>
            </div>
          )}
        </div>
        <OrderForm q={q} holding={holding} onFilled={() => { holdings.reload(); quote.reload(); }} />
      </div>
    </div>
  );
}
