import { Link, useNavigate } from "react-router-dom";
import { Empty, ErrorText, PageHead, Pnl, SourceBadge, TableSkeleton, TypeTag } from "../components/ui.jsx";
import { money } from "../format.js";
import { PRICE_REFRESH_MS, useApi } from "../hooks.js";

const tradeUrl = (h) => `/trade/${h.exchange}/${encodeURIComponent(h.symbol)}`;

export default function Holdings() {
  const navigate = useNavigate();
  const { data, error, loading } = useApi("/holdings", PRICE_REFRESH_MS);
  const { data: summary } = useApi("/dashboard", PRICE_REFRESH_MS);

  const invested = data?.reduce((s, h) => s + h.invested, 0) ?? 0;
  const current = data?.reduce((s, h) => s + h.current_value, 0) ?? 0;
  const pnl = data?.reduce((s, h) => s + h.pnl, 0) ?? 0;

  return (
    <div className="stack">
      <PageHead eyebrow="Portfolio" title="Holdings" aside={<SourceBadge source={summary?.price_source} />} />
      <ErrorText>{error}</ErrorText>

      {loading ? <TableSkeleton /> : !data?.length ? (
        <Empty>
          <p>You don't hold anything yet.</p>
          <Link to="/explore" className="btn primary">Explore instruments</Link>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Your holdings</caption>
            <thead>
              <tr>
                <th scope="col">Instrument</th><th scope="col">Qty</th><th scope="col">Avg price</th><th scope="col">LTP</th>
                <th scope="col">Invested</th><th scope="col">Current</th><th scope="col">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {data.map((h) => (
                <tr key={`${h.exchange}:${h.symbol}`} className="clickable" onClick={() => navigate(tradeUrl(h))}>
                  <td>
                    <Link to={tradeUrl(h)} className="sym" onClick={(e) => e.stopPropagation()}>{h.symbol}</Link>{" "}
                    <TypeTag type={h.instrument_type} />
                    <div className="sub">{h.name}</div>
                  </td>
                  <td className="num">{h.quantity}</td>
                  <td className="num">{money(h.avg_price)}</td>
                  <td className="num">{money(h.ltp)}</td>
                  <td className="num">{money(h.invested)}</td>
                  <td className="num">{money(h.current_value)}</td>
                  <td><Pnl value={h.pnl} percent={h.pnl_pct} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th><td /><td /><td />
                <td className="num">{money(invested)}</td>
                <td className="num">{money(current)}</td>
                <td><Pnl value={pnl} percent={invested ? (pnl / invested) * 100 : 0} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {data?.some((h) => h.instrument_type === "FUT") && (
        <p className="muted small">For futures, “Invested” is the margin blocked: 15% of the contract value.</p>
      )}
    </div>
  );
}
