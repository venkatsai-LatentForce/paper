import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorText, PageHead, TableSkeleton, TypeTag } from "../components/ui.jsx";
import { money, pct, tone } from "../format.js";
import { useApi } from "../hooks.js";

const FILTERS = [
  ["ALL", "All"],
  ["EQ", "Stocks"],
  ["FUT", "Futures"],
  ["OPT", "Options"],
];

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function QuoteTable({ rows }) {
  const navigate = useNavigate();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Instrument</th><th>Type</th><th>Lot</th><th>Price</th><th>Day change</th></tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={`${q.exchange}:${q.symbol}`} className="clickable"
              onClick={() => navigate(`/trade/${q.exchange}/${encodeURIComponent(q.symbol)}`)}>
              <td>
                <div className="sym">{q.symbol}</div>
                <div className="sub">{q.name}</div>
              </td>
              <td><TypeTag type={q.instrument_type} /></td>
              <td>{q.lot_size}</td>
              <td>{money(q.ltp)}</td>
              <td className={tone(q.change)} style={{ fontWeight: 600 }}>{pct(q.change_pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Explore() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const q = useDebounced(query.trim());

  const search = useApi(q ? `/market/search?q=${encodeURIComponent(q)}&limit=50` : null);
  const popular = useApi("/market/popular");

  const rows = (search.data ?? []).filter((r) =>
    filter === "ALL" ? true : filter === "OPT" ? ["CE", "PE"].includes(r.instrument_type) : r.instrument_type === filter
  );

  return (
    <div className="stack">
      <PageHead eyebrow="Markets" title="Explore">
        Search stocks, futures and options. Try “RELIANCE”, “NIFTY” or “BANKNIFTY FUT”.
      </PageHead>

      <input autoFocus type="search" aria-label="Search instruments" placeholder="Search by symbol or company name"
        value={query} onChange={(e) => setQuery(e.target.value)} style={{ height: 52, fontSize: "var(--fs-md)" }} />

      {q ? (
        <>
          <div className="segmented">
            {FILTERS.map(([key, label]) => (
              <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>
          <ErrorText>{search.error}</ErrorText>
          {search.loading ? (
            <TableSkeleton rows={4} />
          ) : rows.length ? (
            <QuoteTable rows={rows} />
          ) : (
            <p className="muted small">No instruments match “{q}”. Check the symbol, or try the company name.</p>
          )}
        </>
      ) : (
        <>
          <h2 style={{ marginTop: "var(--s-6)" }}>Popular stocks</h2>
          <ErrorText>{popular.error}</ErrorText>
          {popular.data ? <QuoteTable rows={popular.data} /> : !popular.error && <TableSkeleton rows={6} />}
        </>
      )}
    </div>
  );
}
