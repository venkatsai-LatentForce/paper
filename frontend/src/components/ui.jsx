import { pct, signedMoney, tone, TYPE_LABEL } from "../format.js";

export function Pnl({ value, percent }) {
  return (
    <span className={tone(value)}>
      {signedMoney(value)}
      {percent !== undefined && <span className="small"> ({pct(percent)})</span>}
    </span>
  );
}

export function Stat({ label, children, hint }) {
  return (
    <div className="card stat">
      <div className="muted small">{label}</div>
      <div className="stat-value">{children}</div>
      {hint && <div className="muted small">{hint}</div>}
    </div>
  );
}

export function TypeTag({ type }) {
  return <span className={`tag tag-${type}`}>{TYPE_LABEL[type] ?? type}</span>;
}

export function SourceBadge({ source }) {
  if (!source) return null;
  return (
    <span className="tag" title={source === "kite" ? "Live prices from Kite" : "Simulated prices"}>
      {source === "kite" ? "Live · Kite" : "Simulated prices"}
    </span>
  );
}

export const ErrorText = ({ children }) => (children ? <p className="error">{children}</p> : null);

export const Empty = ({ children }) => <div className="card empty muted">{children}</div>;
