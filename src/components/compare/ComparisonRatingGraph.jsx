import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

// Colors for the two users (customize as needed)
const USER_COLORS = [
  "#2563eb", // blue-600
  "#f59e42", // orange-400
];

// Rating band reference lines (optional)
const ratingBands = [
  { rating: 2400, color: "#ffb300" }, // yellow
  { rating: 2100, color: "#ff8c00" }, // orange
  { rating: 1900, color: "#aa00aa" }, // violet
  { rating: 1600, color: "#0000ff" }, // blue
  { rating: 1400, color: "#03a89e" }, // cyan
  { rating: 1200, color: "#008000" }, // green
  { rating: 0, color: "#808080" },    // gray
];

// Base ticks for common rating levels, these are used as candidates
const BASE_RATING_TICKS = [0, 800, 1000, 1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 3500, 4000];

// Helper to merge rating histories by contest date
function mergeHistories(user1History, user2History) {
  const safeUser1History = Array.isArray(user1History) ? user1History : [];
  const safeUser2History = Array.isArray(user2History) ? user2History : [];

  const allDates = [
    ...new Set([
      ...safeUser1History.map((d) => d.ratingUpdateTimeSeconds),
      ...safeUser2History.map((d) => d.ratingUpdateTimeSeconds),
    ]),
  ].sort((a, b) => a - b);

  return allDates.map((ts) => {
    const u1 = safeUser1History.find((d) => d.ratingUpdateTimeSeconds === ts);
    const u2 = safeUser2History.find((d) => d.ratingUpdateTimeSeconds === ts);
    return {
      date: new Date(ts * 1000).toLocaleDateString(),
      user1: u1 ? u1.newRating : null,
      user2: u2 ? u2.newRating : null,
      contest: u1?.contestName || u2?.contestName || "",
    };
  });
}

// Custom Tooltip Component
const CustomRatingGraphTooltip = ({ active, payload, label, userLabels, isDarkMode }) => {
  if (active && payload && payload.length) {
    const tooltipBg = isDarkMode ? "#1f2937" : "#fff";
    const tooltipBorder = isDarkMode ? "#374151" : "#e5e7eb";
    const tooltipTextColor = isDarkMode ? "#e5e7eb" : "#1f2937";

    const contestName = payload[0]?.payload?.contest;

    return (
      <div
        className="rounded p-2 text-sm shadow"
        style={{
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          color: tooltipTextColor,
        }}
      >
        <div className="font-semibold mb-1">
          {contestName ? `${contestName} (${label})` : label} {/* Show contest name + date if available */}
        </div>
        {payload.map((entry, index) => {
          // 'entry.dataKey' will be "user1" or "user2"
          const userName = entry.dataKey === "user1" ? userLabels[0] : userLabels[1];
          const color = entry.dataKey === "user1" ? USER_COLORS[0] : USER_COLORS[1];

          // Only render if the value is not null (i.e., user has data for this point)
          if (entry.value !== null) {
            return (
              <div key={entry.dataKey} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: color }}
                />
                {userName}: <span className="font-bold">{entry.value}</span>
              </div>
            );
          }
          return null; // Don't render if value is null
        })}
      </div>
    );
  }
  return null;
};


export default function ComparisonRatingGraph({ user1, user2, userLabels = ["User 1", "User 2"] }) {
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const axisTickColor = isDarkMode ? "#cbd5e1" : "#6b7280";
  const gridStrokeColor = isDarkMode ? "#4b5563" : "#e5e7eb";

  const hasUser1Data = user1 && user1.length > 0;
  const hasUser2Data = user2 && user2.length > 0;

  if (!hasUser1Data && !hasUser2Data) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No rating history available for either user.</span>
      </div>
    );
  }

  const chartData = mergeHistories(user1, user2);

  const allRatings = [
    ...(hasUser1Data ? user1.map(d => d.newRating) : []),
    ...(hasUser2Data ? user2.map(d => d.newRating) : [])
  ].filter(r => typeof r === "number" && r !== null);

  let minRating = 0;
  let maxRating = 0;

  if (allRatings.length > 0) {
    minRating = Math.min(...allRatings);
    maxRating = Math.max(...allRatings);
  }

  // --- Dynamic Y-axis Domain Calculation ---
  // Define padding for the Y-axis to prevent lines from touching the top/bottom
  const Y_AXIS_PADDING = 200; // e.g., 200 rating points buffer

  // Calculate the lowest relevant rating for the Y-axis start
  // Start from a common minimum (e.g., 800 for Codeforces) or minRating - padding
  const domainMin = Math.max(800, minRating - Y_AXIS_PADDING);

  // Calculate the highest relevant rating for the Y-axis end
  const domainMax = maxRating + Y_AXIS_PADDING;

  // Generate ticks based on the calculated domain and common rating bands
  // Filter BASE_RATING_TICKS to be within a reasonable range of the actual data
  let yAxisTicks = BASE_RATING_TICKS.filter(
    tick => tick >= domainMin - 100 && tick <= domainMax + 100 // Add a little extra buffer for tick filtering
  );

  // Ensure minimum and maximum ratings are included as ticks if they are not already
  // or if there are very few data points resulting in few ticks
  if (!yAxisTicks.includes(minRating)) {
    yAxisTicks.push(minRating);
  }
  if (!yAxisTicks.includes(maxRating)) {
    yAxisTicks.push(maxRating);
  }

  // Ensure there are at least a couple of ticks if the data range is very small
  if (yAxisTicks.length < 2) {
    // Add rounded min and max if needed, or default values
    const roundedMin = Math.floor(minRating / 100) * 100;
    const roundedMax = Math.ceil(maxRating / 100) * 100;
    yAxisTicks = [...new Set([roundedMin, roundedMax, ...yAxisTicks])].sort((a, b) => a - b);
    // If still too few, add default widely spaced ticks
    if (yAxisTicks.length < 2) {
        yAxisTicks = [1200, 1600, 2000, 2400]; // Fallback for very sparse data
    }
  }

  // Sort and remove duplicates from the ticks
  yAxisTicks = [...new Set(yAxisTicks)].sort((a, b) => a - b);
  // --- End Dynamic Y-axis Domain Calculation ---


  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mt-6">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
          <XAxis
            dataKey="date"
            tick={{ fill: axisTickColor, fontSize: 12 }}
            minTickGap={20}
          />
          <YAxis
            // Use the dynamically calculated domain values
            domain={[domainMin, domainMax]}
            tick={{ fill: axisTickColor, fontSize: 12 }}
            width={50}
            ticks={yAxisTicks} // Use the dynamically generated ticks
          />
          {/* Use the CustomRatingGraphTooltip component */}
          <Tooltip
            content={<CustomRatingGraphTooltip userLabels={userLabels} isDarkMode={isDarkMode} />}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px' }}
            formatter={(value, entry, idx) => (
              <span style={{ color: USER_COLORS[idx], fontWeight: "bold" }}>{userLabels[idx]}</span>
            )}
          />
          {ratingBands.map(
            (band) =>
              band.rating >= domainMin && band.rating <= domainMax && ( // Only show reference lines within the current domain
                <ReferenceLine
                  key={band.rating}
                  y={band.rating}
                  stroke={band.color}
                  strokeDasharray="3 3"
                  // ifOverflow="extendDomain" is not strictly needed if domain is set correctly
                  label={{
                    value: band.rating,
                    position: "right",
                    fill: band.color,
                    fontSize: 12,
                  }}
                />
              )
          )}
          {hasUser1Data && (
            <Line
              type="monotone"
              dataKey="user1"
              name={userLabels[0]} // Still good to have this for general tooltip fallback if not custom
              stroke={USER_COLORS[0]}
              strokeWidth={3}
              dot={{
                r: 5,
                stroke: (isDarkMode ? USER_COLORS[0] : "#fff"),
                strokeWidth: 2,
                fill: USER_COLORS[0],
              }}
              activeDot={{
                r: 7,
                stroke: USER_COLORS[0],
                strokeWidth: 2,
                fill: (isDarkMode ? USER_COLORS[0] : "#fff"),
              }}
              connectNulls
            />
          )}
          {hasUser2Data && (
            <Line
              type="monotone"
              dataKey="user2"
              name={userLabels[1]} // Still good to have this
              stroke={USER_COLORS[1]}
              strokeWidth={3}
              dot={{
                r: 5,
                stroke: (isDarkMode ? USER_COLORS[1] : "#fff"),
                strokeWidth: 2,
                fill: USER_COLORS[1],
              }}
              activeDot={{
                r: 7,
                stroke: USER_COLORS[1],
                strokeWidth: 2,
                fill: (isDarkMode ? USER_COLORS[1] : "#fff"),
              }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}