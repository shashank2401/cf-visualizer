/**
 * Aggregates tag counts from a list of submissions.
 * Only counts unique problems solved (verdict === "OK").
 * @param {Array} submissions - List of user submissions from Codeforces API.
 * @returns {Object} - Map of tag -> count
 */
export function aggregateTags(submissions) {
  const solvedProblems = new Set();
  const tagCounts = {};

  for (const submission of submissions) {
    if (submission.verdict !== "OK") continue;

    const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
    if (solvedProblems.has(problemId)) continue; // Count each problem once

    solvedProblems.add(problemId);

    const tags = submission.problem.tags || [];
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return tagCounts;
}