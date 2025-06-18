// src/components/charts/RatingWiseBarChart.jsx

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

// Tailwind-inspired color for bars
const BAR_COLOR = "#2563eb"; // blue-600

// Custom tooltip for rating bars
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { rating, count } = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 text-sm shadow">
        <span className="font-semibold">Rating: {rating}</span>
        <br />
        Problems Solved: <span className="font-bold">{count}</span>
      </div>
    );
  }
  return null;
};

export default function RatingWiseBarChart({ data }) {
  // data: [{ rating: 800, count: 12 }, { rating: 900, count: 15 }, ...]
  if (!data || !data.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No rating-wise problem data available.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mt-6">
        <div className="overflow-x-auto">
        <div className="min-w-[700px]">
            <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                dataKey="rating"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                label={{
                    value: "Problem Rating",
                    position: "insideBottom",
                    offset: -18,
                    fill: "#6b7280",
                    fontSize: 14,
                }}
                />
                <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                allowDecimals={false}
                label={{
                    value: "Solved",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                    fontSize: 14,
                }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]}>
                <LabelList
                    dataKey="count"
                    position="top"
                    fill="#2563eb"
                    fontWeight="bold"
                    fontSize={10}
                />
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>
    </div>
    );
}