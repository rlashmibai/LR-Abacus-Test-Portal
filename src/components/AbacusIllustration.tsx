// A friendly, kid-appealing abacus illustration built from plain SVG
// shapes (rects, lines, circles, ellipses) rather than freehand paths,
// so it renders crisply at any size without external image assets.
const BEAD_COLORS = [
  "#b5842c", // gold
  "#3d3a7a", // brand indigo
  "#c0554a", // warm rose
  "#2f7a5c", // green
  "#3f7fb0", // sky blue
];

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
      aria-label="Illustration of a colorful toy abacus"
    >
      <defs>
        <linearGradient id="abacus-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#caa15a" />
          <stop offset="100%" stopColor="#8a5a2b" />
        </linearGradient>
      </defs>

      {/* frame */}
      <rect x="12" y="26" width="236" height="178" rx="22" fill="var(--gold-soft)" opacity="0.7" />
      <rect
        x="12"
        y="26"
        width="236"
        height="178"
        rx="22"
        fill="none"
        stroke="url(#abacus-frame)"
        strokeWidth="7"
      />
      <rect x="12" y="26" width="236" height="28" rx="22" fill="url(#abacus-frame)" />

      {rodYs.map((y, ri) => (
        <g key={y}>
          <line x1="30" y1={y} x2="230" y2={y} stroke="var(--ink-faint)" strokeWidth="3" />
          {beadXs.map((x, bi) => {
            const color = BEAD_COLORS[(ri + bi) % BEAD_COLORS.length];
            const counted = bi < 2 + (ri % 2);
            return (
              <g key={x} opacity={counted ? 1 : 0.55}>
                <circle cx={x} cy={y} r="13" fill={color} />
                <ellipse cx={x - 4} cy={y - 5} rx="4.5" ry="3" fill="white" opacity="0.55" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
