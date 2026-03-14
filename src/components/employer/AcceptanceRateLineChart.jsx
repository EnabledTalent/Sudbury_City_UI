/**
 * Line chart for acceptance rate metrics.
 * Plots acceptanceRateSeries (actual) and projectedAcceptanceRateSeries (projected).
 */
export default function AcceptanceRateLineChart({
  acceptanceRateSeries = [],
  projectedAcceptanceRateSeries = [],
  windowDays,
  width = 600,
  height = 220,
}) {
  const padding = { top: 20, right: 20, bottom: 36, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Merge all unique dates and build combined data
  const dateSet = new Set();
  (acceptanceRateSeries || []).forEach((d) => dateSet.add(d.date));
  (projectedAcceptanceRateSeries || []).forEach((d) => dateSet.add(d.date));
  const sortedDates = [...dateSet].sort();

  const byDate = (arr) => {
    const map = {};
    (arr || []).forEach((d) => { map[d.date] = d.acceptanceRatePct ?? 0; });
    return map;
  };
  const actualMap = byDate(acceptanceRateSeries);
  const projectedMap = byDate(projectedAcceptanceRateSeries);

  const points = sortedDates.map((date) => ({
    date,
    actual: actualMap[date] ?? null,
    projected: projectedMap[date] ?? null,
  }));

  if (points.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: `${height}px`,
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        No data to display
      </div>
    );
  }

  const yMin = 0;
  const yMax = 100;
  const xScale = (i) => padding.left + (i / Math.max(1, points.length - 1)) * chartWidth;
  const yScale = (v) => padding.top + chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight;

  const toPath = (getVal) => {
    const coords = points
      .map((p, i) => {
        const v = getVal(p);
        if (v == null) return null;
        return `${xScale(i)},${yScale(v)}`;
      })
      .filter(Boolean);
    if (coords.length < 2) return "";
    return `M ${coords.join(" L ")}`;
  };

  const actualPath = toPath((p) => p.actual);
  const projectedPath = toPath((p) => p.projected);

  // X-axis labels: show first, middle, last (or every Nth)
  const labelStep = Math.max(1, Math.floor(points.length / 5));
  const xLabels = points
    .filter((_, i) => i === 0 || i === points.length - 1 || i % labelStep === 0)
    .map((p, idx, arr) => ({ date: p.date, i: points.indexOf(p) }));

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", maxHeight: `${height}px` }}
        role="img"
        aria-label="Acceptance rate line chart"
      >
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <line
            key={v}
            x1={padding.left}
            y1={yScale(v)}
            x2={width - padding.right}
            y2={yScale(v)}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 50, 100].map((v) => (
          <text
            key={v}
            x={padding.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fill="#6b7280"
          >
            {v}%
          </text>
        ))}

        {/* Actual line */}
        {actualPath && (
          <path
            d={actualPath}
            fill="none"
            stroke="#2d6a5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Projected line (dashed) */}
        {projectedPath && (
          <path
            d={projectedPath}
            fill="none"
            stroke="#c8a45c"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* X-axis labels */}
        {xLabels.map(({ date, i }) => (
          <text
            key={date}
            x={xScale(i)}
            y={height - padding.bottom + 8}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {formatDate(date)}
          </text>
        ))}
      </svg>

      {/* Legend for the two lines */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "8px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
          <svg width="28" height="8" style={{ overflow: "visible" }}>
            <line x1="0" y1="4" x2="28" y2="4" stroke="#2d6a5e" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Actual</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
          <svg width="28" height="8" style={{ overflow: "visible" }}>
            <line x1="0" y1="4" x2="28" y2="4" stroke="#c8a45c" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
          </svg>
          <span>Projected</span>
        </div>
      </div>

      {windowDays && (
        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px", textAlign: "center" }}>
          Window: {windowDays} days
        </div>
      )}
    </div>
  );
}
