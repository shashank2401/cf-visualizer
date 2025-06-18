// src/pages/CompareProfiles.jsx

import React, { useState, useEffect, useMemo } from "react";
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
  const [error, setError] = useState(null); // This will hold the aggregated error message

  // Data fetching hooks - these already contain the client-side caching logic
  const { user: user1, loading: loading1, error: error1 } = useUserData(submittedHandles.handle1);
  const { user: user2, loading: loading2, error: error2 } = useUserData(submittedHandles.handle2);

  const { submissions: subs1, loading: subsLoading1, error: subsError1 } = useSubmissions(submittedHandles.handle1);
  const { submissions: subs2, loading: subsLoading2, error: subsError2 } = useSubmissions(submittedHandles.handle2);

  const { contests: contests1, ratingChanges: rating1, loading: contestsLoading1, error: contestsError1 } = useContests(submittedHandles.handle1);
  const { contests: contests2, ratingChanges: rating2, loading: contestsLoading2, error: contestsError2 } = useContests(submittedHandles.handle2);

  // Determine overall loading state for display
  const isLoading =
    (loading1 || loading2 || subsLoading1 || subsLoading2 || contestsLoading1 || contestsLoading2) &&
    submittedHandles.handle1 &&
    submittedHandles.handle2;

  // Determine if all necessary data for display has been loaded
  // This now checks for null/undefined data, ensures all loading flags are false, and no individual hook errors
  const hasData =
    !!user1 && !!user2 &&
    !!subs1 && !!subs2 &&
    !!rating1 && !!rating2 &&
    !!contests1 && !!contests2 &&
    !isLoading && // Ensure no loading is still in progress
    !!submittedHandles.handle1 && !!submittedHandles.handle2 && // Ensure both handles were submitted
    !error1 && !error2 && !subsError1 && !subsError2 && !contestsError1 && !contestsError2; // Ensure no individual hook errors


  // Combine errors from all hooks
  useEffect(() => {
    let currentErrors = [];

    // Filter out null/undefined errors for easier processing
    const allHookErrors = [error1, error2, subsError1, subsError2, contestsError1, contestsError2].filter(Boolean);

    // 1. Prioritize "Too many requests" errors
    const rateLimitErrorFound = allHookErrors.some(err => err.includes("Too many requests"));
    if (rateLimitErrorFound) {
      setError("Too many requests to the server. Please wait a moment and try again.");
      return; // Stop here, rate limit is the most critical error
    }

    // 2. Handle "User not found" errors
    if (error1?.includes("not found")) {
      currentErrors.push(`User '${submittedHandles.handle1}' not found.`);
    }
    if (error2?.includes("not found")) {
      currentErrors.push(`User '${submittedHandles.handle2}' not found.`);
    }

    // 3. Add other specific errors if not already covered by "not found"
    // Also, ensure we don't re-add "Too many requests" if already handled.
    if (error1 && !error1.includes("not found")) currentErrors.push(`Error for ${submittedHandles.handle1}: ${error1}`);
    if (error2 && !error2.includes("not found")) currentErrors.push(`Error for ${submittedHandles.handle2}: ${error2}`);

    if (subsError1 && !subsError1.includes("Too many requests")) currentErrors.push(`Submissions for ${submittedHandles.handle1}: ${subsError1}`);
    if (subsError2 && !subsError2.includes("Too many requests")) currentErrors.push(`Submissions for ${submittedHandles.handle2}: ${subsError2}`);

    if (contestsError1 && !contestsError1.includes("Too many requests")) currentErrors.push(`Contests for ${submittedHandles.handle1}: ${contestsError1}`);
    if (contestsError2 && !contestsError2.includes("Too many requests")) currentErrors.push(`Contests for ${submittedHandles.handle2}: ${contestsError2}`);


    // Final decision on what error to set
    if ((submittedHandles.handle1 || submittedHandles.handle2) && !isLoading) {
      if (currentErrors.length > 0) {
        // Use a Set to remove duplicate messages before joining
        const finalErrors = Array.from(new Set(currentErrors)).join(". ") + ".";
        setError(finalErrors);
      } else if (!hasData && (submittedHandles.handle1 && submittedHandles.handle2)) {
        // This catches cases where no specific error but data is incomplete after loading finishes
        // (e.g., partial data fetched, or a very generic network issue that didn't populate hook errors clearly)
        setError("Could not load complete data for one or both handles. Please check the handles and try again.");
      } else {
        setError(null); // Clear error if all data is loaded and no specific errors
      }
    } else if (!submittedHandles.handle1 && !submittedHandles.handle2) {
      setError(null); // Clear error if no handles are submitted (initial state)
    }
  }, [
    error1, error2, subsError1, subsError2, contestsError1, contestsError2,
    submittedHandles.handle1, submittedHandles.handle2,
    isLoading, hasData
  ]);


  function handleSubmit(e) {
    e.preventDefault();
    setError(null); // Clear previous errors on new submission attempt

    const trimmedHandle1 = handle1.trim();
    const trimmedHandle2 = handle2.trim();

    if (!trimmedHandle1 || !trimmedHandle2) {
      setError("Please enter both Codeforces handles for comparison.");
      setSubmittedHandles({ handle1: "", handle2: "" }); // Clear submitted handles to prevent unwanted fetches
      return;
    }

    setSubmittedHandles({
      handle1: trimmedHandle1, // Let hooks handle lowercasing
      handle2: trimmedHandle2, // Let hooks handle lowercasing
    });
  }

  // Memoize user labels for consistent display
  const userLabels = useMemo(() => {
    // Ensure that if user1 or user2 are null/undefined (e.g., on error or not found),
    // we still use the submitted handle for labeling.
    const label1 = user1?.handle || submittedHandles.handle1 || "User 1";
    const label2 = user2?.handle || submittedHandles.handle2 || "User 2";
    return [label1, label2];
  }, [user1, user2, submittedHandles.handle1, submittedHandles.handle2]);


  // Memoize data for charts to prevent unnecessary re-calculations
  // Only calculate if `hasData` is true
  const ratingWiseData = useMemo(() => {
    if (!hasData) return [];
    return mergeByKey(formatRatingWiseData(subs1), formatRatingWiseData(subs2), "rating");
  }, [subs1, subs2, hasData]);

  const tagsWiseData = useMemo(() => {
    if (!hasData) return [];
    const tags1 = aggregateTags(subs1);
    const tags2 = aggregateTags(subs2);
    return mergeTags(tags1, tags2);
  }, [subs1, subs2, hasData]);

  const commonContestsData = useMemo(() => {
    if (!hasData) return [];
    const h1 = userLabels[0];
    const h2 = userLabels[1];
    return getCommonContests(contests1, contests2, h1, h2);
  }, [contests1, contests2, userLabels, hasData]);


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


  return (
    // Added horizontal padding (px-4 for mobile, increasing for larger screens)
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

      {error && (
        // Split error message into separate ErrorMessage components for better formatting
        <div className="space-y-1 mb-6 px-4 md:px-0"> {/* Added mb-6 for spacing and px-4 for mobile */}
          {error.split(". ").map((err, idx) => (
            // Ensure empty strings don't create empty error messages
            err.trim() !== "" ? <ErrorMessage key={idx} message={err.trim()} /> : null
          ))}
        </div>
      )}

      {isLoading ? (
        <SectionContainer>
          <LoadingSkeleton lines={12} />
        </SectionContainer>
      ) : ( // Not loading
        error ? ( // If there's an error after loading, only the error message is shown
          null
        ) : ( // No error and not loading
          hasData ? ( // Only render data components if all data is successfully loaded
            <div className="flex flex-col gap-8">
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
                    metric="Contests"
                    userLabels={userLabels}
                    values={[contests1?.length || 0, contests2?.length || 0]}
                  />
                  <ComparisonBars
                    metric="Best Rank"
                    userLabels={userLabels}
                    values={[
                      contests1?.length ? Math.min(...contests1.map(c => c.rank)) : 0,
                      contests2?.length ? Math.min(...contests2.map(c => c.rank)) : 0,
                    ]}
                  />
                  <ComparisonBars
                    metric="Worst Rank"
                    userLabels={userLabels}
                    values={[
                      contests1?.length ? Math.max(...contests1.map(c => c.rank)) : 0,
                      contests2?.length ? Math.max(...contests2.map(c => c.rank)) : 0,
                    ]}
                  />
                </div>
              </SectionContainer>
              <SectionContainer title="Rating Progress Comparison">
                <ComparisonRatingGraph
                  user1={rating1}
                  user2={rating2}
                  userLabels={userLabels}
                />
              </SectionContainer>
              <SectionContainer title="Problems Solved by Rating">
                <CompareProblemsBar
                  data={ratingWiseData}
                  userLabels={userLabels}
                  barKeys={["user1", "user2"]}
                />
              </SectionContainer>
              <SectionContainer title="Problems Solved by Tags">
                <CompareTagsBar
                  data={tagsWiseData}
                  userLabels={userLabels}
                  barKeys={["user1", "user2"]}
                />
              </SectionContainer>
              {commonContestsData && commonContestsData.length > 0 && (
                <SectionContainer title="Head-to-Head Contest Results">
                  <ContestDuelTable
                    contests={commonContestsData.map(c => ({
                      contestId: c.contestId,
                      contestName: c.contestName,
                      user1Rank: c[userLabels[0]]?.rank,
                      user2Rank: c[userLabels[1]]?.rank,
                      contestDate: c.date ? new Date(c.date * 1000).toLocaleDateString() : "",
                    }))}
                    userLabels={userLabels}
                  />
                </SectionContainer>
              )}
            </div>
          ) : ( // Not loading, no error, and data not fully loaded (e.g., initial state)
            (!submittedHandles.handle1 && !submittedHandles.handle2) && ( // Only show initial message if no handles submitted yet
              <SectionContainer>
                <div className="text-center text-gray-400 dark:text-gray-600 py-8">
                  Enter two Codeforces handles to compare their profiles.
                </div>
              </SectionContainer>
            )
          )
        )
      )}
    </div>
  );
}

// Helper function remains the same, adjusted date field access
function getCommonContests(contests1, contests2, handle1, handle2) {
  const contestMap1 = {};
  const contestMap2 = {};

  contests1.forEach(contest => {
    contestMap1[contest.contestId] = contest;
  });
  contests2.forEach(contest => {
    contestMap2[contest.contestId] = contest;
  });

  const commonContests = [];
  Object.keys(contestMap1).forEach(contestId => {
    if (contestMap2[contestId]) {
      const contest1 = contestMap1[contestId];
      const contest2 = contestMap2[contestId];
      commonContests.push({
        contestId: parseInt(contestId),
        contestName: contest1.contestName || `Contest ${contestId}`,
        // Use startTimeSeconds from contests1 as the primary date source, assuming it's consistent
        // Convert to milliseconds for Date constructor if it's a Unix timestamp in seconds
        date: contest1.startTimeSeconds || (typeof contest1.date === 'number' ? contest1.date : null),
        [handle1]: {
          rank: contest1.rank,
          ratingChange: contest1.newRating - contest1.oldRating,
          newRating: contest1.newRating,
        },
        [handle2]: {
          rank: contest2.rank,
          ratingChange: contest2.newRating - contest2.oldRating,
          newRating: contest2.newRating,
        },
        winner: contest1.rank < contest2.rank ? handle1 :
          contest2.rank < contest1.rank ? handle2 : "tie"
      });
    }
  });
  return commonContests.sort((a, b) => {
    // Sort by date (timestamp) in descending order (most recent first)
    const dateA = a.date || 0;
    const dateB = b.date || 0;
    return dateB - dateA;
  });
}