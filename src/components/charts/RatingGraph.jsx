import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const ratingColors = [
  { rating: 4000, color: "#ff0000" }, // Red
  { rating: 3000, color: "#ff0000" }, // Red
  { rating: 2400, color: "#ff0000" }, // Red
  { rating: 2300, color: "#ff8c00" }, // Orange
  { rating: 2100, color: "#ff8c00" }, // Orange
  { rating: 1900, color: "#aa00aa" }, // Violet
  { rating: 1600, color: "#0000ff" }, // Blue
  { rating: 1400, color: "#03a89e" }, // Cyan
  { rating: 1200, color: "#008000" }, // Green
  { rating: 0, color: "#808080" }, // Gray
];

function getRatingColor(rating) {
  for (const band of ratingColors) {
    if (rating >= band.rating) return band.color;
  }
  return "#808080";
}

export default function RatingGraph({ data }) {
  if (!data || !data.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No rating history available.</span>
      </div>
    );
  }

  const chartData = data
    .filter(
      (d, i, arr) =>
        typeof d.newRating === "number" &&
        !isNaN(d.newRating) &&
        (i === 0 || d.ratingUpdateTimeSeconds > arr[i - 1].ratingUpdateTimeSeconds)
    )
    .map((d, i) => ({
      ...d,
      contest: d.contestName,
      time: new Date(d.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
      rating: d.newRating,
      index: i + 1,
    }));

  // A line chart requires at least two points to draw a line
  if (chartData.length < 2) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">Not enough data to draw a graph.</span>
      </div>
    );
  }

  // Calculate min and max ratings from chartData
  const minRating = Math.min(...chartData.map((d) => d.rating));
  const maxRating = Math.max(...chartData.map((d) => d.rating));

  // Dynamically determine Y-axis ticks
  const yAxisTicks = ratingColors
    .filter((band) => band.rating >= minRating - 200 && band.rating <= maxRating + 200) // Add some buffer
    .map((band) => band.rating)
    .sort((a, b) => a - b); // Ensure ticks are in ascending order

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mt-6">
      {/* <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
        Rating Changes Over Time
      </h2> */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="index"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(tick) => `Contest ${tick}`}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            minTickGap={15}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            width={50}
            ticks={yAxisTicks} // Apply the dynamically generated ticks
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            labelFormatter={(label, payload) => {
              const contestName = payload?.[0]?.payload?.contest;
              return contestName ? `Contest ${label}: ${contestName}` : `Contest ${label}`;
            }}
            formatter={(value, name, props) => {
              if (name === "rating") {
                const color = getRatingColor(value);
                return [<span style={{ color: color, fontWeight: "bold" }}>{value}</span>, "Rating"];
              }
              return [value, name];
            }}
          />
          {ratingColors.map(
            (band) =>
              band.rating > 0 && (
                <ReferenceLine
                  key={band.rating}
                  y={band.rating}
                  stroke={band.color}
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                  label={{
                    value: band.rating,
                    position: "right",
                    fill: band.color,
                    fontSize: 12,
                  }}
                />
              )
          )}
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#2563eb"
            strokeWidth={3}
            dot={({ cx, cy, payload, index }) => (
                <circle
                key={`dot-${payload.ratingUpdateTimeSeconds}-${index}`}
                cx={cx}
                cy={cy}
                r={5}
                stroke="#fff"
                strokeWidth={2}
                fill={getRatingColor(payload.rating)}
                />
            )}
            activeDot={{
                r: 7,
                stroke: "#2563eb",
                strokeWidth: 2,
                fill: "#fff",
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
            connectNulls={true}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}