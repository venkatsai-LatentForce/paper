import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { ErrorText, PageHead, Pane, Pnl, Skeleton, SourceBadge, Stat } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { money, pct, signedMoney, tone } from "../format.js";
import { PRICE_REFRESH_MS, useApi, useTickDirection, useTween } from "../hooks.js";

function Summary({ d, positions }) {
  const value = useTween(d.portfolio_value);
  const tick = useTickDirection(d.portfolio_value);
  return (
    <section className="summary" aria-label="Portfolio summary">
      <div className="summary-main">
        <span className="label">Portfolio value</span>
        <div className={`summary-value num ${tick}`}>{money(value)}</div>
        <p className="summary-line">
          <span className={`num ${tone(d.total_pnl)}`}>{signedMoney(d.total_pnl)} · {pct(d.total_pnl_pct)}</span>
          <span className="muted"> on {money(d.total_deposited)} deposited</span>
        </p>
      </div>
      <div className="strip">
        <Stat label="Cash"><span className="num">{money(d.cash)}</span></Stat>
        <Stat label="Invested"><span className="num">{money(d.invested)}</span></Stat>
        <Stat label="Holdings value" hint={`${positions} open position${positions === 1 ? "" : "s"}`}>
          <span className="num">{money(d.holdings_value)}</span>
        </Stat>
        <Stat label="Open P&L" hint="Unrealised, at current prices"><Pnl value={d.unrealized_pnl} /></Stat>
        <Stat label="Closed P&L" hint="Realised from everything you've sold"><Pnl value={d.realized_pnl} /></Stat>
      </div>
    </section>
  );
}

function AddFunds({ onDone }) {
  const { user, setUser } = useAuth();
  const room = Math.max(user.max_deposit - user.total_deposited, 0);
  const used = Math.min(user.total_deposited / user.max_deposit, 1);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setUser(await api("/me/topup", { method: "POST", body: { amount: Number(amount) } }));
      setAmount("");
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pane title="Add practice funds"meta={<span className="num">{money(room)} left to add</span>}>
      <div className="meter" role="img" aria-label={`${Math.round(used * 100)}% of the deposit cap used`}>
        <span style={{ transform: `scaleX(${used})` }} />
      </div>
      <div className="spread small meter-legend">
        <span className="muted">Deposited <span className="num text">{money(user.total_deposited)}</span></span>
        <span className="muted">Cap <span className="num text">{money(user.max_deposit)}</span></span>
      </div>
      <p className="muted small measure">
        The cap covers the life of the account. Past it, your balance grows only through trading profits.
      </p>
      {room > 0 && (
        <form className="inline-form" onSubmit={submit}>
          <input type="number" min="1" max={room} step="1" placeholder="Amount in ₹" className="num"
            aria-label="Amount to add" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button disabled={busy} aria-busy={busy}>{busy ? <><span className="spinner" />Adding…</> : "Add funds"}</button>
        </form>
      )}
      <ErrorText>{error}</ErrorText>
    </Pane>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: d, error, reload } = useApi("/dashboard", PRICE_REFRESH_MS);
  const { data: holdings } = useApi("/holdings", PRICE_REFRESH_MS);
  const top = (holdings ?? []).slice().sort((a, b) => b.current_value - a.current_value).slice(0, 5);

  return (
    <div className="stack-lg">
      <PageHead eyebrow="Dashboard" title={`Hi, ${user.name.split(" ")[0]}`} aside={<SourceBadge source={d?.price_source} />} />
      <ErrorText>{error}</ErrorText>

      {d ? <Summary d={d} positions={holdings?.length ?? 0} /> : !error && <Skeleton height={168} />}

      <div className="dash-grid">
        <Pane title="Top holdings" meta={<Link to="/holdings">View all</Link>} className="pane-flush">
          {top.length ? (
            <table className="compact">
              <thead><tr><th scope="col">Instrument</th><th scope="col">Value</th><th scope="col">P&amp;L</th></tr></thead>
              <tbody>
                {top.map((h) => (
                  <tr key={`${h.exchange}:${h.symbol}`}>
                    <td><Link to={`/trade/${h.exchange}/${encodeURIComponent(h.symbol)}`} className="sym">{h.symbol}</Link></td>
                    <td className="num">{money(h.current_value)}</td>
                    <td><Pnl value={h.pnl} percent={h.pnl_pct} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted small pane-pad">
              No open positions. <Link to="/explore">Find something to trade</Link>.
            </p>
          )}
        </Pane>
        <AddFunds onDone={reload} />
      </div>
    </div>
  );
}
