import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import Faq from "../components/landing/Faq.jsx";
import ProductPreview from "../components/landing/ProductPreview.jsx";
import StrategyTester from "../components/landing/StrategyTester.jsx";
import TickerTape from "../components/landing/TickerTape.jsx";
import { useReveal, useScrolled } from "../hooks.js";

const STEPS = [
  ["Sign up", "Your practice account is ready to trade the moment it's created. No card, no KYC."],
  ["Build the position", "Buy stocks, futures and options on their own, or as the legs of a strategy: a protective put, a hedged future, a straddle."],
  ["Watch it at live prices", "Connect your Kite account and see how the strategy behaves as the market moves. Holdings track every leg; Orders keep the record."],
];

// Strategies the app can run today. Every leg is a buy: you can sell only what you hold.
const STRATEGY_ROWS = [
  ["Protective put", "Stock + bought put", "You like a stock but fear a fall", "Capped at the put's strike"],
  ["Hedged futures", "Long future + bought put", "You're bullish on the index and want leverage", "Capped at the put's strike"],
  ["Long straddle", "Bought call + bought put, same strike", "You expect a big move, either way", "Only what you paid"],
  ["Long strangle", "Bought call + bought put, different strikes", "A bigger move, for a cheaper entry", "Only what you paid"],
  ["Index hedge", "Stock basket + bought NIFTY put", "You want to protect a whole portfolio", "Reduced, depending on cover"],
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
  ["Prices", "From your own Kite account, once connected", "The balance", "Practice only. You can't deposit or withdraw real funds"],
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
            <a href="#strategies" className="hide-sm">Strategies</a>
            <a href="#how" className="hide-sm">How it works</a>
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
              <span className="label">Strategy practice · NSE stocks, futures &amp; options</span>
              <h1 className="hero-title">Test the strategy <em>before you trade it.</em><span className="cursor" aria-hidden="true" /></h1>
              <p className="hero-lead">
                Build a position, hedge it with futures and options, and watch how it behaves at live market
                prices. Practise as often as you like. Nothing here touches a real account.
              </p>
              <div className="row">
                <Link to="/register" className="btn primary btn-lg btn-arrow">Start practising</Link>
                <a href="#strategies" className="btn btn-lg">See strategies</a>
              </div>
              <ul className="hero-facts" aria-label="What it involves">
                <li>Live prices</li><li>Real contract rules</li><li>No real orders</li>
              </ul>
            </div>
            <StrategyTester />
          </div>
          <TickerTape />
        </section>

        <section className="section" id="strategies">
          <SectionHead eyebrow="Strategies" title="Hedges you can test today.">
            Every strategy here is built from legs you can place in the app, so you can practise it end to end.
          </SectionHead>
          <Reveal className="compare-wrap">
            <table className="compare compare-strategies">
              <thead>
                <tr>
                  <th scope="col">Strategy</th><th scope="col">Built from</th>
                  <th scope="col">Use it when</th><th scope="col">Worst case</th>
                </tr>
              </thead>
              <tbody>
                {STRATEGY_ROWS.map(([name, legs, when, worst]) => (
                  <tr key={name}>
                    <th scope="row"><span className="compare-name">{name}</span></th>
                    <td>{legs}</td><td>{when}</td><td>{worst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="compare-note">
              Strategies that sell options you don't hold, like covered calls, spreads and iron condors, aren't supported yet.
            </p>
          </Reveal>
        </section>

        <section className="section" id="how">
          <SectionHead eyebrow="How it works" title="From idea to tested strategy." />
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
          <SectionHead eyebrow="In practice" title="See a hedge do its job.">
            A sample portfolio on a falling day: the stocks drop, the NIFTY put rises, and the net move stays small.
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
            <h2><span className="prompt" aria-hidden="true">›</span>Your next strategy deserves a test run.</h2>
            <Link to="/register" className="btn primary btn-lg btn-arrow">Start practising</Link>
          </div>
        </Reveal>
      </main>

      <footer className="landing-foot">
        <div className="foot-brand">
          <span className="brand"><BrandMark />Paper Trade</span>
          <p>Test trading strategies on NSE stocks, futures and options at live prices, without a real account.</p>
        </div>
        <div className="foot-cols">
          <div>
            <span className="label">Product</span>
            <a href="#strategies">Strategies</a>
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
