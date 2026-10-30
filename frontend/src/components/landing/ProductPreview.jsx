import { useReveal } from "../../hooks.js";
import BrandMark from "../BrandMark.jsx";

// A sample hedged portfolio on a down day: the stocks fall, the NIFTY put rises,
// and the net move is small. Shown in percentages, not amounts.
const ROWS = [
  ["RELIANCE", "Stock", "2,980.00", "2,902.00", "−2.62%", "down"],
  ["HDFCBANK", "Stock", "1,742.00", "1,698.00", "−2.53%", "down"],
  ["INFY", "Stock", "1,868.00", "1,815.00", "−2.84%", "down"],
  ["NIFTY 24000 PE", "Hedge", "96.00", "402.00", "+318.75%", "up"],
];

const STATS = [
  ["NIFTY today", "−1.80%", "down"],
  ["Stocks", "−2.68%", "down"],
  ["Hedge", "+318.75%", "up"],
];

// Static dashboard with sample data, framed as an app window.
// On scroll into view a scan line passes over it once.
export default function ProductPreview() {
  const ref = useReveal();
  return (
    <div ref={ref} className="preview" aria-label="Sample hedged portfolio">
      <div className="preview-bar">
        <span className="brand"><BrandMark size={16} />Paper Trade</span>
        <span className="preview-tabs" aria-hidden="true">
          <span>Dashboard</span><span>Explore</span><b>Holdings</b><span>Orders</span>
        </span>
        <span className="tag">Sample portfolio</span>
      </div>
      <div className="preview-body">
        <div className="pv-summary">
          <div>
            <span className="label">Portfolio, net</span>
            <div className="pv-big num down">−0.21%</div>
            <span className="muted">on a day NIFTY fell 1.80%</span>
          </div>
          <div className="pv-strip">
            {STATS.map(([k, v, t]) => (
              <div key={k}><span className="label">{k}</span><span className={`num ${t}`}>{v}</span></div>
            ))}
          </div>
        </div>
        <div className="pv-table">
          <div className="pv-row pv-head"><span>Instrument</span><span>Role</span><span>Avg</span><span>LTP</span><span>Change</span></div>
          {ROWS.map(([sym, role, avg, ltp, chg, t]) => (
            <div className={`pv-row${role === "Hedge" ? " pv-hedge" : ""}`} key={sym}>
              <span><b>{sym}</b></span>
              <span><span className={`tag${role === "Hedge" ? " tag-hedge" : ""}`}>{role}</span></span>
              <span className="num">{avg}</span><span className="num">{ltp}</span>
              <span className={`num ${t}`}>{chg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
