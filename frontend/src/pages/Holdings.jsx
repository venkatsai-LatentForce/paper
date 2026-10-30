import { Link, useNavigate } from "react-router-dom";
import { Empty, ErrorText, Pnl, SourceBadge, TypeTag } from "../components/ui.jsx";
import { money } from "../format.js";
import { PRICE_REFRESH_MS, useApi } from "../hooks.js";

export default function Holdings() {
  const navigate = useNavigate();
  const { data, error, loading } = useApi("/holdings", PRICE_REFRESH_MS);
  const { data: summary } = useApi("/dashboard", PRICE_REFRESH_MS);

  const invested = data?.reduce((s, h) => s + h.invested, 0) ?? 0;
  const pnl = data?.reduce((s, h) => s + h.pnl, 0) ?? 0;

  return (
    <div className="stack">
      <div className="spread page-head">
        <div>
          <h1>Holdings</h1>
          {data?.length > 0 && (
            <p className="muted small">
              Invested {money(invested)} · Open P&L <Pnl value={pnl} percent={invested ? (pnl / invested) * 100 : 0} />
            </p>
          )}
        </div>
        <SourceBadge source={summary?.price_source} />
      </div>
      <ErrorText>{error}</ErrorText>

      {loading ? null : !data?.length ? (
        <Empty>
          You don't hold anything yet. <Link to="/explore">Explore instruments</Link> to place your first trade.
        </Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Instrument</th><th>Qty</th><th>Avg price</th><th>LTP</th>
                <th>Invested</th><th>Current</th><th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.map((h) => (
                <tr key={`${h.exchange}:${h.symbol}`} className="clickable"
                  onClick={() => navigate(`/trade/${h.exchange}/${encodeURIComponent(h.symbol)}`)}>
                  <td>
                    <div className="sym">{h.symbol} <TypeTag type={h.instrument_type} /></div>
                    <div className="muted small">{h.name}</div>
                  </td>
                  <td>{h.quantity}</td>
                  <td>{money(h.avg_price)}</td>
                  <td>{money(h.ltp)}</td>
                  <td>{money(h.invested)}</td>
                  <td>{money(h.current_value)}</td>
                  <td><Pnl value={h.pnl} percent={h.pnl_pct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.some((h) => h.instrument_type === "FUT") && (
        <p className="muted small">Futures show the margin blocked (15% of contract value) as invested.</p>
      )}
    </div>
  );
}
