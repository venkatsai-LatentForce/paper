// Logo: a lime growth arrow rising inside the purple tile. Same artwork as public/favicon.svg.
export default function BrandMark({ size = 28 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#6C3FA0" />
      <path d="M7 22.5 L13 16.5 L17 20 L24.5 11.5" fill="none" stroke="#B7F34A" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 10.5 H25.5 V17.5" fill="none" stroke="#B7F34A" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
