import { Link } from "react-router-dom";
import { Empty, ErrorText, PageHead, Pnl, TableSkeleton, TypeTag } from "../components/ui.jsx";
import { dateTime, money } from "../format.js";
import { PRICE_REFRESH_MS, useApi } from "../hooks.js";

export default function Orders() {
  const { data, error, loading } = useApi("/orders", PRICE_REFRESH_MS);
  const realized = data?.filter((o) => o.pnl_type === "realized").reduce((s, o) => s + o.pnl, 0) ?? 0;

  return (
    <div className="stack">
      <PageHead eyebrow="History" title="Orders"
        aside={data?.length > 0 && <span className="small muted">Realised so far <Pnl value={realized} /></span>}>
        Every executed order and what it made or lost. Sells show realised P&amp;L; buys show P&amp;L against today's price.
      </PageHead>
      <ErrorText>{error}</ErrorText>

      {loading ? <TableSkeleton /> : !data?.length ? (
        <Empty>
          <p>No orders yet.</p>
          <Link to="/explore"><button className="primary">Place your first trade</button></Link>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Instrument</th><th>Time</th><th>Side</th><th>Qty</th>
                <th>Price</th><th>Value</th><th>P&amp;L</th>
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
                  <td className={`side-${o.side}`}>{o.side === "BUY" ? "Buy" : "Sell"}</td>
                  <td>{o.quantity}</td>
                  <td>{money(o.price)}</td>
                  <td>{money(o.value)}</td>
                  <td>
                    <Pnl value={o.pnl} />
                    <div className="sub">{o.pnl_type === "realized" ? "Realised" : "vs current price"}</div>
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
