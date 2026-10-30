import { useState } from "react";
import { money, pct, signedMoney, tone } from "../../format.js";
import { useTickDirection } from "../../hooks.js";
import Sparkline from "./Sparkline.jsx";
import { useSimPrices } from "./sim.js";

const START_CASH = 1000000;
const DEMO = { RELIANCE: 2950, TCS: 4100, INFY: 1850 };

// A self-contained practice trade on simulated prices; nothing touches the server.
export default function PracticeTicket() {
  const { prices, history } = useSimPrices(DEMO, 1400, 48);
  const [symbol, setSymbol] = useState("RELIANCE");
  const [qty, setQty] = useState(10);
  const [position, setPosition] = useState(null);
  const [realized, setRealized] = useState(0);
  const [result, setResult] = useState(null);

  const price = prices[symbol];
  const dir = useTickDirection(price);
  const open = history[symbol][0];
  const dayChange = ((price - open) / open) * 100;
  const livePnl = position ? (price - position.price) * position.qty : 0;
  const cash = START_CASH + realized - (position ? position.price * position.qty : 0);

  const buy = () => {
    setPosition({ symbol, qty, price });
    setResult(null);
  };
  const sell = () => {
    const pnl = (price - position.price) * position.qty;
    setRealized((r) => r + pnl);
    setResult({ pnl, symbol, qty: position.qty });
    setPosition(null);
  };

  return (
    <section className="ticket" aria-label="Practice trade demo">
      <header className="ticket-head">
        <span className="label">Try a practice trade</span>
        <span className="status status-live"><i aria-hidden="true" />Simulated prices</span>
      </header>

      <div className="segmented ticket-symbols" role="group" aria-label="Stock">
        {Object.keys(DEMO).map((s) => (
          <button key={s} type="button" className={symbol === s ? "on" : ""} aria-pressed={symbol === s}
            disabled={Boolean(position) && position.symbol !== s} onClick={() => setSymbol(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="ticket-quote">
        <div className={`ticket-price num ${dir}`}>{money(price)}</div>
        <div className="ticket-meta">
          <span className="label">NSE · {symbol}</span>
          <span className={`num ${tone(dayChange)}`}>{pct(dayChange)}</span>
        </div>
      </div>

      <Sparkline points={history[symbol]} entry={position?.price} grid />

      <div className="ticket-body">
        {position ? (
          <>
            <dl className="kvs">
              <div className="kv"><dt>Bought {position.qty} at</dt><dd className="num">{money(position.price)}</dd></div>
              <div className="kv kv-strong">
                <dt>Open P&amp;L</dt>
                <dd className={`num ${tone(livePnl)}`}>{signedMoney(livePnl)}</dd>
              </div>
            </dl>
            <button type="button" className="sell btn-block btn-lg" onClick={sell}>
              Sell {position.qty} {symbol}
            </button>
          </>
        ) : (
          <>
            <div className="ticket-trade">
              <div className="stepper">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(5, q - 5))}>−</button>
                <span className="num" aria-live="polite">{qty} shares</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(200, q + 5))}>+</button>
              </div>
              <button type="button" className="buy btn-lg" onClick={buy}>Buy {symbol}</button>
            </div>
            <dl className="kvs">
              <div className="kv"><dt>Order value</dt><dd className="num">{money(qty * price)}</dd></div>
            </dl>
          </>
        )}
      </div>

      {result && (
        <p key={realized} className="ticket-result" role="status">
          <span className="side side-SELL">Sold</span> {result.qty} {result.symbol} for{" "}
          <strong className={`num ${tone(result.pnl)}`}>{signedMoney(result.pnl)}</strong>. Your account logs every trade like this.
        </p>
      )}

      <footer className="ticket-foot">
        <span className="label">Practice cash</span>
        <span className="num">{money(cash)}</span>
      </footer>
    </section>
  );
}
