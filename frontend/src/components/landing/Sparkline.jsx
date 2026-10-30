import { useId } from "react";

const W = 320;
const H = 80;

// Area chart of recent prices. `entry` draws a dashed line at the buy price.
export default function Sparkline({ points, entry, height = H, tone = "brand" }) {
  const id = useId().replace(/:/g, "");
  const values = entry ? [...points, entry] : points;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i) => (i / (points.length - 1)) * W;
  const y = (v) => H - 6 - ((v - min) / span) * (H - 14);

  const line = points.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div className={`spark spark-${tone}`} style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#g${id})`} />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {entry && (
          <line x1="0" x2={W} y1={y(entry)} y2={y(entry)} className="spark-entry"
            strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <span className="spark-dot" style={{ top: `${(y(last) / H) * 100}%` }} />
      {entry && <span className="spark-label" style={{ top: `${(y(entry) / H) * 100}%` }}>Bought</span>}
    </div>
  );
}
