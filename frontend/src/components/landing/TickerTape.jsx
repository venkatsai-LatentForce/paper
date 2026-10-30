import { money, pct, tone } from "../../format.js";
import { useSimPrices } from "./sim.js";

const TAPE = {
  NIFTY: 24500, BANKNIFTY: 52000, RELIANCE: 2950, TCS: 4100, HDFCBANK: 1720, INFY: 1850,
  ICICIBANK: 1280, SBIN: 820, ITC: 480, BHARTIARTL: 1650, LT: 3650, TATAMOTORS: 980,
};

function Items({ prices, hidden }) {
  return (
    <ul className="tape-items" aria-hidden={hidden || undefined}>
      {Object.entries(prices).map(([s, p]) => {
        const chg = ((p - TAPE[s]) / TAPE[s]) * 100;
        return (
          <li key={s}>
            <span className="tape-sym">{s}</span>
            <span className="num">{money(p)}</span>
            <span className={`num tape-chg ${tone(chg)}`}>{chg >= 0 ? "▲" : "▼"} {pct(chg)}</span>
          </li>
        );
      })}
    </ul>
  );
}

// Scrolling strip of sample prices; pauses on hover, static under reduced motion.
export default function TickerTape() {
  const { prices } = useSimPrices(TAPE, 2200);
  return (
    <div className="tape" aria-label="Sample prices">
      <span className="tape-label">Sample prices</span>
      <div className="tape-viewport">
        <div className="tape-track">
          <Items prices={prices} />
          <Items prices={prices} hidden />
        </div>
      </div>
    </div>
  );
}
