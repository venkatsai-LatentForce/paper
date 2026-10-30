import { Link } from "react-router-dom";
import { useState } from "react";
import { useSimPrices } from "./sim.js";

// Strategies the app can actually place: every leg is a buy (you can only sell what you hold).
// Payoffs are at expiry, per lot, on simulated prices. Illustrative only.
const STRATEGIES = [
  {
    id: "put",
    name: "Protective put",
    underlying: "INFY",
    range: [1720, 1990],
    idea: "Own the stock and buy a put under it. If it rises you keep the gain; if it falls, the put sets a floor.",
    legs: [["Buy", "INFY", "shares, 1 lot"], ["Buy", "INFY 1800 PE", "put, 1 lot"]],
    payoff: (s) => 400 * (s - 1850) + 400 * (Math.max(1800 - s, 0) - 22),
    downside: "Capped by the put",
    upside: "Open",
  },
  {
    id: "fut",
    name: "Hedged futures",
    underlying: "NIFTY",
    range: [23700, 25450],
    idea: "Go long NIFTY futures for leverage, and buy a put so a sharp fall can't run away from you.",
    legs: [["Buy", "NIFTY FUT", "future, 1 lot"], ["Buy", "NIFTY 24500 PE", "put, 1 lot"]],
    payoff: (s) => 75 * (s - 24560) + 75 * (Math.max(24500 - s, 0) - 195),
    downside: "Capped by the put",
    upside: "Open",
  },
  {
    id: "straddle",
    name: "Long straddle",
    underlying: "NIFTY",
    range: [23600, 25400],
    idea: "Buy a call and a put at the same strike. You don't need the direction, only a big enough move.",
    legs: [["Buy", "NIFTY 24500 CE", "call, 1 lot"], ["Buy", "NIFTY 24500 PE", "put, 1 lot"]],
    payoff: (s) => 75 * (Math.max(s - 24500, 0) + Math.max(24500 - s, 0) - 405),
    downside: "Limited to what you paid",
    upside: "Open, both ways",
  },
];

const W = 360;
const H = 176;
const PAD = { l: 8, r: 8, t: 14, b: 24 };
const fmt = (n) => Math.round(n).toLocaleString("en-IN");

function analyse(st) {
  const [lo, hi] = st.range;
  const n = 160;
  const xs = Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n);
  const ys = xs.map(st.payoff);
  // Breakevens: zero crossings, refined linearly between samples.
  const be = [];
  for (let i = 1; i < xs.length; i++) {
    if (Math.sign(ys[i - 1]) !== Math.sign(ys[i]) && ys[i] !== 0) {
      be.push(xs[i - 1] + ((xs[i] - xs[i - 1]) * -ys[i - 1]) / (ys[i] - ys[i - 1]));
    }
  }
  return { xs, ys, be };
}

function profitsWhen(st, be) {
  if (be.length === 2) return `${st.underlying} below ${fmt(be[0])} or above ${fmt(be[1])}`;
  return `${st.underlying} above ${fmt(be[0])}`;
}

function PayoffChart({ st, spot }) {
  const { xs, ys, be } = analyse(st);
  const [lo, hi] = st.range;
  const ymin = Math.min(...ys, 0);
  const ymax = Math.max(...ys, 0);
  const span = ymax - ymin || 1;
  const X = (s) => PAD.l + ((s - lo) / (hi - lo)) * (W - PAD.l - PAD.r);
  const Y = (v) => PAD.t + ((ymax - v) / span) * (H - PAD.t - PAD.b);
  const zero = Y(0);
  const curve = xs.map((s, i) => `${i ? "L" : "M"}${X(s).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join(" ");
  const area = `${curve} L${X(hi)},${zero} L${X(lo)},${zero} Z`;
  const s = Math.min(Math.max(spot, lo), hi);
  const now = st.payoff(s);

  return (
    <svg className="payoff" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`${st.name} payoff at expiry. Profits when ${profitsWhen(st, be)}.`}>
      <defs>
        <clipPath id={`gain-${st.id}`}><rect x="0" y="0" width={W} height={zero} /></clipPath>
        <clipPath id={`loss-${st.id}`}><rect x="0" y={zero} width={W} height={H - zero} /></clipPath>
      </defs>
      <path d={area} className="payoff-gain" clipPath={`url(#gain-${st.id})`} />
      <path d={area} className="payoff-loss" clipPath={`url(#loss-${st.id})`} />
      <line x1={PAD.l} x2={W - PAD.r} y1={zero} y2={zero} className="payoff-zero" />
      {/* Top-centre and bottom-right stay clear of every curve these strategies draw. */}
      <text x={W / 2} y={PAD.t + 4} textAnchor="middle" className="payoff-zone up">Profit</text>
      <text x={W - PAD.r - 4} y={H - PAD.b - 6} textAnchor="end" className="payoff-zone down">Loss</text>

      {be.map((b) => (
        <g key={b}>
          <line x1={X(b)} x2={X(b)} y1={PAD.t} y2={H - PAD.b} className="payoff-be" />
          <text x={X(b)} y={H - 8} className="payoff-axis" textAnchor="middle">{fmt(b)}</text>
        </g>
      ))}

      <path key={st.id} d={curve} className="payoff-curve" pathLength="1" />

      <g className="payoff-now" style={{ transform: `translate(${X(s)}px, 0)` }}>
        <line y1={PAD.t - 6} y2={H - PAD.b} />
      </g>
      <circle r="4.5" className={`payoff-dot ${now >= 0 ? "up" : "down"}`}
        style={{ transform: `translate(${X(s)}px, ${Y(now)}px)` }} />
    </svg>
  );
}

// Landing hero: pick a strategy and watch its payoff as the (simulated) price moves.
export default function StrategyTester() {
  const { prices } = useSimPrices({ INFY: 1850, NIFTY: 24500 }, 1200);
  const [idx, setIdx] = useState(0);
  const st = STRATEGIES[idx];
  const spot = prices[st.underlying];
  const { be } = analyse(st);
  const inProfit = st.payoff(spot) >= 0;

  return (
    <section className="ticket tester" aria-label="Strategy tester demo">
      <header className="ticket-head">
        <span className="label">Strategy tester</span>
        <span className="status status-live"><i aria-hidden="true" />Simulated prices</span>
      </header>

      <div className="segmented seg-slide ticket-symbols" role="tablist" aria-label="Strategy"
        style={{ "--n": STRATEGIES.length, "--idx": idx }}>
        {STRATEGIES.map((s, i) => (
          <button key={s.id} type="button" role="tab" aria-selected={i === idx} className={i === idx ? "on" : ""}
            onClick={() => setIdx(i)}>
            {s.name}
          </button>
        ))}
      </div>

      <p key={st.id} className="tester-idea">{st.idea}</p>

      <div className="tester-chart">
        <div className="tester-chart-head">
          <span className="label">Payoff at expiry</span>
          <span className={`chip-state ${inProfit ? "up" : "down"}`}>
            Now <b className="num">{st.underlying} {fmt(spot)}</b> · {inProfit ? "in profit" : "in loss"}
          </span>
        </div>
        <PayoffChart st={st} spot={spot} />
      </div>

      <div className="ticket-body">
        <dl className="kvs">
          <div className="kv"><dt>Profits when</dt><dd className="num">{profitsWhen(st, be)}</dd></div>
          <div className="kv"><dt>Downside</dt><dd>{st.downside}</dd></div>
          <div className="kv"><dt>Upside</dt><dd>{st.upside}</dd></div>
        </dl>
        <ol className="legs" aria-label="Legs">
          {st.legs.map(([side, what, note]) => (
            <li key={what}>
              <span className="side side-BUY">{side}</span>
              <b>{what}</b>
              <span className="muted">{note}</span>
            </li>
          ))}
        </ol>
      </div>

      <footer className="ticket-foot">
        <span className="small muted">Each leg is a practice order you can place in the app.</span>
        <Link to="/register" className="btn primary btn-sm btn-arrow">Test this strategy</Link>
      </footer>
    </section>
  );
}
