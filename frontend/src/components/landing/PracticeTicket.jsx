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
    <div className="ticket" aria-label="Practice trade demo">
      <div className="spread">
        <span className="eyebrow">Try a practice trade</span>
        <span className="tag">Simulated prices</span>
      </div>

      <div className="segmented" role="group" aria-label="Stock">
        {Object.keys(DEMO).map((s) => (
          <button key={s} type="button" className={symbol === s ? "on" : ""}
            disabled={Boolean(position) && position.symbol !== s} onClick={() => setSymbol(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="ticket-quote">
        <div>
          <div className={`ticket-price ${dir}`}>{money(price)}</div>
          <div className="ticket-meta">NSE · {symbol} · <span className={tone(dayChange)}>{pct(dayChange)}</span></div>
        </div>
      </div>

      <Sparkline points={history[symbol]} entry={position?.price} />

      <div className="ticket-body">
        {position ? (
          <>
            <div className="kv"><span className="muted">Bought {position.qty} at</span><span className="num">{money(position.price)}</span></div>
            <div className="kv">
              <span className="muted">Open P&amp;L</span>
              <span className={`num ${tone(livePnl)}`} style={{ fontWeight: 800, fontSize: "var(--fs-lg)" }}>{signedMoney(livePnl)}</span>
            </div>
            <button type="button" className="sell btn-block" style={{ marginTop: "var(--s-3)" }} onClick={sell}>
              Sell {position.qty} {symbol}
            </button>
          </>
        ) : (
          <>
            <div className="ticket-trade">
              <div className="stepper">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(5, q - 5))}>−</button>
                <span className="num">{qty} shares</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(200, q + 5))}>+</button>
              </div>
              <button type="button" className="buy" onClick={buy}>Buy {symbol}</button>
            </div>
            <div className="kv" style={{ marginTop: "var(--s-2)" }}>
              <span className="muted">Order value</span><span className="num">{money(qty * price)}</span>
            </div>
          </>
        )}
      </div>

      {result && (
        <div key={realized} className={`ticket-result ${tone(result.pnl)}`}>
          Sold {result.qty} {result.symbol} for{" "}
          <strong className={tone(result.pnl)}>{signedMoney(result.pnl)}</strong>. Your account logs every trade like this.
        </div>
      )}

      <div className="ticket-foot spread small">
        <span className="muted">Practice cash</span>
        <span className="num" style={{ fontWeight: 700, fontSize: "var(--fs-base)" }}>{money(cash)}</span>
      </div>
    </div>
  );
}
