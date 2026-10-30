import { useEffect, useState } from "react";
import { money, pct, signedMoney, tone } from "../format.js";
import Sparkline from "./landing/Sparkline.jsx";
import { useSimPrices } from "./landing/sim.js";

// Sample fills that slide in one after another. Illustrative only.
const FILLS = [
  { side: "Bought", what: "10 RELIANCE", detail: "at ₹2,951.20" },
  { side: "Sold", what: "75 NIFTY26NOVFUT", pnl: 3420 },
  { side: "Bought", what: "2 lots NIFTY 24500 CE", detail: "at ₹186.40" },
  { side: "Sold", what: "40 INFY", pnl: -612.5 },
  { side: "Sold", what: "25 TCS", pnl: 1880 },
];
const VISIBLE = 3;

function useFills(ms = 2600) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  // Newest first; each fill keeps its own key so only the new one animates in.
  return Array.from({ length: Math.min(n, VISIBLE) }, (_, i) => {
    const k = n - 1 - i;
    return { key: k, ...FILLS[k % FILLS.length] };
  });
}

export default function AuthPanel() {
  const { prices, history } = useSimPrices({ NIFTY: 24500 }, 1200, 60);
  const fills = useFills();
  const open = history.NIFTY[0];
  const chg = ((prices.NIFTY - open) / open) * 100;

  return (
    <aside className="auth-panel" aria-hidden="true">
      <div className="auth-panel-inner">
        <span className="eyebrow">Practice trading</span>
        <h2 className="auth-panel-title">Every trade teaches something. Make yours cost nothing.</h2>

        <div className="glass chart-card">
          <div className="spread">
            <div>
              <span className="eyebrow">NIFTY 50 · sample</span>
              <div className="chart-price num">{money(prices.NIFTY)}</div>
            </div>
            <span className={`chip ${chg >= 0 ? "chip-up" : "chip-down"}`}>{pct(chg)}</span>
          </div>
          <Sparkline points={history.NIFTY} height={110} tone="lime" />
        </div>

        <div className="fills">
          {fills.map((f) => (
            <div className="glass fill" key={f.key}>
              <span className={`fill-icon ${f.side === "Bought" ? "fill-buy" : "fill-sell"}`}>{f.side === "Bought" ? "↗" : "↘"}</span>
              <div className="fill-text">
                <span className="fill-title">Order filled · {f.side} {f.what}</span>
                <span className="fill-sub">
                  {f.pnl !== undefined
                    ? <>Realised <b className={`num ${tone(f.pnl)}`}>{signedMoney(f.pnl)}</b></>
                    : f.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
