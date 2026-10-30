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
        aside={data?.length > 0 && (
          <span className="readout"><span className="label">Realised so far</span><Pnl value={realized} /></span>
        )}>
        Every executed order and what it made or lost. Sells show realised P&amp;L; buys show P&amp;L against today's price.
      </PageHead>
      <ErrorText>{error}</ErrorText>

      {loading ? <TableSkeleton /> : !data?.length ? (
        <Empty>
          <p>No orders yet.</p>
          <Link to="/explore" className="btn primary">Place your first trade</Link>
        </Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Executed orders</caption>
            <thead>
              <tr>
                <th scope="col">Instrument</th><th scope="col">Time</th><th scope="col">Side</th><th scope="col">Qty</th>
                <th scope="col">Price</th><th scope="col">Value</th><th scope="col">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/trade/${o.exchange}/${encodeURIComponent(o.symbol)}`} className="sym">{o.symbol}</Link>{" "}
                    <TypeTag type={o.instrument_type} />
                  </td>
                  <td className="num muted">{dateTime(o.created_at)}</td>
                  <td><span className={`side side-${o.side}`}>{o.side === "BUY" ? "Buy" : "Sell"}</span></td>
                  <td className="num">{o.quantity}</td>
                  <td className="num">{money(o.price)}</td>
                  <td className="num">{money(o.value)}</td>
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
