import React, { useState, useEffect } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileCard from "../components/profile/ProfileCard";
import FactsGrid from "../components/profile/FactsGrid";
import RatingGraph from "../components/charts/RatingGraph"; // This is the component for a single user
import SubmissionHeatmap from "../components/charts/SubmissionHeatmap";
import LanguagesPie from "../components/charts/LanguagesPie";
import VerdictPie from "../components/charts/VerdictPie";
import TagsPie from "../components/charts/TagsPie";
import RatingWiseBarChart from "../components/charts/RatingWiseBarChart";
import SectionContainer from "../components/ui/SectionContainer";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ErrorMessage from "../components/ui/ErrorMessage";

import useUserData from "../hooks/useUserData";
import useSubmissions from "../hooks/useSubmissions";
import useContests from "../hooks/useContests";

import {
  getTotalSolved,
  formatDate,
} from "../utils/profile-stats";
import {
  formatLanguagesData,
  formatVerdictsData,
  formatTagsData,
  formatRatingWiseData,
  formatHeatmapData,
} from "../utils/chart-formatters";

export default function SingleProfile() {
  const [handle, setHandle] = useState("");
  const [submittedHandle, setSubmittedHandle] = useState("");
  const [error, setError] = useState(null); // This will hold the aggregated error message

  // Data fetching hooks - these already contain the client-side caching logic
  const { user, loading: userLoading, error: userError } = useUserData(submittedHandle);
  const { submissions, loading: subsLoading, error: subsError } = useSubmissions(submittedHandle);
  const { contests, ratingChanges, loading: contestsLoading, error: contestsError } = useContests(submittedHandle);

  // Determine overall loading state for display
  const isLoading = (userLoading || subsLoading || contestsLoading) && submittedHandle;

  // Determine if all necessary data for display has been loaded
  const hasLoadedAllData = 
    !!user && !!submissions && !!contests && !!ratingChanges && // Ensure data is present
    !isLoading && // Ensure no loading is still in progress
    !!submittedHandle && // Ensure a handle was actually submitted
    !userError && !subsError && !contestsError; // Ensure no individual hook errors

  // Reset error/loading/results when input is cleared
  useEffect(() => {
    if (handle.trim() === "") {
      setError(null);
      setSubmittedHandle(""); // Clear submittedHandle to stop data fetching when input is empty
    }
  }, [handle]);

  // Combine errors from all hooks, prioritize "not found" error or general errors
  useEffect(() => {
    let currentErrors = [];

    // Prioritize "not found" messages. If user not found, that's often the primary error.
    if (userError?.includes("not found")) {
      currentErrors.push(`User '${submittedHandle}' not found.`);
    }

    // Check for "Too many requests" specifically
    const allHookErrors = [userError, subsError, contestsError].filter(Boolean); // Filter out null/undefined
    const rateLimitErrorFound = allHookErrors.some(err => err.includes("Too many requests"));

    if (rateLimitErrorFound) {
      setError("Too many requests to the server. Please wait a moment and try again.");
      return; // Stop here, rate limit is the most critical error
    }

    // If no "not found" and no rate limit, add other errors
    if (!userError?.includes("not found")) { // Only add other user errors if not already covered by "not found"
        if (userError) currentErrors.push(userError);
    }
    if (subsError && !subsError.includes("Too many requests")) {
      currentErrors.push(subsError);
    }
    if (contestsError && !contestsError.includes("Too many requests")) {
      currentErrors.push(contestsError);
    }

    if (submittedHandle && !isLoading) {
      if (currentErrors.length > 0) {
        // Filter out duplicates and set the error
        setError(Array.from(new Set(currentErrors)).join(". ") + ".");
      } else if (!hasLoadedAllData) {
        // This catches cases where no specific error but data is incomplete after loading finishes
        // and no specific hook error was reported.
        setError("Could not load complete data for the handle. Please check the handle and try again.");
      } else {
        setError(null); // Clear error if all data is loaded and no specific errors
      }
    } else if (!submittedHandle) {
        setError(null); // Clear error if no handle is submitted
    }
  }, [userError, subsError, contestsError, submittedHandle, isLoading, hasLoadedAllData]);


  // Derived stats for FactsGrid
  // Only calculate if all data is loaded
  const facts = hasLoadedAllData
    ? {
        contests: contests.length,
        bestRank: contests.length ? Math.min(...contests.map(c => c.rank)) : "-",
        worstRank: contests.length ? Math.max(...contests.map(c => c.rank)) : "-",
        totalSolved: getTotalSolved(submissions),
        firstContest: contests.length && contests[0]?.date ? formatDate(contests[0].date) : "-", // Added optional chaining
        lastContest: contests.length && contests[contests.length - 1]?.date ? formatDate(contests[contests.length - 1].date) : "-", // Added optional chaining
      }
    : null;

  // Chart data (all formatters use only unique ACCEPTED/OK problems where relevant)
  // Ensure submissions is not null before passing to formatters
  // Only calculate if all data is loaded
  const heatmapData = hasLoadedAllData ? formatHeatmapData(submissions) : [];
  const languagesData = hasLoadedAllData ? formatLanguagesData(submissions, 6) : []; // top 6 + "Other"
  const verdictsData = hasLoadedAllData ? formatVerdictsData(submissions) : [];
  const tagsData = hasLoadedAllData ? formatTagsData(submissions, 8) : []; // top 8 + "Other"
  const ratingBarData = hasLoadedAllData ? formatRatingWiseData(submissions) : [];

  // Form submit handler
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = handle.trim(); // Do not lowercase here, let the hook normalize if needed
    if (!trimmed) {
      setError("Please enter a Codeforces handle.");
      setSubmittedHandle(""); // Ensure submittedHandle is cleared if input is empty
      return;
    }
    setError(null); // Clear previous errors on new submission attempt
    setSubmittedHandle(trimmed);
  }

  function handleInputChange(e) {
    setHandle(e.target.value);
  }

  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8"> {/* Added horizontal padding */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl mx-auto mt-8 mb-6 flex gap-2"
        autoComplete="off"
      >
        <input
          type="text"
          placeholder="Enter Codeforces handle"
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={handle}
          onChange={handleInputChange}
          required
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-r-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Show Profile
        </button>
      </form>

      {/* Render ErrorMessage if 'error' state is not null */}
      {error && <ErrorMessage message={error} />}

      {/* Conditional rendering based on loading, error, and data availability */}
      {isLoading ? ( // If currently loading
        <SectionContainer>
          <LoadingSkeleton lines={8} />
        </SectionContainer>
      ) : ( // Not loading
        error ? ( // If there's an error after loading and hasLoadedAllData is false
          // The error message is already displayed above, so we don't render content.
          // Returning null means nothing will be rendered below the error message when an error occurs.
          null
        ) : ( // No error and not loading
          hasLoadedAllData ? ( // If all data has successfully loaded
            <>
              {/* Added a container div with horizontal padding to ProfileHeader */}
              {/* This is the primary fix for the "touching boundary" issue */}
              <div className="px-4 md:px-6 lg:px-8">
                <ProfileHeader handle={user.handle} tagline="Visualizing your Codeforces journey" />
              </div>
              <SectionContainer>
                <ProfileCard user={user} />
              </SectionContainer>
              <SectionContainer>
                <FactsGrid stats={facts} />
              </SectionContainer>
              <SectionContainer title="Rating Changes Over Time">
                <RatingGraph data={ratingChanges} />
              </SectionContainer>
              <SectionContainer title="Submission Activity Heatmap">
                <SubmissionHeatmap submissions={heatmapData} />
              </SectionContainer>
              <div className="grid md:grid-cols-3 gap-4 px-4 md:px-6 lg:px-8"> {/* Added horizontal padding here too */}
                <SectionContainer title="Languages Used">
                  <LanguagesPie data={languagesData} />
                </SectionContainer>
                <SectionContainer title="Verdicts Distribution">
                  <VerdictPie data={verdictsData} />
                </SectionContainer>
                <SectionContainer title="Tags Distribution">
                  <TagsPie data={tagsData} />
                </SectionContainer>
              </div>
              <SectionContainer title="Problems Solved by Rating">
                <RatingWiseBarChart data={ratingBarData} />
              </SectionContainer>
            </>
          ) : ( // Not loading, no error, and data not fully loaded (e.g., initial state or some unexpected data issue)
            (!submittedHandle) && ( // Only show initial message if no handle has been submitted yet
              <SectionContainer>
                <div className="text-center text-gray-400 dark:text-gray-600 py-8">
                  Enter a Codeforces handle to view profile statistics.
                </div>
              </SectionContainer>
            )
          )
        )
      )}
    </div>
  );
}