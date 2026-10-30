import { useReveal } from "../../hooks.js";
import BrandMark from "../BrandMark.jsx";

const ROWS = [
  ["RELIANCE", "Stock", "40", "₹2,912.40", "₹2,968.85", "+₹2,258.00", "up"],
  ["NIFTY26NOVFUT", "Future", "75", "₹24,410.00", "₹24,622.00", "+₹15,900.00", "up"],
  ["INFY", "Stock", "120", "₹1,802.10", "₹1,788.55", "−₹1,626.00", "down"],
];

// A static rendering of the dashboard with sample data, framed like a browser window.
export default function ProductPreview() {
  const ref = useReveal();
  return (
    <div ref={ref} className="preview-stage">
      <div className="preview">
        <div className="preview-bar">
          <span className="dots"><i /><i /><i /></span>
          <span className="preview-url">Paper Trade · Dashboard</span>
          <span className="tag">Sample account</span>
        </div>
        <div className="preview-body">
          <div className="pv-nav">
            <span className="brand"><BrandMark size={20} />Paper Trade</span>
            <span className="pv-links"><b>Dashboard</b><span>Explore</span><span>Holdings</span><span>Orders</span></span>
          </div>
          <div className="pv-card">
            <div>
              <span className="eyebrow">Portfolio value</span>
              <div className="pv-big">₹10,42,318.50</div>
              <span className="chip chip-up">+₹42,318.50 · +4.23%</span>
            </div>
            <div className="pv-split">
              <div><span className="eyebrow">Cash</span><span className="num">₹6,18,240.00</span></div>
              <div><span className="eyebrow">Invested</span><span className="num">₹3,96,560.00</span></div>
            </div>
          </div>
          <div className="pv-table">
            <div className="pv-row pv-head"><span>Instrument</span><span>Qty</span><span>Avg</span><span>LTP</span><span>P&amp;L</span></div>
            {ROWS.map(([sym, type, qty, avg, ltp, pnl, t]) => (
              <div className="pv-row" key={sym}>
                <span><b>{sym}</b> <span className="tag">{type}</span></span>
                <span>{qty}</span><span>{avg}</span><span>{ltp}</span>
                <span className={`num ${t}`} style={{ fontWeight: 700 }}>{pnl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
