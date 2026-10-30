import { Link } from "react-router-dom";

const FEATURES = [
  ["Dummy INR, real prices", "Start with up to ₹10,00,000 of practice money and trade at live Kite prices."],
  ["Stocks, futures, options", "Practise across NSE equities and NFO derivatives in one place."],
  ["See every rupee", "Each order shows its profit or loss, so you learn from every trade."],
];

export default function Landing() {
  return (
    <div className="landing">
      <h1>Learn to trade without risking a rupee.</h1>
      <p className="lead">
        Paper Trade gives you a practice account with dummy money and live market prices.
        Build habits, test ideas, and track your results — no real funds involved.
      </p>
      <div className="row">
        <Link to="/register"><button className="primary">Create free account</button></Link>
        <Link to="/login"><button>Log in</button></Link>
      </div>
      <div className="features">
        {FEATURES.map(([title, text]) => (
          <div key={title} className="card">
            <h2>{title}</h2>
            <p className="muted small">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
