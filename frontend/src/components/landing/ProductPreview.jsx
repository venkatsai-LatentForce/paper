import { useReveal } from "../../hooks.js";
import BrandMark from "../BrandMark.jsx";

const ROWS = [
  ["RELIANCE", "Stock", "40", "₹2,912.40", "₹2,968.85", "+₹2,258.00", "up"],
  ["NIFTY26NOVFUT", "Future", "75", "₹24,410.00", "₹24,622.00", "+₹15,900.00", "up"],
  ["INFY", "Stock", "120", "₹1,802.10", "₹1,788.55", "−₹1,626.00", "down"],
];

const STATS = [
  ["Cash", "₹6,18,240.00"],
  ["Invested", "₹3,96,560.00"],
  ["Open P&L", "+₹16,532.00", "up"],
];

// A static rendering of the dashboard with sample data, framed as an app window.
// On scroll into view a scan line passes over it once.
export default function ProductPreview() {
  const ref = useReveal();
  return (
    <div ref={ref} className="preview" aria-label="Sample dashboard">
      <div className="preview-bar">
        <span className="brand"><BrandMark size={16} />Paper Trade</span>
        <span className="preview-tabs" aria-hidden="true">
          <b>Dashboard</b><span>Explore</span><span>Holdings</span><span>Orders</span>
        </span>
        <span className="tag">Sample account</span>
      </div>
      <div className="preview-body">
        <div className="pv-summary">
          <div>
            <span className="label">Portfolio value</span>
            <div className="pv-big num">₹10,42,318.50</div>
            <span className="num up">+₹42,318.50 · +4.23%</span>
          </div>
          <div className="pv-strip">
            {STATS.map(([k, v, t]) => (
              <div key={k}><span className="label">{k}</span><span className={`num ${t ?? ""}`}>{v}</span></div>
            ))}
          </div>
        </div>
        <div className="pv-table">
          <div className="pv-row pv-head"><span>Instrument</span><span>Qty</span><span>Avg</span><span>LTP</span><span>P&amp;L</span></div>
          {ROWS.map(([sym, type, qty, avg, ltp, pnl, t]) => (
            <div className="pv-row" key={sym}>
              <span><b>{sym}</b> <span className="tag">{type}</span></span>
              <span className="num">{qty}</span><span className="num">{avg}</span><span className="num">{ltp}</span>
              <span className={`num ${t}`}>{pnl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
