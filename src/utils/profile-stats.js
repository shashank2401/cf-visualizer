export function getLongestStreak(submissions) {
  if (!submissions || submissions.length === 0) return 0;
  const datesSet = new Set();
  submissions.forEach(sub => {
    const date = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    datesSet.add(date);
  });
  const dates = Array.from(datesSet).sort();
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
  }
  return longestStreak;
}

export function getCurrentStreak(submissions) {
  if (!submissions || submissions.length === 0) return 0;
  const datesSet = new Set();
  submissions.forEach(sub => {
    const date = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    datesSet.add(date);
  });
  const today = new Date();
  let streak = 0;
  while (true) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - streak);
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (datesSet.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getTotalSolved(submissions) {
  if (!submissions || submissions.length === 0) return 0;
  const solvedSet = new Set();
  submissions.forEach(sub => {
    if (sub.verdict === "OK" && sub.problem) {
      const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
      solvedSet.add(problemId);
    }
  });
  return solvedSet.size;
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}