import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

const BAR_COLORS = ["#2563eb", "#f59e42"]; // blue, orange

// Refined CustomTooltip to correctly display user labels for each bar
// It now accepts 'userLabels' and 'metricName' as props
const CustomTooltip = ({ active, payload, label, unit, userLabels, metricName }) => { // Added metricName prop
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tooltipBg = isDarkMode ? "#1f2937" : "#fff";
  const tooltipBorder = isDarkMode ? "#374151" : "#e5e7eb";
  const tooltipTextColor = isDarkMode ? "#e5e7eb" : "#1f2937";

  if (active && payload && payload.length >= 1) {
    // Recharts Tooltip's 'label' prop for a vertical BarChart is the YAxis dataKey (e.g., "harshroy", "Ryuk24").
    // We want the main title of the tooltip to be the 'metricName' (e.g., "Problems Solved").

    // The 'payload' array contains one entry per data series (bar).
    // In our case, payload[0] corresponds to userLabels[0] and BAR_COLORS[0]
    // payload[1] corresponds to userLabels[1] and BAR_COLORS[1]
    
    // We sort the payload to ensure a consistent order if Recharts ever changes it,
    // though typically it maintains the order of series in the <BarChart>.
    const sortedPayload = [...payload].sort((a, b) => {
      // Find the index of the user label corresponding to this payload entry
      // This ensures we match the correct userLabel and BAR_COLOR to the payload entry
      const userAIndex = userLabels.indexOf(a.payload.user);
      const userBIndex = userLabels.indexOf(b.payload.user);
      return userAIndex - userBIndex;
    });

    return (
      <div
        className="rounded p-2 text-sm shadow"
        style={{
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          color: tooltipTextColor
        }}
      >
        {/* Display the actual metric name as the tooltip title */}
        <div className="font-semibold mb-1">{metricName}</div> 
        
        {sortedPayload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: BAR_COLORS[idx] }} // Use idx directly with BAR_COLORS
            />
            {/* Display the correct user handle and their value */}
            <span className="font-medium">
              {userLabels[idx]}: {/* Use userLabels[idx] directly for the handle */}
            </span>
            <span className="font-bold">{entry.value} {unit}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Props:
 * - metric: string (e.g., "Current Rating") - This is the title of the chart and passed to tooltip
 * - userLabels: [user1handle, user2handle] - Array of string handles
 * - values: [user1Value, user2Value] - Array of numerical values
 * - unit: string (optional) - Unit for the value (e.g., "ms", "%")
 */
export default function ComparisonBars({ metric, userLabels, values, unit = "" }) { 
  if (!userLabels || !values || userLabels.length < 2 || values.length < 2) {
    return (
      <div className="w-full my-4 text-center text-gray-400">
        Not enough data to compare for {metric}.
      </div>
    );
  }

  const displayUserLabels = [
    userLabels[0] || 'User 1', 
    userLabels[1] || 'User 2'
  ];

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tickFillColor = isDarkMode ? "#cbd5e1" : "#000"; 

  const data = [
    { user: displayUserLabels[0], value: values[0] },
    { user: displayUserLabels[1], value: values[1] },
  ];

  return (
    <div className="w-full my-4" style={{ minWidth: 320, maxWidth: 600, margin: "0 auto" }}>
      <div className="mb-1 text-base font-semibold text-gray-700 dark:text-gray-200">{metric}</div>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 35, left: 60, bottom: 4 }}
          barCategoryGap={24} 
        >
          <XAxis type="number" tick={{ fontSize: 12, fill: tickFillColor }} allowDecimals={false} hide />

          <YAxis
            dataKey="user" 
            type="category"
            tick={{ fill: tickFillColor, fontSize: 14, fontWeight: "bold" }}
            width={120} 
          />
          
          {/* Pass the metric name to CustomTooltip */}
          <Tooltip content={<CustomTooltip unit={unit} userLabels={userLabels} metricName={metric} />} /> 
          
          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
            <LabelList dataKey="value" position="right" fontWeight="bold" fontSize={10} fill={tickFillColor} />
            {data.map((d, idx) => (
              <Cell key={d.user || `cell-${idx}`} fill={BAR_COLORS[idx]} /> 
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}