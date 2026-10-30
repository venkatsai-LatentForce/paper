import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const tradeUrl = (q) => `/trade/${q.exchange}/${encodeURIComponent(q.symbol)}`;

function QuoteTable({ rows, caption }) {
  const navigate = useNavigate();
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr><th scope="col">Instrument</th><th scope="col">Type</th><th scope="col">Lot</th><th scope="col">Price</th><th scope="col">Day change</th></tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={`${q.exchange}:${q.symbol}`} className="clickable" onClick={() => navigate(tradeUrl(q))}>
              <td>
                <Link to={tradeUrl(q)} className="sym" onClick={(e) => e.stopPropagation()}>{q.symbol}</Link>
                <div className="sub">{q.name}</div>
              </td>
              <td><TypeTag type={q.instrument_type} /></td>
              <td className="num">{q.lot_size}</td>
              <td className="num">{money(q.ltp)}</td>
              <td className={`num ${tone(q.change)}`}>{pct(q.change_pct)}</td>
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

      <div className="search">
        <span className="search-prompt" aria-hidden="true">›</span>
        <input id="instrument-search" autoFocus type="search" aria-label="Search instruments"
          placeholder="Search by symbol or company name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <kbd aria-hidden="true">/</kbd>
      </div>

      {q ? (
        <>
          <div className="segmented" role="group" aria-label="Instrument type">
            {FILTERS.map(([key, label]) => (
              <button key={key} type="button" className={filter === key ? "on" : ""} aria-pressed={filter === key}
                onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>
          <ErrorText>{search.error}</ErrorText>
          {search.loading ? (
            <TableSkeleton rows={4} />
          ) : rows.length ? (
            <QuoteTable rows={rows} caption={`Results for ${q}`} />
          ) : (
            <p className="muted small">No instruments match “{q}”. Check the symbol, or try the company name.</p>
          )}
        </>
      ) : (
        <>
          <h2 className="section-label">Popular stocks</h2>
          <ErrorText>{popular.error}</ErrorText>
          {popular.data ? <QuoteTable rows={popular.data} caption="Popular stocks" /> : !popular.error && <TableSkeleton rows={6} />}
        </>
      )}
    </div>
  );
}
