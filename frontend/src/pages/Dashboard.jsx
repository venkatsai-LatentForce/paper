import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { ErrorText, Pnl, SourceBadge, Stat } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { money } from "../format.js";
import { PRICE_REFRESH_MS, useApi } from "../hooks.js";

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
      <h2>Add dummy funds</h2>
      <p className="muted small">
        Lifetime deposits are capped at {money(user.max_deposit)}. You've added{" "}
        {money(user.total_deposited)}; {room > 0 ? `${money(room)} more allowed.` : "the cap is reached."}{" "}
        Beyond that, your balance grows only through trading profits.
      </p>
      {room > 0 && (
        <form className="row" onSubmit={submit}>
          <input style={{ maxWidth: 200 }} type="number" min="1" max={room} step="1" placeholder="Amount"
            required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button disabled={busy}>Add</button>
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

  return (
    <div className="stack">
      <div className="spread page-head">
        <div>
          <h1>Hi, {user.name.split(" ")[0]}</h1>
          <p className="muted small">Your practice portfolio at a glance.</p>
        </div>
        <SourceBadge source={d?.price_source} />
      </div>
      <ErrorText>{error}</ErrorText>

      {d && (
        <>
          <div className="grid">
            <Stat label="Portfolio value" hero>{money(d.portfolio_value)}</Stat>
            <Stat label="Available cash">{money(d.cash)}</Stat>
            <Stat label="Invested" hint={`Current value ${money(d.holdings_value)}`}>{money(d.invested)}</Stat>
            <Stat label="Total P&L" hint={`vs ${money(d.total_deposited)} deposited`}>
              <Pnl value={d.total_pnl} percent={d.total_pnl_pct} />
            </Stat>
          </div>
          <div className="grid">
            <Stat label="Unrealised P&L (open positions)"><Pnl value={d.unrealized_pnl} /></Stat>
            <Stat label="Realised P&L (closed trades)"><Pnl value={d.realized_pnl} /></Stat>
          </div>
        </>
      )}

      <div className="card">
        <div className="spread">
          <h2>Top holdings</h2>
          <Link to="/holdings" className="small">View all</Link>
        </div>
        {holdings?.length ? (
          holdings
            .slice()
            .sort((a, b) => b.current_value - a.current_value)
            .slice(0, 5)
            .map((h) => (
              <div className="kv" key={`${h.exchange}:${h.symbol}`}>
                <Link to={`/trade/${h.exchange}/${h.symbol}`} className="sym">{h.symbol}</Link>
                <Pnl value={h.pnl} percent={h.pnl_pct} />
              </div>
            ))
        ) : (
          <p className="muted small">
            No positions yet. <Link to="/explore">Find something to trade</Link>.
          </p>
        )}
      </div>

      <AddFunds onDone={reload} />
    </div>
  );
}
