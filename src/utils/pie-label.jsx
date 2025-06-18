// src/utils/pie-label.jsx

const RADIAN = Math.PI / 180;

/**
 * Custom label for Recharts Pie: draws percentage outside the pie slice.
 */
export function renderPiePercentageLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}) {
  const radius = outerRadius + 16; // 16px outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if slice >4%
  if (percent < 0.04) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      fontSize="11"
      fontWeight="bold"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}