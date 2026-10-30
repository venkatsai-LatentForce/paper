import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import Faq from "../components/landing/Faq.jsx";
import PracticeTicket from "../components/landing/PracticeTicket.jsx";
import ProductPreview from "../components/landing/ProductPreview.jsx";
import TickerTape from "../components/landing/TickerTape.jsx";
import { useReveal, useScrolled } from "../hooks.js";

const STEPS = [
  ["Start with ₹1,00,000", "Every account opens with ₹1,00,000 of practice money. Add more up to ₹10,00,000; past that, only profits grow it."],
  ["Connect Kite, or start now", "Link your own Kite Connect app for live prices. Until then, practise on simulated prices."],
  ["Trade, then review", "Buy and sell stocks, futures and options. Every order shows exactly what it made or lost."],
];

const MARKET_COLS = [
  ["Stocks", "RELIANCE, TCS, INFY…"],
  ["Futures", "NIFTY, BANKNIFTY…"],
  ["Options", "Calls and puts"],
];
const MARKET_ROWS = [
  ["Exchange", "NSE", "NFO", "NFO"],
  ["You pay", "Full price", "15% margin", "The premium"],
  ["Quantity", "Any number of shares", "In lots", "In lots"],
  ["Selling", "What you hold", "Close what you hold", "Close what you hold"],
];

const LEDGER = [
  ["Prices", "From your own Kite account, once connected", "The money", "Dummy INR. You can't deposit or withdraw real funds"],
  ["Lot sizes and expiries", "The same contracts you'd trade on NFO", "The orders", "Filled instantly in the app, never sent to an exchange"],
  ["P&L arithmetic", "Average price, margin and realised profit, per order", "The costs", "No brokerage, taxes or slippage"],
];

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}

function SectionHead({ eyebrow, title, children }) {
  return (
    <Reveal className="section-head">
      <span className="label">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}

export default function Landing() {
  const scrolled = useScrolled(24);
  return (
    <div className="landing">
      <a href="#hero" className="skip">Skip to content</a>
      <header className={`landing-nav-wrap${scrolled ? " scrolled" : ""}`}>
        <nav className="landing-nav" aria-label="Main">
          <Link to="/" className="brand"><BrandMark />Paper Trade</Link>
          <div className="landing-links">
            <a href="#how" className="hide-sm">How it works</a>
            <a href="#markets" className="hide-sm">Markets</a>
            <a href="#faq" className="hide-sm">FAQ</a>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn primary btn-sm">Sign up</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="landing-hero" id="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="label">Practice trading · NSE stocks, futures &amp; options</span>
              <h1 className="hero-title">Make your mistakes with <em>practice money.</em><span className="cursor" aria-hidden="true" /></h1>
              <p className="hero-lead">
                Start with ₹1,00,000 in dummy INR and add more up to ₹10,00,000. Trade at live prices from
                your own Kite account and see the profit or loss on every order. Nothing here touches real money.
              </p>
              <div className="row">
                <Link to="/register" className="btn primary btn-lg btn-arrow">Create free account</Link>
                <Link to="/login" className="btn btn-lg">Log in</Link>
              </div>
              <ul className="hero-facts" aria-label="What it costs">
                <li>No card</li><li>No brokerage</li><li>No real orders</li>
              </ul>
            </div>
            <PracticeTicket />
          </div>
          <TickerTape />
        </section>

        <section className="section" id="how">
          <SectionHead eyebrow="How it works" title="From sign-up to first trade in a minute." />
          <Reveal as="ol" className="steps">
            {STEPS.map(([title, text], i) => (
              <li className="step" key={title} style={{ "--i": i }}>
                <span className="step-n label">Step {i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </Reveal>
        </section>

        <section className="section section-wide">
          <SectionHead eyebrow="The app" title="One calm view of everything you hold.">
            Portfolio value, cash, open positions and every order's P&amp;L, refreshed as prices move.
          </SectionHead>
          <ProductPreview />
        </section>

        <section className="section" id="markets">
          <SectionHead eyebrow="Markets" title="Three markets, their real rules.">
            What you learn here carries over, because each market works the way it does on the exchange.
          </SectionHead>
          <Reveal className="compare-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Rule</span></th>
                  {MARKET_COLS.map(([name, eg]) => (
                    <th scope="col" key={name}><span className="compare-name">{name}</span><span className="compare-eg">{eg}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKET_ROWS.map(([rule, ...vals]) => (
                  <tr key={rule}>
                    <th scope="row">{rule}</th>
                    {vals.map((v, i) => <td key={i}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </section>

        <section className="section">
          <SectionHead eyebrow="Know what you're practising" title="What's real, and what's practice." />
          <Reveal className="ledger">
            <div className="ledger-col">
              <h3><span className="ledger-key ledger-key-real" aria-hidden="true" />Real</h3>
              {LEDGER.map(([k, v]) => <div className="ledger-row" key={k}><strong>{k}</strong><span>{v}</span></div>)}
            </div>
            <div className="ledger-col">
              <h3><span className="ledger-key ledger-key-practice" aria-hidden="true" />Practice</h3>
              {LEDGER.map(([, , k, v]) => <div className="ledger-row" key={k}><strong>{k}</strong><span>{v}</span></div>)}
            </div>
          </Reveal>
        </section>

        <section className="section" id="faq">
          <SectionHead eyebrow="Questions" title="Before you start." />
          <Reveal><Faq /></Reveal>
        </section>

        <Reveal as="section" className="cta-band">
          <div className="cta-inner">
            <h2><span className="prompt" aria-hidden="true">›</span>Your first practice trade is a minute away.</h2>
            <Link to="/register" className="btn primary btn-lg btn-arrow">Create free account</Link>
          </div>
        </Reveal>
      </main>

      <footer className="landing-foot">
        <div className="foot-brand">
          <span className="brand"><BrandMark />Paper Trade</span>
          <p>Practice trading for NSE stocks, futures and options, with dummy INR and real prices.</p>
        </div>
        <div className="foot-cols">
          <div>
            <span className="label">Product</span>
            <a href="#how">How it works</a>
            <a href="#markets">Markets</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <span className="label">Account</span>
            <Link to="/register">Create account</Link>
            <Link to="/login">Log in</Link>
          </div>
        </div>
        <p className="foot-legal">
          A learning tool. No real orders are placed, and nothing here is investment advice.
          Kite and Zerodha are trademarks of their owners; Paper Trade is not affiliated with them.
        </p>
      </footer>
    </div>
  );
}
