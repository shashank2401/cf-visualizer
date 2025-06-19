import React, { useState } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileCard from "../components/profile/ProfileCard";
import FactsGrid from "../components/profile/FactsGrid";
import RatingGraph from "../components/charts/RatingGraph";
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
  const [formError, setFormError] = useState(null);

  // Data fetching hooks
  const { user, loading: userLoading, error: userError } = useUserData(submittedHandle);
  const { submissions, loading: subsLoading, error: subsError } = useSubmissions(submittedHandle);
  const { contests, ratingChanges, loading: contestsLoading, error: contestsError } = useContests(submittedHandle);

  const isLoading = userLoading; // Primary loading state is for the user data
  const hasLoadedUserData = !!user && !userLoading && !userError;

  // Derived stats for FactsGrid
  const facts = hasLoadedUserData && contests && submissions
    ? {
        contests: contests.length,
        bestRank: contests.length ? Math.min(...contests.map(c => c.rank)) : "-",
        worstRank: contests.length ? Math.max(...contests.map(c => c.rank)) : "-",
        totalSolved: getTotalSolved(submissions),
        firstContest: contests.length && contests[0]?.date ? formatDate(contests[0].date) : "-",
        lastContest: contests.length && contests[contests.length - 1]?.date ? formatDate(contests[contests.length - 1].date) : "-",
      }
    : null;

  // Chart data formatters - ensure data exists before formatting
  const heatmapData = submissions ? formatHeatmapData(submissions) : [];
  const languagesData = submissions ? formatLanguagesData(submissions, 6) : [];
  const verdictsData = submissions ? formatVerdictsData(submissions) : [];
  const tagsData = submissions ? formatTagsData(submissions, 8) : [];
  const ratingBarData = submissions ? formatRatingWiseData(submissions) : [];

  // Form submit handler
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = handle.trim();
    if (!trimmed) {
      setFormError("Please enter a Codeforces handle.");
      setSubmittedHandle("");
      return;
    }
    setFormError(null);
    setSubmittedHandle(trimmed);
  }

  function handleInputChange(e) {
    setHandle(e.target.value);
    if (e.target.value.trim() === "") {
        setSubmittedHandle("");
        setFormError(null);
    }
  }

  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
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

      {formError && <ErrorMessage message={formError} />}
      {userError && <ErrorMessage message={userError} />}

      {isLoading && (
        <SectionContainer>
          <LoadingSkeleton lines={8} />
        </SectionContainer>
      )}

      {hasLoadedUserData ? (
        <>
          <div className="px-4 md:px-6 lg:px-8">
            <ProfileHeader handle={user.handle} tagline="Visualizing your Codeforces journey" />
          </div>
          <SectionContainer>
            <ProfileCard user={user} />
          </SectionContainer>

          <SectionContainer>
            <p className="text-sm text-center text-gray-500 italic">
              Note: To ensure a smooth experience and avoid API limits, all statistics are based on the last 2000 submissions.
            </p>
          </SectionContainer>

          {contestsLoading ? <LoadingSkeleton lines={3} /> : contestsError ? <ErrorMessage message={contestsError} /> : facts && (
            <SectionContainer>
              <FactsGrid stats={facts} />
            </SectionContainer>
          )}

          {contestsLoading ? <LoadingSkeleton lines={6} /> : contestsError ? <ErrorMessage message={contestsError} /> : ratingChanges && (
            <SectionContainer title="Rating Changes Over Time">
              <RatingGraph data={ratingChanges} />
            </SectionContainer>
          )}

          {subsLoading ? <LoadingSkeleton lines={6} /> : subsError ? <ErrorMessage message={subsError} /> : heatmapData && (
            <SectionContainer title="Submission Activity Heatmap">
              <SubmissionHeatmap submissions={heatmapData} />
            </SectionContainer>
          )}

          <div className="grid md:grid-cols-3 gap-4 px-4 md:px-6 lg:px-8">
            {subsLoading ? <LoadingSkeleton lines={5} /> : subsError ? <ErrorMessage message={subsError} /> : languagesData && (
              <SectionContainer title="Languages Used">
                <LanguagesPie data={languagesData} />
              </SectionContainer>
            )}
            {subsLoading ? <LoadingSkeleton lines={5} /> : subsError ? <ErrorMessage message={subsError} /> : verdictsData && (
              <SectionContainer title="Verdicts Distribution">
                <VerdictPie data={verdictsData} />
              </SectionContainer>
            )}
            {subsLoading ? <LoadingSkeleton lines={5} /> : subsError ? <ErrorMessage message={subsError} /> : tagsData && (
              <SectionContainer title="Tags Distribution">
                <TagsPie data={tagsData} />
              </SectionContainer>
            )}
          </div>
          
          {subsLoading ? <LoadingSkeleton lines={6} /> : subsError ? <ErrorMessage message={subsError} /> : ratingBarData && (
            <SectionContainer title="Problems Solved by Rating">
              <RatingWiseBarChart data={ratingBarData} />
            </SectionContainer>
          )}
        </>
      ) : (
        !submittedHandle && !isLoading && !userError && (
          <SectionContainer>
            <div className="text-center text-gray-400 dark:text-gray-600 py-8">
              Enter a Codeforces handle to view profile statistics.
            </div>
          </SectionContainer>
        )
      )}
    </div>
  );
}