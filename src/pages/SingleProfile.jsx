import React, { useState, useEffect, useRef } from "react";
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

import { getTotalSolved, formatDate } from "../utils/profile-stats";
import {
  formatLanguagesData,
  formatVerdictsData,
  formatTagsData,
  formatRatingWiseData,
  formatHeatmapData,
} from "../utils/chart-formatters";

// Helper to render async sections
function AsyncSection({ loading, error, title, skeletonLines = 5, children }) {
  if (loading) return <LoadingSkeleton lines={skeletonLines} />;
  if (error) return <ErrorMessage message={error} />;
  return <SectionContainer title={title}>{children}</SectionContainer>;
}

export default function SingleProfile() {
  const [handle, setHandle] = useState("");
  const [submittedHandle, setSubmittedHandle] = useState("");
  const [formError, setFormError] = useState(null);

  // Prevent double-fetch in StrictMode
  const didFetchRef = useRef(false);

  // Data fetching hooks
  const { user, loading: userLoading, error: userError } = useUserData(submittedHandle);
  const { submissions, loading: subsLoading, error: subsError } = useSubmissions(submittedHandle);
  const { contests, ratingChanges, loading: contestsLoading, error: contestsError } = useContests(submittedHandle);

  const isLoading = userLoading;
  const hasUser = !!user && !userLoading && !userError;

  // Derived stats for FactsGrid
  const facts = hasUser && contests.length && submissions
    ? {
        contests: contests.length,
        bestRank: Math.min(...contests.map(c => c.rank)),
        worstRank: Math.max(...contests.map(c => c.rank)),
        totalSolved: getTotalSolved(submissions),
        firstContest: formatDate(contests[0].date),
        lastContest: formatDate(contests[contests.length - 1].date),
      }
    : null;

  // Chart data
  const heatmapData = formatHeatmapData(submissions);
  const languagesData = formatLanguagesData(submissions, 6);
  const verdictsData = formatVerdictsData(submissions);
  const tagsData = formatTagsData(submissions, 8);
  const ratingBarData = formatRatingWiseData(submissions);

  // Handle form submit with CF handle-length validation
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = handle.trim();
    if (trimmed.length < 3 || trimmed.length > 24) {
      setFormError("Handle must be between 3 and 24 characters");
      return;
    }
    setFormError(null);
    setSubmittedHandle(trimmed);
  }

  // Disable button while loading
  const buttonLabel = userLoading ? "Loading…" : "Show Profile";

  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mt-8 mb-6 flex gap-2" autoComplete="off">
        <input
          type="text"
          placeholder="Enter Codeforces handle"
          className="flex-1 px-4 py-2 rounded-l-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={handle}
          onChange={e => setHandle(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={userLoading}
          className={`px-6 py-2 rounded-r-lg font-semibold transition ${
            userLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {buttonLabel}
        </button>
      </form>

      {(formError || userError) && <ErrorMessage message={formError || userError} />}

      {isLoading && !userError && (
        <SectionContainer><LoadingSkeleton lines={8} /></SectionContainer>
      )}

      {hasUser && (
        <>
          <ProfileHeader handle={user.handle} tagline="Visualizing your Codeforces journey" />
          <SectionContainer><ProfileCard user={user} /></SectionContainer>
          <SectionContainer>
            <p className="text-sm text-center text-gray-500 italic">
              Note: To ensure a smooth experience and avoid API limits, all statistics are based on the last 2000 submissions.
            </p>
          </SectionContainer>

          <AsyncSection loading={contestsLoading} error={contestsError} title="Contest Stats" skeletonLines={3}>
            <FactsGrid stats={facts} />
          </AsyncSection>

          <AsyncSection loading={contestsLoading} error={contestsError} title="Rating Changes Over Time" skeletonLines={6}>
            <RatingGraph data={ratingChanges} />
          </AsyncSection>

          <AsyncSection loading={subsLoading} error={subsError} title="Submission Activity Heatmap" skeletonLines={6}>
            <SubmissionHeatmap submissions={heatmapData} />
          </AsyncSection>

          <div className="grid md:grid-cols-3 gap-4">
            <AsyncSection loading={subsLoading} error={subsError} title="Languages Used">
              <LanguagesPie data={languagesData} />
            </AsyncSection>
            <AsyncSection loading={subsLoading} error={subsError} title="Verdicts Distribution">
              <VerdictPie data={verdictsData} />
            </AsyncSection>
            <AsyncSection loading={subsLoading} error={subsError} title="Tags Distribution">
              <TagsPie data={tagsData} />
            </AsyncSection>
          </div>

          <AsyncSection loading={subsLoading} error={subsError} title="Problems Solved by Rating" skeletonLines={6}>
            <RatingWiseBarChart data={ratingBarData} />
          </AsyncSection>
        </>
      )}
    </div>
  );
}
