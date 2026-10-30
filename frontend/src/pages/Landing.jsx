import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { money, signedMoney, tone } from "../format.js";
import { useReveal, useTickDirection } from "../hooks.js";

const START_CASH = 1000000;
const DEMO = { RELIANCE: 2950, TCS: 4100, INFY: 1850 };

const STEPS = [
  ["Set your practice balance", "Choose any amount up to ₹10,00,000. Past that, it grows only through profitable trades."],
  ["Connect Kite, or start now", "Link your own Kite Connect app for live prices. Until then, practise on simulated prices."],
  ["Trade, then review", "Buy and sell stocks, futures and options. Every order shows exactly what it made or lost."],
];

const MARKETS = [
  ["Stocks", "RELIANCE · TCS · INFY", [["Exchange", "NSE"], ["You pay", "Full price"], ["Selling", "What you hold"]]],
  ["Futures", "NIFTY · BANKNIFTY", [["Exchange", "NFO"], ["You pay", "15% margin"], ["Quantity", "In lots"]]],
  ["Options", "Calls and puts", [["Exchange", "NFO"], ["You pay", "The premium"], ["Quantity", "In lots"]]],
];

const REAL = [
  ["Prices", "From your own Kite account, once connected"],
  ["Lot sizes and expiries", "The same contracts you'd trade on NFO"],
  ["P&L arithmetic", "Average price, margin and realised profit, worked out per order"],
];

const PRACTICE = [
  ["The money", "Dummy INR. You can't deposit or withdraw real funds"],
  ["The orders", "Filled instantly in the app, never sent to an exchange"],
  ["The costs", "No brokerage, taxes or slippage"],
];

// A self-contained practice trade: prices drift locally, nothing touches the server.
function PracticeTicket() {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [prices, setPrices] = useState(DEMO);
  const [qty, setQty] = useState(10);
  const [position, setPosition] = useState(null);
  const [realized, setRealized] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((p) =>
        Object.fromEntries(
          Object.entries(p).map(([s, v]) => [s, Math.round((v + v * (Math.random() - 0.48) * 0.004) / 0.05) * 0.05])
        )
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const price = prices[symbol];
  const dir = useTickDirection(price);
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

      <div className={`ticket-price ${dir}`}>{money(price)}</div>
      <div className="ticket-meta">NSE · {symbol}</div>

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

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}

export default function Landing() {
  return (
    <div>
      <header className="landing-hero">
        <nav className="landing-nav">
          <span className="brand"><span className="brand-mark" />Paper Trade</span>
          <div className="row">
            <a href="#how" className="hide-sm">How it works</a>
            <a href="#markets" className="hide-sm">Markets</a>
            <Link to="/login">Log in</Link>
            <Link to="/register"><button className="accent">Sign up</button></Link>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Practice trading · NSE stocks, futures &amp; options</span>
            <h1 className="hero-title">Make your mistakes with <mark>practice money.</mark></h1>
            <p className="hero-lead">
              Start with up to ₹10,00,000 in dummy INR, trade at live prices from your own Kite account,
              and see the profit or loss on every order. Nothing here touches real money.
            </p>
            <div className="row">
              <Link to="/register"><button className="accent btn-lg btn-arrow">Create free account</button></Link>
              <Link to="/login"><button className="ghost btn-lg">Log in</button></Link>
            </div>
            <p className="hero-note">No card, no brokerage, no real orders.</p>
          </div>
          <PracticeTicket />
        </div>
      </header>

      <section className="section" id="how">
        <Reveal className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From sign-up to first trade in a minute.</h2>
        </Reveal>
        <Reveal className="steps">
          {STEPS.map(([title, text], i) => (
            <div className="step" key={title} style={{ "--i": i }}>
              <span className="step-n">{i + 1}</span>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section" id="markets">
        <Reveal className="section-head">
          <span className="eyebrow">Markets</span>
          <h2>Three markets, one practice account.</h2>
          <p>Each follows its real rules, so what you learn carries over.</p>
        </Reveal>
        <Reveal className="markets">
          {MARKETS.map(([title, eg, specs], i) => (
            <div className="card market" key={title} style={{ "--i": i }}>
              <h3>{title}</h3>
              <div className="eg">{eg}</div>
              {specs.map(([k, v]) => (
                <div className="spec" key={k}><span>{k}</span><span>{v}</span></div>
              ))}
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section">
        <Reveal className="section-head">
          <span className="eyebrow">Know what you're practising</span>
          <h2>What's real, and what's practice.</h2>
        </Reveal>
        <Reveal className="truth">
          <div className="card truth-real" style={{ "--i": 0 }}>
            <h3>Real</h3>
            <ul>{REAL.map(([k, v]) => <li key={k}><strong>{k}</strong><span>{v}</span></li>)}</ul>
          </div>
          <div className="card truth-practice" style={{ "--i": 1 }}>
            <h3>Practice</h3>
            <ul>{PRACTICE.map(([k, v]) => <li key={k}><strong>{k}</strong><span>{v}</span></li>)}</ul>
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="cta-band">
        <div>
          <h2>Your first practice trade is a minute away.</h2>
          <Link to="/register"><button className="accent btn-lg btn-arrow">Create free account</button></Link>
        </div>
      </Reveal>

      <footer className="landing-foot">
        <span className="brand"><span className="brand-mark" />Paper Trade</span>
        <span>A learning tool. No real orders are placed, and nothing here is investment advice.</span>
      </footer>
    </div>
  );
}
