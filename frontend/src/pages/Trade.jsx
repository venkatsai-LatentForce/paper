import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { ErrorText, Pane, Pnl, Skeleton, SourceBadge, TypeTag } from "../components/ui.jsx";
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
  return (
    <dl className="kvs">
      {rows.map(([k, v]) => (
        <div className="kv" key={k}><dt>{k}</dt><dd className="num">{v}</dd></div>
      ))}
    </dl>
  );
}

function OrderForm({ q, holding, onFilled }) {
  const { user, refresh } = useAuth();
  const [side, setSide] = useState("BUY");
  const [units, setUnits] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [filled, setFilled] = useState(false);

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
      // Brief "filled" confirmation on the button itself.
      setFilled(true);
      setTimeout(() => setFilled(false), 1400);
      await refresh();
      onFilled();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pane as="form" title="Order ticket" meta={<span className="muted">Market · instant fill</span>}
      className={`order-ticket side-is-${side}`} onSubmit={submit}>
      <div className="segmented segmented-side" role="group" aria-label="Side">
        {["BUY", "SELL"].map((s) => (
          <button type="button" key={s} className={side === s ? `on on-${s}` : ""} aria-pressed={side === s}
            onClick={() => { setSide(s); setResult(null); }}>
            {s === "BUY" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <div className="field">
        <label htmlFor="units">{isFno ? `Lots (1 lot = ${q.lot_size})` : "Quantity"}</label>
        <input id="units" className="num" type="number" min="1" step="1" value={units} onChange={(e) => setUnits(e.target.value)} />
      </div>

      <dl className="kvs">
        <div className="kv"><dt>Quantity</dt><dd className="num">{qty}</dd></div>
        <div className="kv"><dt>Order value</dt><dd className="num">{money(value)}</dd></div>
        {isFut && side === "BUY" && (
          <div className="kv"><dt>Margin blocked (15%)</dt><dd className="num">{money(required)}</dd></div>
        )}
        {side === "BUY" ? (
          <div className="kv"><dt>Available cash</dt><dd className="num">{money(user.cash)}</dd></div>
        ) : (
          <>
            <div className="kv"><dt>You hold</dt><dd className="num">{held}</dd></div>
            {holding && qty > 0 && qty <= held && (
              <div className="kv"><dt>Est. P&amp;L on this sale</dt><dd><Pnl value={estPnl} /></dd></div>
            )}
          </>
        )}
      </dl>

      <p className="muted small ticket-note">Executes instantly at the live price. Practice order only.</p>
      {blocker && qty > 0 && <p className="error">{blocker}</p>}
      <ErrorText>{error}</ErrorText>
      <button className={`btn-block btn-lg ${side === "BUY" ? "buy" : "sell"}${filled ? " btn-done" : ""}`}
        disabled={busy || Boolean(blocker)} aria-busy={busy}>
        {busy ? <><span className="spinner" />Placing order…</>
          : filled ? <><span className="tick" aria-hidden="true" />Order filled</>
          : `${side === "BUY" ? "Buy" : "Sell"} ${qty || ""} ${q.symbol}`}
      </button>

      {result && (
        <div className="fill-note" role="status">
          <span className={`side side-${result.side}`}>{result.side === "BUY" ? "Bought" : "Sold"}</span>{" "}
          <span className="num">{result.quantity} @ {money(result.price)}</span>
          {result.pnl_type === "realized" && <> · Realised <Pnl value={result.pnl} /></>}{" "}
          <Link to="/orders">View orders</Link>
        </div>
      )}
    </Pane>
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
        <Skeleton height={220} />
        <Skeleton height={380} />
      </div>
    );
  }

  return (
    <div className="stack">
      <Link to="/explore" className="back small">← Explore</Link>
      <div className="trade-grid">
        <div className="stack-lg">
          <section className="quote" aria-label="Quote">
            <div className="spread">
              <div>
                <h1>{q.symbol} <TypeTag type={q.instrument_type} /></h1>
                <p className="muted small">{q.name}</p>
              </div>
              <SourceBadge source={summary?.price_source} />
            </div>
            <div className={`price-big num ${tick}`} aria-live="off">{money(q.ltp)}</div>
            <div className={`num quote-change ${tone(q.change)}`}>
              {q.change > 0 ? "+" : ""}{q.change.toFixed(2)} ({pct(q.change_pct)}) today
            </div>
          </section>
          <Pane title="Details"><Details q={q} /></Pane>
          {holding && (
            <Pane title="Your position">
              <dl className="kvs">
                <div className="kv"><dt>Quantity</dt><dd className="num">{holding.quantity}</dd></div>
                <div className="kv"><dt>Avg price</dt><dd className="num">{money(holding.avg_price)}</dd></div>
                <div className="kv"><dt>Invested</dt><dd className="num">{money(holding.invested)}</dd></div>
                <div className="kv"><dt>P&amp;L</dt><dd><Pnl value={holding.pnl} percent={holding.pnl_pct} /></dd></div>
              </dl>
            </Pane>
          )}
        </div>
        <OrderForm q={q} holding={holding} onFilled={() => { holdings.reload(); quote.reload(); }} />
      </div>
    </div>
  );
}
