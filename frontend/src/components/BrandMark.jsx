// Logo: a line-drawn growth arrow, no tile. Colour comes from `currentColor`,
// so each surface sets it (tan on espresso). Same artwork as public/favicon.svg.
export default function BrandMark({ size = 22 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor"
      strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 24 L11 15.5 L17 20.5 L28 8" />
      <path d="M20 8 H28 V16" />
    </svg>
  );
}
