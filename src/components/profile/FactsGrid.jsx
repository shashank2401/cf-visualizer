// src/components/profile/FactsGrid.jsx

import { FaTrophy, FaArrowUp, FaArrowDown, FaCalendarAlt } from "react-icons/fa";

export default function FactsGrid({ stats }) {

  if (!stats) {
    // Skeleton/placeholder
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      <FactCard
        icon={<FaTrophy className="text-yellow-500 text-2xl" />}
        label="Contests"
        value={stats.contests}
      />
      <FactCard
        icon={<FaArrowUp className="text-green-500 text-2xl" />}
        label="Best Rank"
        value={stats.bestRank}
      />
      <FactCard
        icon={<FaArrowDown className="text-red-500 text-2xl" />}
        label="Worst Rank"
        value={stats.worstRank}
      />
      <FactCard
        icon={<FaCalendarAlt className="text-purple-500 text-2xl" />}
        label="First Contest"
        value={stats.firstContest}
      />
      <FactCard
        icon={<FaCalendarAlt className="text-pink-500 text-2xl" />}
        label="Last Contest"
        value={stats.lastContest}
      />
      <FactCard
        icon={<FaTrophy className="text-green-600 text-2xl" />}
        label="Total Solved"
        value={stats.totalSolved}
      />
    </div>
  );
}

function FactCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <div>{icon}</div>
      <div className="mt-2 text-lg font-bold text-gray-800 dark:text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}