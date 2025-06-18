import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { renderPiePercentageLabel } from "../../utils/pie-label.jsx";

const VERDICT_COLORS = {
  ACCEPTED: "#10b981", // green
  WRONG_ANSWER: "#ef4444", // red
  TIME_LIMIT_EXCEEDED: "#f59e42", // orange
  RUNTIME_ERROR: "#f43f5e", // rose
  MEMORY_LIMIT_EXCEEDED: "#a21caf", // purple
  COMPILATION_ERROR: "#6366f1", // indigo
  IDLENESS_LIMIT_EXCEEDED: "#14b8a6", // teal
  PARTIAL: "#facc15", // yellow
  PRESENTATION_ERROR: "#0ea5e9", // sky
  SKIPPED: "#64748b", // slate
  HACKED: "#e11d48", // red-600
  OTHER: "#6b7280", // gray
};

function getColor(verdict) {
  return VERDICT_COLORS[verdict] || "#6b7280";
}

export default function VerdictPie({ data }) {
  if (!data || !data.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No verdict data available.</span>
      </div>
    );
  }

  return (
    <div className="pb-8">
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
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name.replace(/_/g, " ")]} />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            wrapperStyle={{
              color: "#64748b",
              fontSize: "11px",
              marginTop: 12,
              paddingBottom: 24,
              width: "100%",
              textAlign: "left",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
