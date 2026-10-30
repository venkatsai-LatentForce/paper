// Client-side simulated prices for marketing surfaces (landing, auth).
// Never used for trading: the app's real prices come from the API.
import { useEffect, useState } from "react";

const tick = (v, vol = 0.004) => Math.max(0.05, Math.round((v + v * (Math.random() - 0.48) * vol) / 0.05) * 0.05);

function seedHistory(base, n) {
  const out = [base];
  let v = base;
  for (let i = 1; i < n; i++) {
    v = tick(v, 0.005);
    out.unshift(v);
  }
  return out;
}

// prices: latest per symbol; history: last `keep` prices per symbol.
export function useSimPrices(bases, ms = 1400, keep = 0) {
  const [state, setState] = useState(() => ({
    prices: { ...bases },
    history: keep ? Object.fromEntries(Object.entries(bases).map(([s, v]) => [s, seedHistory(v, keep)])) : {},
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setState(({ prices, history }) => {
        const next = Object.fromEntries(Object.entries(prices).map(([s, v]) => [s, tick(v)]));
        if (!keep) return { prices: next, history };
        const h = Object.fromEntries(Object.entries(history).map(([s, arr]) => [s, [...arr.slice(1 - keep), next[s]]]));
        return { prices: next, history: h };
      });
    }, ms);
    return () => clearInterval(id);
  }, [ms, keep]);

  return state;
}
