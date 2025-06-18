// src/components/charts/LanguagesPie.jsx

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { renderPiePercentageLabel } from "../../utils/pie-label.jsx";

const COLORS = [
  "#2563eb", "#f59e42", "#10b981", "#f43f5e", "#a21caf", "#facc15", "#14b8a6", "#e11d48", "#64748b", "#6366f1"
];

export default function LanguagesPie({ data }) {
  if (!data || !data.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No language data available.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderPiePercentageLabel}
          outerRadius={80}
          dataKey="value"
          isAnimationActive={true}
          stroke="#fff"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend
          verticalAlign="bottom"
          height={48}
          iconType="circle"
          wrapperStyle={{
            color: "#64748b",
            fontSize: "12px",
            marginTop: 12,
            paddingBottom: 24,
            width: "100%",
            textAlign: "left",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}