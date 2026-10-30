import { useEffect, useState } from "react";
import { money, pct, signedMoney, tone } from "../format.js";
import { useTickDirection } from "../hooks.js";
import Sparkline from "./landing/Sparkline.jsx";
import { useSimPrices } from "./landing/sim.js";

// Sample fills that print to the log one after another. Illustrative only.
const FILLS = [
  { side: "BUY", what: "10 RELIANCE", at: "₹2,951.20" },
  { side: "SELL", what: "75 NIFTY26NOVFUT", pnl: 3420 },
  { side: "BUY", what: "2 lots NIFTY 24500 CE", at: "₹186.40" },
  { side: "SELL", what: "40 INFY", pnl: -612.5 },
  { side: "SELL", what: "25 TCS", pnl: 1880 },
  { side: "BUY", what: "15 HDFCBANK", at: "₹1,721.35" },
];
const KEEP = 5;

const clock = (d) => d.toLocaleTimeString("en-GB", { hour12: false });

function useFillLog(ms = 2600) {
  const [log, setLog] = useState(() => {
    const now = Date.now();
    // Newest first; each entry keeps its key so only new lines animate in.
    return [2, 1, 0].map((k) => ({ key: k, time: clock(new Date(now - (3 - k) * ms)), ...FILLS[k] }));
  });
  useEffect(() => {
    let k = 3;
    const id = setInterval(() => {
      const entry = { key: k, time: clock(new Date()), ...FILLS[k % FILLS.length] };
      k += 1;
      setLog((l) => [entry, ...l].slice(0, KEEP));
    }, ms);
    return () => clearInterval(id);
  }, [ms]);
  return log;
}

export default function AuthPanel() {
  const { prices, history } = useSimPrices({ NIFTY: 24500 }, 1200, 72);
  const log = useFillLog();
  const open = history.NIFTY[0];
  const chg = ((prices.NIFTY - open) / open) * 100;
  const tick = useTickDirection(prices.NIFTY);

  return (
    <aside className="auth-panel" aria-hidden="true">
      <div className="auth-panel-inner">
        <p className="auth-panel-title">Every trade teaches something. Make yours cost nothing.</p>

        <div className="term">
          <div className="term-head">
            <span className="label">NIFTY 50</span>
            <span className="tag">Sample</span>
          </div>
          <div className="term-quote">
            <span className={`term-price num ${tick}`}>{money(prices.NIFTY)}</span>
            <span className={`num ${tone(chg)}`}>{pct(chg)}</span>
          </div>
          <Sparkline points={history.NIFTY} height={120} grid />
        </div>

        <div className="term term-log">
          <div className="term-head">
            <span className="label">Order log</span>
            <span className="label">IST</span>
          </div>
          <ol className="log">
            {log.map((f) => (
              <li key={f.key}>
                <span className="num log-time">{f.time}</span>
                <span className={`side side-${f.side}`}>{f.side === "BUY" ? "Buy" : "Sell"}</span>
                <span className="log-what">{f.what}</span>
                <span className="num log-result">
                  {f.pnl !== undefined ? <b className={tone(f.pnl)}>{signedMoney(f.pnl)}</b> : f.at}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}
