import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  CartesianGrid,
} from "recharts";

const BAR_COLORS = [
  "#2563eb", // blue-600
  "#f59e42", // orange-400
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length === 2) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 text-sm shadow">
        <div className="font-semibold mb-1">Rating: {label}</div>
        {payload.map((entry, idx) => (
          <div key={entry.name || idx} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: BAR_COLORS[idx] }}
            />
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * data: [
 *   { rating: 800, user1: 12, user2: 15 },
 *   { rating: 900, user1: 18, user2: 21 },
 *   ...
 * ]
 * userLabels: [user1handle, user2handle]
 * barKeys: ["user1", "user2"]
 */
export default function CompareProblemsBar({
  data,
  userLabels = ["User 1", "User 2"],
  barKeys = ["user1", "user2"],
  title = "Problems Solved by Rating"
}) {
  // Guard: If data is missing or empty, show fallback
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No rating-wise comparison data available.</span>
      </div>
    );
  }

  // Guard: If userLabels are missing or empty, show fallback
  if (!userLabels[0] || !userLabels[1]) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-gray-400">
        Not enough user data to compare.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <ResponsiveContainer width="100%" height={60 + data.length * 32}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
          barCategoryGap={18}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="rating"
            type="category"
            tick={{ fill: "#6b7280", fontSize: 14, fontWeight: "bold" }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            iconType="circle"
            formatter={(value, entry, index) =>
              <span style={{ color: BAR_COLORS[index], fontWeight: "bold" }}>{userLabels[index]}</span>
            }
          />
          {barKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={userLabels[idx]}
              fill={BAR_COLORS[idx]}
              radius={[6, 6, 6, 6]}
              barSize={18}
              isAnimationActive={true}
            >
              <LabelList dataKey={key} position="right" fill={BAR_COLORS[idx]} fontWeight="bold" />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}