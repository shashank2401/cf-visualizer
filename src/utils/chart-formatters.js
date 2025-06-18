// src/utils/chart-formatters.js

// Only count unique problems with OK verdict for solved stats
function getUniqueOkProblems(submissions) {
  const set = new Set();
  submissions.forEach(sub => {
    if (sub.verdict === "OK" && sub.problem) {
      set.add(`${sub.problem.contestId}-${sub.problem.index}`);
    }
  });
  return set;
}

// Languages: count unique OK problems by language, group "Other"
export function formatLanguagesData(submissions, topN = 6) {
  const langMap = {};
  const unique = {};
  submissions.forEach(sub => {
    if (sub.verdict === "OK" && sub.problem && sub.programmingLanguage) {
      const pid = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!unique[pid]) unique[pid] = sub.programmingLanguage;
    }
  });
  Object.values(unique).forEach(lang => {
    langMap[lang] = (langMap[lang] || 0) + 1;
  });
  const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN).map(([name, value]) => ({ name, value }));
  const otherSum = sorted.slice(topN).reduce((sum, [, v]) => sum + v, 0);
  return otherSum > 0 ? [...top, { name: "Other", value: otherSum }] : top;
}

// Verdicts: count all submissions by verdict
export function formatVerdictsData(submissions) {
  const verdictMap = {};
  submissions.forEach(sub => {
    let verdict = sub.verdict;
    if (verdict === "OK") verdict = "ACCEPTED";
    if (verdict == "CHALLENGED") verdict = "HACKED"; 
    if (verdict) verdictMap[verdict] = (verdictMap[verdict] || 0) + 1;
  });
  return Object.entries(verdictMap).map(([name, value]) => ({ name, value }));
}

// Tags: count unique OK problems by tag, group "Other"
export function formatTagsData(submissions, topN = 8) {
  const tagMap = {};
  const unique = {};
  submissions.forEach(sub => {
    if (sub.verdict === "OK" && sub.problem && sub.problem.tags) {
      const pid = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!unique[pid]) unique[pid] = sub.problem.tags;
    }
  });
  Object.values(unique).flat().forEach(tag => {
    tagMap[tag] = (tagMap[tag] || 0) + 1;
  });
  const sorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN).map(([name, value]) => ({ name, value }));
  const otherSum = sorted.slice(topN).reduce((sum, [, v]) => sum + v, 0);
  return otherSum > 0 ? [...top, { name: "Other", value: otherSum }] : top;
}

// Rating-wise: count unique OK problems by rating
export function formatRatingWiseData(submissions) {
  const ratingMap = {};
  const unique = {};
  submissions.forEach(sub => {
    if (sub.verdict === "OK" && sub.problem && sub.problem.rating) {
      const pid = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!unique[pid]) unique[pid] = sub.problem.rating;
    }
  });
  Object.values(unique).forEach(rating => {
    ratingMap[rating] = (ratingMap[rating] || 0) + 1;
  });
  return Object.entries(ratingMap)
    .map(([rating, count]) => ({ rating: Number(rating), count }))
    .sort((a, b) => a.rating - b.rating);
}

// Helper: UTC seconds to YYYY-MM-DD in IST
function getISTDateString(creationTimeSeconds) {
  const utc = new Date(creationTimeSeconds * 1000);
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc.getTime() + istOffset);
  return ist.toISOString().slice(0, 10);
}

export function formatHeatmapData(submissions) {
  const dateCount = {};
  submissions.forEach(sub => {
    const date = getISTDateString(sub.creationTimeSeconds);
    dateCount[date] = (dateCount[date] || 0) + 1;
  });
  return Object.entries(dateCount).map(([date, count]) => ({ date, count }));
}