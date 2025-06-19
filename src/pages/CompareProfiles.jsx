// src/pages/CompareProfiles.jsx

import React, { useState, useMemo, useEffect } from "react";
import useUserData from "../hooks/useUserData";
import useSubmissions from "../hooks/useSubmissions";
import useContests from "../hooks/useContests";
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
  const [handle1, setHandle1] = useState("");
  const [handle2, setHandle2] = useState("");
  const [submittedHandles, setSubmittedHandles] = useState({ handle1: "", handle2: "" });
  const [error, setError] = useState(null);

  // Data fetching for User 1
  const { user: user1, loading: loading1, error: error1 } = useUserData(submittedHandles.handle1);
  const { submissions: subs1, loading: subsLoading1, error: subsError1 } = useSubmissions(submittedHandles.handle1);
  const { contests: contests1, ratingChanges: rating1, loading: contestsLoading1, error: contestsError1 } = useContests(submittedHandles.handle1);

  // Data fetching for User 2
  const { user: user2, loading: loading2, error: error2 } = useUserData(submittedHandles.handle2);
  const { submissions: subs2, loading: subsLoading2, error: subsError2 } = useSubmissions(submittedHandles.handle2);
  const { contests: contests2, ratingChanges: rating2, loading: contestsLoading2, error: contestsError2 } = useContests(submittedHandles.handle2);

  const isLoading = 
    (submittedHandles.handle1 || submittedHandles.handle2) &&
    (loading1 || subsLoading1 || contestsLoading1 || loading2 || subsLoading2 || contestsLoading2);

  const hasAllData = 
    user1 && subs1 && contests1 && rating1 &&
    user2 && subs2 && contests2 && rating2;

  // Aggregate errors from all hooks
  useEffect(() => {
    setError(null); // Clear previous errors on re-fetch
    if (isLoading) return; // Don't set errors while still loading

    const allErrors = [error1, subsError1, contestsError1, error2, subsError2, contestsError2].filter(Boolean);

    if (allErrors.length > 0) {
      // Prioritize "not found" errors for clarity
      const notFound1 = error1?.includes("not found") ? `User '${submittedHandles.handle1}' not found.` : null;
      const notFound2 = error2?.includes("not found") ? `User '${submittedHandles.handle2}' not found.` : null;
      
      const otherErrors = allErrors.filter(e => !e.includes("not found")).map(e => e.toString());
      
      const finalErrors = [...new Set([notFound1, notFound2, ...otherErrors].filter(Boolean))];
      setError(finalErrors.join(" "));

    } else if ((submittedHandles.handle1 && submittedHandles.handle2) && !hasAllData) {
      // Catch-all for when loading is done but data is incomplete for unknown reasons
      setError("Could not load complete data for one or both handles. Please try again.");
    }
  }, [
    error1, subsError1, contestsError1, 
    error2, subsError2, contestsError2, 
    isLoading, hasAllData, submittedHandles
  ]);


  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmedHandle1 = handle1.trim();
    const trimmedHandle2 = handle2.trim();

    if (!trimmedHandle1 || !trimmedHandle2) {
      setError("Please enter both Codeforces handles for comparison.");
      setSubmittedHandles({ handle1: "", handle2: "" });
      return;
    }

    setSubmittedHandles({
      handle1: trimmedHandle1,
      handle2: trimmedHandle2,
    });
  }
  
  // Memoize user labels for consistent display
  const userLabels = useMemo(() => {
    const label1 = user1?.handle || submittedHandles.handle1 || "User 1";
    const label2 = user2?.handle || submittedHandles.handle2 || "User 2";
    return [label1, label2];
  }, [user1, user2, submittedHandles.handle1, submittedHandles.handle2]);
  
  
  // Memoize data for charts to prevent unnecessary re-calculations
  const ratingWiseData = useMemo(() => {
    if (!hasAllData) return [];
    return mergeByKey(formatRatingWiseData(subs1), formatRatingWiseData(subs2), "rating");
  }, [subs1, subs2, hasAllData]);

  const tagsWiseData = useMemo(() => {
    if (!hasAllData) return [];
    const tags1 = aggregateTags(subs1);
    const tags2 = aggregateTags(subs2);
    return mergeTags(tags1, tags2);
  }, [subs1, subs2, hasAllData]);

  const commonContestsData = useMemo(() => {
    if (!hasAllData) return [];
    const h1 = userLabels[0];
    const h2 = userLabels[1];
    return getCommonContests(contests1, contests2, h1, h2);
  }, [contests1, contests2, userLabels, hasAllData]);


  // Helper function for merging data by a common key
  function mergeByKey(arr1, arr2, key = "rating") {
    const map = {};
    arr1.forEach(item => map[item[key]] = { [key]: item[key], user1: item.count, user2: 0 });
    arr2.forEach(item => {
      if (map[item[key]]) map[item[key]].user2 = item.count;
      else map[item[key]] = { [key]: item[key], user1: 0, user2: item.count };
    });
    return Object.values(map).sort((a, b) => a[key] - b[key]);
  }

  // Helper for finding common contests
  function getCommonContests(contests1, contests2, handle1, handle2) {
    if (!contests1 || !contests2) return [];

    const contestMap1 = new Map(contests1.map(c => [c.contestId, c]));
    let h1Wins = 0;
    let h2Wins = 0;

    const common = contests2
      .filter(c2 => contestMap1.has(c2.contestId))
      .map(c2 => {
        const c1 = contestMap1.get(c2.contestId);
        if (c1.rank < c2.rank) {
          h1Wins++;
        } else if (c2.rank < c1.rank) {
          h2Wins++;
        }
        return {
          contestName: c1.contestName,
          handle1: { rank: c1.rank, ratingChange: c1.newRating - c1.oldRating },
          handle2: { rank: c2.rank, ratingChange: c2.newRating - c2.oldRating },
        };
      });

    return { common, h1Wins, h2Wins, handle1, handle2 };
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
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={handle1}
          onChange={(e) => setHandle1(e.target.value)}
          required
        />

        <span className="min-w-[40px] text-center font-bold text-gray-500 dark:text-gray-400 text-lg">
          VS
        </span>

        <input
          type="text"
          placeholder="Enter second Codeforces handle"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={handle2}
          onChange={(e) => setHandle2(e.target.value)}
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
        <SectionContainer>
          <LoadingSkeleton lines={12} />
        </SectionContainer>
      )}

      {error && !isLoading && (
        <ErrorMessage message={error} />
      )}
      
      {!isLoading && !error && hasAllData && (
        <div className="flex flex-col gap-8">
           <SectionContainer>
            <p className="text-sm text-center text-gray-500 italic">
              Note: To ensure a smooth experience and avoid API limits, all statistics are based on the last 2000 submissions.
            </p>
          </SectionContainer>
          <SectionContainer title="Statistics Comparison">
            <div className="grid md:grid-cols-2 gap-6">
              <ComparisonBars
                metric="Current Rating"
                userLabels={userLabels}
                values={[user1.rating || 0, user2.rating || 0]}
              />
              <ComparisonBars
                metric="Max Rating"
                userLabels={userLabels}
                values={[user1.maxRating || 0, user2.maxRating || 0]}
              />
              <ComparisonBars
                metric="Problems Solved"
                userLabels={userLabels}
                values={[getTotalSolved(subs1), getTotalSolved(subs2)]}
              />
              <ComparisonBars
                metric="Total Contests"
                userLabels={userLabels}
                values={[contests1.length, contests2.length]}
              />
            </div>
          </SectionContainer>
          
          <SectionContainer title="Rating Changes">
            <ComparisonRatingGraph user1={rating1} user2={rating2} userLabels={userLabels} />
          </SectionContainer>

          <SectionContainer title="Problem Ratings">
            <CompareProblemsBar data={ratingWiseData} userLabels={userLabels} />
          </SectionContainer>

          <SectionContainer title="Problem Tags">
            <CompareTagsBar data={tagsWiseData} userLabels={userLabels} />
          </SectionContainer>

          <SectionContainer title="Contest Duels">
            <ContestDuelTable 
              contests={commonContestsData.common} 
              userLabels={userLabels}
              duelStats={{
                user1Wins: commonContestsData.h1Wins,
                user2Wins: commonContestsData.h2Wins
              }}
            />
          </SectionContainer>
        </div>
      )}
    </div>
  );
}