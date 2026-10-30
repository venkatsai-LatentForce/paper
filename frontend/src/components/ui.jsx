import { pct, signedMoney, tone, TYPE_LABEL } from "../format.js";

export function Pnl({ value, percent }) {
  return (
    <span className={`num ${tone(value)}`} style={{ fontWeight: 700 }}>
      {signedMoney(value)}
      {percent !== undefined && <span className="small" style={{ fontWeight: 600 }}> ({pct(percent)})</span>}
    </span>
  );
}

export function Stat({ label, children, hint }) {
  return (
    <div className="card">
      <span className="eyebrow">{label}</span>
      <div className="stat-value">{children}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export function PageHead({ eyebrow, title, children, aside }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {aside}
    </div>
  );
}

export function TypeTag({ type }) {
  return <span className={`tag tag-${type}`}>{TYPE_LABEL[type] ?? type}</span>;
}

export function SourceBadge({ source }) {
  if (!source) return null;
  return (
    <span className={`tag${source === "kite" ? " tag-live" : ""}`}
      title={source === "kite" ? "Live prices from Kite" : "Simulated prices"}>
      {source === "kite" ? "Live · Kite" : "Simulated prices"}
    </span>
  );
}

export function Skeleton({ height = 16, width = "100%", style }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card stack" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} height={28} />)}
    </div>
  );
}

export const ErrorText = ({ children }) => (children ? <p className="error">{children}</p> : null);

export const Empty = ({ children }) => <div className="card empty muted">{children}</div>;
