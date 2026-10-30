import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { ErrorText, PageHead, Pnl, Skeleton, SourceBadge, Stat } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { money, pct, signedMoney } from "../format.js";
import { PRICE_REFRESH_MS, useApi, useTween } from "../hooks.js";

function PortfolioCard({ d }) {
  const value = useTween(d.portfolio_value);
  const chip = d.total_pnl > 0 ? "chip-up" : d.total_pnl < 0 ? "chip-down" : "chip-flat";
  return (
    <section className="portfolio-card" aria-label="Portfolio summary">
      <div>
        <span className="eyebrow">Portfolio value</span>
        <div className="big">{money(value)}</div>
        <span className={`chip ${chip}`}>
          {signedMoney(d.total_pnl)} · {pct(d.total_pnl_pct)}
        </span>
        <span className="muted small" style={{ marginLeft: "var(--s-3)" }}>
          on {money(d.total_deposited)} deposited
        </span>
      </div>
      <div className="split">
        <div><span className="eyebrow">Cash</span><span className="num">{money(d.cash)}</span></div>
        <div><span className="eyebrow">Invested</span><span className="num">{money(d.invested)}</span></div>
      </div>
    </section>
  );
}

function AddFunds({ onDone }) {
  const { user, setUser } = useAuth();
  const room = Math.max(user.max_deposit - user.total_deposited, 0);
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
    <div className="card">
      <div className="card-head">
        <h2>Add practice funds</h2>
        <span className="muted small num">{money(room)} left to add</span>
      </div>
      <p className="muted small" style={{ marginBottom: "var(--s-4)", maxWidth: "62ch" }}>
        Deposits are capped at {money(user.max_deposit)} for the life of the account. Past that,
        your balance grows only through trading profits.
      </p>
      {room > 0 && (
        <form className="row" onSubmit={submit}>
          <input style={{ maxWidth: 220 }} type="number" min="1" max={room} step="1" placeholder="Amount in ₹"
            aria-label="Amount to add" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button disabled={busy}>{busy ? "Adding…" : "Add funds"}</button>
        </form>
      )}
      <ErrorText>{error}</ErrorText>
    </div>
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

      {d ? (
        <div className="stack">
          <PortfolioCard d={d} />
          <div className="grid">
            <Stat label="Open positions P&L" hint="Unrealised, at current prices"><Pnl value={d.unrealized_pnl} /></Stat>
            <Stat label="Closed trades P&L" hint="Realised from everything you've sold"><Pnl value={d.realized_pnl} /></Stat>
            <Stat label="Holdings value" hint={`${holdings?.length ?? 0} open positions`}>
              <span className="num">{money(d.holdings_value)}</span>
            </Stat>
          </div>
        </div>
      ) : !error && (
        <div className="stack">
          <Skeleton height={190} style={{ borderRadius: "var(--radius-lg)" }} />
          <div className="grid"><Skeleton height={112} /><Skeleton height={112} /><Skeleton height={112} /></div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>Top holdings</h2>
          <Link to="/holdings" className="small">View all</Link>
        </div>
        {top.length ? (
          top.map((h) => (
            <div className="kv" key={`${h.exchange}:${h.symbol}`}>
              <Link to={`/trade/${h.exchange}/${encodeURIComponent(h.symbol)}`} className="sym">{h.symbol}</Link>
              <Pnl value={h.pnl} percent={h.pnl_pct} />
            </div>
          ))
        ) : (
          <p className="muted small">
            No open positions. <Link to="/explore">Find something to trade</Link>.
          </p>
        )}
      </div>

      <AddFunds onDone={reload} />
    </div>
  );
}
