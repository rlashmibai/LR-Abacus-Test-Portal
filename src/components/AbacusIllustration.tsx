// A simple, hand-drawn-style abacus illustration built from plain SVG
// shapes (rects, lines, circles) rather than freehand paths, so it
// renders reliably at any size and picks up the brand/gold theme colors.
export default function AbacusIllustration({
  className = "",
}: {
  className?: string;
}) {
  const rodYs = [58, 92, 126, 160];
  const beadXs = [55, 85, 115, 145, 175, 205];

  return (
    <svg
      viewBox="0 0 260 220"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of an abacus"
    >
      <rect
        x="15"
        y="30"
        width="230"
        height="170"
        rx="20"
        fill="var(--gold-soft)"
        opacity="0.6"
      />
      <rect
        x="15"
        y="30"
        width="230"
        height="170"
        rx="20"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="5"
      />
      <rect x="15" y="30" width="230" height="26" rx="20" fill="var(--brand)" />
      {rodYs.map((y, ri) => (
        <g key={y}>
          <line x1="32" y1={y} x2="228" y2={y} stroke="var(--ink-faint)" strokeWidth="3" />
          {beadXs.map((x, bi) => (
            <circle
              key={x}
              cx={x}
              cy={y}
              r="13"
              fill={(ri + bi) % 3 === 0 ? "var(--gold)" : "var(--brand)"}
              opacity={bi < 2 + (ri % 2) ? 1 : 0.5}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
