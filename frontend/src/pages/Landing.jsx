import { Link } from "react-router-dom";

const FEATURES = [
  ["Dummy INR, real prices", "Start with up to ₹10,00,000 of practice money and trade at live Kite prices."],
  ["Stocks, futures, options", "Practise across NSE equities and NFO derivatives in one place."],
  ["See every rupee", "Each order shows its profit or loss, so you learn from every trade."],
];

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-nav">
        <span className="brand"><span className="brand-mark" />Paper Trade</span>
        <Link to="/login">Log in</Link>
      </div>
      <section className="hero">
        <h1>Learn to trade <mark>without risking</mark> a rupee.</h1>
        <p className="lead">
          A practice account with dummy money and live market prices. Build habits, test ideas,
          and track your results. No real funds involved.
        </p>
        <div className="row">
          <Link to="/register"><button className="accent">Create free account</button></Link>
          <Link to="/login"><button>Log in</button></Link>
        </div>
      </section>
      <div className="features">
        {FEATURES.map(([title, text]) => (
          <div key={title} className="card">
            <div className="feature-dot" />
            <h2>{title}</h2>
            <p className="muted small">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
