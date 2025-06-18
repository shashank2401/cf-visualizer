import React from "react";

// Helper to get a color based on submission count
function getColor(count) {
  if (count === 0) return "bg-gray-200 dark:bg-gray-800";
  if (count < 2) return "bg-green-100 dark:bg-green-900";
  if (count < 5) return "bg-green-300 dark:bg-green-700";
  if (count < 10) return "bg-green-500 dark:bg-green-600";
  return "bg-green-700 dark:bg-green-400";
}

// Helper: get Date in IST at midnight
function getISTToday() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc + istOffset);
  ist.setHours(0, 0, 0, 0);
  return ist;
}

// Returns a 7x53 grid: rows = Sun–Sat, cols = weeks
function getPastYearGrid(submissionsByDate) {
    const today = getISTToday();
    const grid = Array.from({ length: 7 }, () => Array(53).fill(null));

    const endDate = new Date(today);
    // Start date is 52 weeks before the Sunday of the current week
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7) - today.getDay());
    
    let currentDate = new Date(startDate);

    while(currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        // Calculate the difference in weeks from the start date
        const weekIndex = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7));

        if(weekIndex >= 0 && weekIndex < 53) {
            const isoDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
            grid[dayOfWeek][weekIndex] = {
                date: isoDate,
                count: submissionsByDate[isoDate] || 0,
            };
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return grid;
}

export default function SubmissionHeatmap({ submissions = [] }) {
  const submissionsByDate = {};
  if(Array.isArray(submissions)) {
    submissions.forEach((s) => {
        if(s && s.date) {
            submissionsByDate[s.date] = s.count;
        }
    });
  }

  const grid = getPastYearGrid(submissionsByDate);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const monthLabels = grid[0].map((week, colIndex) => {
      // Find the first valid day in the column to determine the month
      const firstDayInColumn = grid.find(row => row[colIndex])?.[colIndex];
      if (!firstDayInColumn) return null;
      
      const date = new Date(firstDayInColumn.date);
      // Show month label if it's the first week of that month in our grid
      if (date.getDate() <= 7) {
        return { col: colIndex, label: months[date.getMonth()] };
      }
      return null;
  }).filter(Boolean);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const showDayLabel = [1, 3, 5]; // Show labels only for Mon, Wed, Fri

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mt-6">
      {/* <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Submission Activity
      </h2> */}
      <div className="flex">
        {/* Day Labels (Fixed) */}
        <div className="flex flex-col text-xs text-gray-400 pr-2 pt-6" style={{ gap: '2px' }}>
            {dayLabels.map((d, i) => (
                <div key={i} className="h-4 leading-4" style={{ visibility: showDayLabel.includes(i) ? "visible" : "hidden" }}>
                    {d}
                </div>
            ))}
        </div>

        {/* Scrollable Area for Month Labels and Grid */}
        <div className="overflow-x-auto w-full">
            <div className="inline-block">
                {/* Month Labels */}
                <div className="flex h-6 items-center">
                    {grid[0].map((_, col) => {
                        const monthLabel = monthLabels.find(m => m.col === col);
                        return (
                            <div key={col} className="w-4 text-xs text-center text-gray-400" style={{ marginRight: '2px' }}>
                                {monthLabel ? monthLabel.label : '\u00A0'}
                            </div>
                        )
                    })}
                </div>

                {/* Grid */}
                <div className="flex" style={{ gap: '2px' }}>
                    {grid[0].map((_, col) => (
                        <div key={col} className="flex flex-col" style={{ gap: '2px' }}>
                            {grid.map((row, rowIdx) => {
                                const day = grid[rowIdx][col];
                                return day ? (
                                    <div
                                        key={rowIdx}
                                        className={`w-4 h-4 rounded ${getColor(day.count)}`}
                                        title={`${day.date}: ${day.count} submission${day.count !== 1 ? "s" : ""}`}
                                    />
                                ) : (
                                    <div key={rowIdx} className="w-4 h-4 rounded bg-transparent" />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <span className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800" />
          <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900" />
          <span className="w-4 h-4 rounded bg-green-300 dark:bg-green-700" />
          <span className="w-4 h-4 rounded bg-green-500 dark:bg-green-600" />
          <span className="w-4 h-4 rounded bg-green-700 dark:bg-green-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}