// src/components/compare/ContestDuelTable.jsx

import React from "react";

// Helper to determine duel result
function getDuelResult(rank1, rank2) {
  if (rank1 < rank2) return 1;
  if (rank2 < rank1) return -1;
  return 0;
}

export default function ContestDuelTable({ contests, userLabels = ["User 1", "User 2"] }) {
  // contests: [{ contestId, contestName, user1Rank, user2Rank, contestDate }]
  // userLabels: [user1handle, user2handle]

  if (!contests || !contests.length) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow mt-6">
        <span className="text-gray-400 dark:text-gray-600">No duel contests found.</span>
      </div>
    );
  }

  // Calculate duel record
  let user1Wins = 0, user2Wins = 0, draws = 0;
  contests.forEach(c => {
    const result = getDuelResult(c.user1Rank, c.user2Rank);
    if (result === 1) user1Wins++;
    else if (result === -1) user2Wins++;
    else draws++;
  });

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mt-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
        Duel Results
      </h2>
      <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
        <span className="text-blue-600 dark:text-blue-400">{userLabels[0]}</span> {user1Wins} - {user2Wins} <span className="text-orange-500">{userLabels[1]}</span>
        {draws > 0 && <span className="ml-2 text-gray-500 dark:text-gray-400">(Draws: {draws})</span>}
      </div>
      <table className="min-w-full text-sm border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-300">
            <th className="py-2 px-2">#</th>
            <th className="py-2 px-2">Contest</th>
            <th className="py-2 px-2">{userLabels[0]} Rank</th>
            <th className="py-2 px-2">{userLabels[1]} Rank</th>
            <th className="py-2 px-2">Winner</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((c, idx) => {
            const result = getDuelResult(c.user1Rank, c.user2Rank);
            let winnerCell;
            if (result === 1)
              winnerCell = (
                <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-semibold">
                  {userLabels[0]}
                </span>
              );
            else if (result === -1)
              winnerCell = (
                <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-semibold">
                  {userLabels[1]}
                </span>
              );
            else
              winnerCell = (
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-semibold">
                  Draw
                </span>
              );

            return (
              <tr key={c.contestId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="py-1 px-2 text-gray-500">{idx + 1}</td>
                <td className="py-1 px-2 font-medium">
                  <a
                    href={`https://codeforces.com/contest/${c.contestId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {c.contestName}
                  </a>
                </td>
                <td className="py-1 px-2">{c.user1Rank}</td>
                <td className="py-1 px-2">{c.user2Rank}</td>
                <td className="py-1 px-2">{winnerCell}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Duel record: <span className="font-semibold text-blue-600 dark:text-blue-400">{userLabels[0]}</span> {user1Wins} - {user2Wins} <span className="font-semibold text-orange-500">{userLabels[1]}</span>
        {draws > 0 && <span className="ml-2">(Draws: {draws})</span>}
      </div>
    </div>
  );
}