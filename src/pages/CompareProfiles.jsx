// src/pages/CompareProfiles.jsx

import React, { useState, useMemo, useEffect } from "react";
import useBatchUserData from "../hooks/useBatchUserData";
import useContests from "../hooks/useContests";
import useSubmissions from "../hooks/useSubmissions";
import ErrorMessage from "../components/ui/ErrorMessage";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import SectionContainer from "../components/ui/SectionContainer";

import ComparisonBars from "../components/compare/ComparisonBars";
import ComparisonRatingGraph from "../components/compare/ComparisonRatingGraph";
import CompareProblemsBar from "../components/compare/CompareProblemsBar";
import CompareTagsBar from "../components/compare/CompareTagsBar";
import ContestDuelTable from "../components/compare/ContestDuelTable";

import { getTotalSolved } from "../utils/profile-stats";
import { formatRatingWiseData } from "../utils/chart-formatters";
import { aggregateTags } from "../utils/tag-utils";
import { mergeTags } from "../utils/merge-utils";

export default function CompareProfiles() {
  // Input state
  const [h1, setH1] = useState("");
  const [h2, setH2] = useState("");
  const [submitted, setSubmitted] = useState({ h1: "", h2: "" });
  const [error, setError] = useState(null);

  // 1️⃣ Batch user.info
  const handles = [submitted.h1, submitted.h2].filter(Boolean);
  const { users, loading: loadingInfo, error: errorInfo } = useBatchUserData(handles);
  const user1 = users[0] || null;
  const user2 = users[1] || null;

  // 2️⃣ Two separate user.rating calls
  const {
    contests: contests1,
    ratingChanges: rating1,
    loading: loadingC1,
    error: errorC1,
  } = useContests(submitted.h1);
  const {
    contests: contests2,
    ratingChanges: rating2,
    loading: loadingC2,
    error: errorC2,
  } = useContests(submitted.h2);

  // 3️⃣ Two separate user.status calls
  const {
    submissions: subs1,
    loading: loadingS1,
    error: errorS1,
  } = useSubmissions(submitted.h1);
  const {
    submissions: subs2,
    loading: loadingS2,
    error: errorS2,
  } = useSubmissions(submitted.h2);

  // Loading & data checks
  const isLoading =
    (submitted.h1 || submitted.h2) &&
    (loadingInfo || loadingC1 || loadingC2 || loadingS1 || loadingS2);

  const hasAll =
    user1 && subs1 && contests1?.length && rating1?.length &&
    user2 && subs2 && contests2?.length && rating2?.length;

  // Error aggregation
  useEffect(() => {
    setError(null);
    if (isLoading) return;

    const all = [errorInfo, errorC1, errorC2, errorS1, errorS2].filter(Boolean);
    if (all.length) {
      setError(all.join(" "));
    } else if ((submitted.h1 && submitted.h2) && !hasAll) {
      setError("Could not load complete data for one or both handles. Please try again.");
    }
  }, [errorInfo, errorC1, errorC2, errorS1, errorS2, isLoading, hasAll, submitted]);

  // Form submission
  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const t1 = h1.trim();
    const t2 = h2.trim();

    // Validate CF handle length
    if (t1.length < 3 || t1.length > 24) {
      setError("First handle must be between 3 and 24 characters");
      return;
    }
    if (t2.length < 3 || t2.length > 24) {
      setError("Second handle must be between 3 and 24 characters");
      return;
    }

    setSubmitted({ h1: t1, h2: t2 });
  }

  // Labels
  const labels = useMemo(() => [
    user1?.handle || submitted.h1 || "User 1",
    user2?.handle || submitted.h2 || "User 2",
  ], [user1, user2, submitted]);

  // Chart data
  const ratingWiseData = useMemo(() => {
    if (!hasAll) return [];
    return mergeByKey(
      formatRatingWiseData(subs1),
      formatRatingWiseData(subs2),
      "rating"
    );
  }, [subs1, subs2, hasAll]);

  const tagsWiseData = useMemo(() => {
    if (!hasAll) return [];
    return mergeTags(
      aggregateTags(subs1),
      aggregateTags(subs2)
    );
  }, [subs1, subs2, hasAll]);

  const commonContestsData = useMemo(() => {
    if (!hasAll) return { common: [], h1Wins: 0, h2Wins: 0 };
    return getCommonContests(
      contests1,
      contests2,
      labels[0],
      labels[1]
    );
  }, [contests1, contests2, labels, hasAll]);

  // Helpers
  function mergeByKey(arr1, arr2, key = "rating") {
    const map = {};
    arr1.forEach(item => map[item[key]] = { [key]: item[key], user1: item.count, user2: 0 });
    arr2.forEach(item => {
      if (map[item[key]]) map[item[key]].user2 = item.count;
      else map[item[key]] = { [key]: item[key], user1: 0, user2: item.count };
    });
    return Object.values(map).sort((a, b) => a[key] - b[key]);
  }

  function getCommonContests(c1, c2, h1, h2) {
    const m1 = new Map(c1.map(c => [c.contestId, c]));
    let w1 = 0, w2 = 0;
    const common = c2.filter(c => m1.has(c.contestId)).map(c => {
      const a = m1.get(c.contestId);
      if (a.rank < c.rank) w1++; else if (c.rank < a.rank) w2++;
      return {
        contestName: a.contestName,
        handle1: { rank: a.rank, ratingChange: a.newRating - a.oldRating },
        handle2: { rank: c.rank, ratingChange: c.newRating - c.oldRating },
      };
    });
    return { common, h1Wins: w1, h2Wins: w2, handle1: h1, handle2: h2 };
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto mt-8 mb-6 flex flex-col md:flex-row items-center gap-2 md:gap-4"
        autoComplete="off"
      >
        <input
          type="text"
          placeholder="Enter first Codeforces handle"
          className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={h1}
          onChange={e => setH1(e.target.value)}
          required
        />
        <span className="min-w-[40px] text-center font-bold text-gray-500 dark:text-gray-400 text-lg">VS</span>
        <input
          type="text"
          placeholder="Enter second Codeforces handle"
          className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={h2}
          onChange={e => setH2(e.target.value)}
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Compare
        </button>
      </form>

      {isLoading && (
        <SectionContainer><LoadingSkeleton lines={12} /></SectionContainer>
      )}

      {error && !isLoading && <ErrorMessage message={error} />}

      {!isLoading && !error && hasAll && (
        <>
          <SectionContainer>
            <p className="text-sm text-center text-gray-500 italic">
              Note: To ensure a smooth experience and avoid API limits, all statistics are based on the last 2000 submissions.
            </p>
          </SectionContainer>

          <SectionContainer title="Statistics Comparison">
            <div className="grid md:grid-cols-2 gap-6">
              <ComparisonBars metric="Current Rating" userLabels={labels} values={[user1.rating, user2.rating]} />
              <ComparisonBars metric="Max Rating"     userLabels={labels} values={[user1.maxRating, user2.maxRating]} />
              <ComparisonBars metric="Problems Solved" userLabels={labels} values={[getTotalSolved(subs1), getTotalSolved(subs2)]} />
              <ComparisonBars metric="Total Contests"  userLabels={labels} values={[contests1.length, contests2.length]} />
            </div>
          </SectionContainer>

          <SectionContainer title="Rating Changes">
            <ComparisonRatingGraph user1={rating1} user2={rating2} userLabels={labels} />
          </SectionContainer>

          <SectionContainer title="Problem Ratings">
            <CompareProblemsBar data={ratingWiseData} userLabels={labels} />
          </SectionContainer>

          <SectionContainer title="Problem Tags">
            <CompareTagsBar data={tagsWiseData} userLabels={labels} />
          </SectionContainer>

          <SectionContainer title="Contest Duels">
            <ContestDuelTable
              contests={commonContestsData.common}
              userLabels={labels}
              duelStats={{ user1Wins: commonContestsData.h1Wins, user2Wins: commonContestsData.h2Wins }}
            />
          </SectionContainer>
        </>
      )}
    </div>
  );
}