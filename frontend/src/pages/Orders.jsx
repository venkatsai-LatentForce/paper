import { Link } from "react-router-dom";
import { Empty, ErrorText, Pnl, TypeTag } from "../components/ui.jsx";
import { dateTime, money } from "../format.js";
import { PRICE_REFRESH_MS, useApi } from "../hooks.js";

export default function Orders() {
  const { data, error, loading } = useApi("/orders", PRICE_REFRESH_MS);
  const realized = data?.filter((o) => o.pnl_type === "realized").reduce((s, o) => s + o.pnl, 0) ?? 0;

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Orders</h1>
        <p className="muted small">
          Every executed order with its P&L. Sells show realised P&L; buys show P&L against the current price.
          {data?.length > 0 && <> Realised so far: <Pnl value={realized} /></>}
        </p>
      </div>
      <ErrorText>{error}</ErrorText>

      {loading ? null : !data?.length ? (
        <Empty>No orders yet. <Link to="/explore">Place your first trade</Link>.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Instrument</th><th>Time</th><th>Side</th><th>Qty</th>
                <th>Price</th><th>Value</th><th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/trade/${o.exchange}/${encodeURIComponent(o.symbol)}`} className="sym">{o.symbol}</Link>{" "}
                    <TypeTag type={o.instrument_type} />
                  </td>
                  <td className="muted">{dateTime(o.created_at)}</td>
                  <td className={`side-${o.side}`}>{o.side}</td>
                  <td>{o.quantity}</td>
                  <td>{money(o.price)}</td>
                  <td>{money(o.value)}</td>
                  <td>
                    <Pnl value={o.pnl} />
                    <div className="muted small">{o.pnl_type === "realized" ? "realised" : "vs now"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
