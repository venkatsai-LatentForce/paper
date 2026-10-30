import { pct, signedMoney, tone, TYPE_LABEL } from "../format.js";

export function Pnl({ value, percent }) {
  return (
    <span className={`num pnl ${tone(value)}`}>
      {signedMoney(value)}
      {percent !== undefined && <span className="pnl-pct"> {pct(percent)}</span>}
    </span>
  );
}

// One cell of a ruled stat strip (`.strip`). Cells share rules, not boxes.
export function Stat({ label, children, hint }) {
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <div className="stat-value">{children}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

// A terminal pane: a thin header bar (label + meta) over flat content.
export function Pane({ title, meta, children, className = "", as: Tag = "section", ...rest }) {
  return (
    <Tag className={`pane ${className}`} {...rest}>
      {(title || meta) && (
        <header className="pane-head">
          {title && <h2 className="label">{title}</h2>}
          {meta && <div className="pane-meta">{meta}</div>}
        </header>
      )}
      <div className="pane-body">{children}</div>
    </Tag>
  );
}

export function PageHead({ eyebrow, title, children, aside }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="label">{eyebrow}</span>}
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {aside && <div className="page-head-aside">{aside}</div>}
    </div>
  );
}

export function TypeTag({ type }) {
  return <span className={`tag tag-${type}`}>{TYPE_LABEL[type] ?? type}</span>;
}

export function SourceBadge({ source }) {
  if (!source) return null;
  const live = source === "kite";
  return (
    <span className={`status${live ? " status-live" : ""}`} title={live ? "Live prices from Kite" : "Simulated prices"}>
      <i aria-hidden="true" />{live ? "Live · Kite" : "Simulated prices"}
    </span>
  );
}

export const Kbd = ({ children }) => <kbd>{children}</kbd>;

export function Skeleton({ height = 16, width = "100%", style }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="pane skeleton-pane" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} height={20} />)}
    </div>
  );
}

export const ErrorText = ({ children }) => (children ? <p className="error" role="alert">{children}</p> : null);

export const Empty = ({ children }) => <div className="pane empty">{children}</div>;
