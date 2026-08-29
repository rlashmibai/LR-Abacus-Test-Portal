interface TrendPoint {
  label: string;
  value: number;
}

/** A small, single-series line chart. Deliberately not a shared-axis /
 * dual-axis chart - each metric gets its own TrendChart instance. */
export default function TrendChart({
  data,
  color,
  valueFormat,
  height = 200,
}: {
  data: TrendPoint[];
  color: string;
  valueFormat: (v: number) => string;
  height?: number;
}) {
  if (data.length === 0) return null;

  const width = 600;
  const padX = 28;
  const padY = 20;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? width / 2
        : padX + (i / (data.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (d.value - min) / range) * (height - padY * 2);
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const last = points[points.length - 1];

  // Show at most 6 x-axis labels so dense histories don't collide.
  const labelStep = Math.max(1, Math.ceil(points.length / 6));

  return (
    <svg
      viewBox={`0 0 ${width} ${height + 24}`}
      className="w-full"
      role="img"
      aria-label="Trend chart"
    >
      {/* recessive baseline */}
      <line
        x1={padX}
        y1={height - padY}
        x2={width - padX}
        y2={height - padY}
        stroke="var(--line)"
        strokeWidth={1}
      />

      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color}>
            <title>{`${p.label}: ${valueFormat(p.value)}`}</title>
          </circle>
          {/* value directly above every point, not just the last one */}
          <text
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--ink)"
          >
            {valueFormat(p.value)}
          </text>
          {i % labelStep === 0 && (
            <text
              x={p.x}
              y={height + 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--ink-faint)"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
