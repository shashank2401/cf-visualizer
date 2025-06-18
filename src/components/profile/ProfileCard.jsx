import { FaUserCircle, FaMedal } from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import { MdStars } from "react-icons/md";

// Codeforces rating color mapping
function getRatingColor(rating = 0) {
  if (rating >= 4000) return "#ff0000"; // tourist/jiangly
  if (rating >= 3000) return "#ff0000"; // Legendary Grandmaster
  if (rating >= 2400) return "#ff0000"; // Grandmaster
  if (rating >= 2100) return "#ff8c00"; // Orange Master
  if (rating >= 1900) return "#aa00aa"; // Violet Candidate Master
  if (rating >= 1600) return "#0000ff"; // Blue Expert
  if (rating >= 1400) return "#03a89e"; // Cyan Specialist
  if (rating >= 1200) return "#008000"; // Green Pupil
  return "#808080"; // Gray Newbie
}

// Optionally, get rank badge background for special styling
function getRankBadgeStyle(rank = "", rating = 0) {
  if (rank === "legendary grandmaster" || rating >= 3000) {
    // Gradient for legendary grandmaster
    return "bg-gradient-to-r from-yellow-400 to-red-600 text-white";
  }
  // Otherwise, just use a border with the main color
  return "";
}

export default function ProfileCard({ user }) {
  if (!user) {
    // Optionally show a skeleton or placeholder
    return (
      <div className="w-full max-w-2xl mx-auto p-6 rounded-xl bg-white dark:bg-gray-900 shadow-md flex flex-col items-center animate-pulse">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 mb-2 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 mb-2 rounded"></div>
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
        <div className="flex gap-4">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Determine main color for handle, rating, and badges
  const ratingColor = getRatingColor(user.rating);
  const maxRatingColor = getRatingColor(user.maxRating);
  const rankBadgeStyle = getRankBadgeStyle(user.rank, user.rating);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-xl bg-white dark:bg-gray-900 shadow-md flex flex-col md:flex-row items-center gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.handle}
            className="w-24 h-24 rounded-full border-4"
            style={{ borderColor: ratingColor }}
          />
        ) : (
          <FaUserCircle className="w-24 h-24 text-gray-300 dark:text-gray-700" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col items-center md:items-start">
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold"
            style={{ color: ratingColor }}
          >
            {user.handle}
          </span>
          {user.rank && (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold capitalize border border-gray-300 dark:border-gray-700 ${rankBadgeStyle}`}
              style={
                !rankBadgeStyle
                  ? {
                      color: "#fff",
                      background: ratingColor,
                      borderColor: ratingColor,
                    }
                  : {}
              }
            >
              {user.rank}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <MdStars className="text-yellow-400" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Current Rating:
            <span
              className="ml-1 font-bold"
              style={{ color: ratingColor }}
            >
              {user.rating}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <FaMedal className="text-pink-500" />
          <span className="text-gray-600 dark:text-gray-300">
            Max Rating:
            <span
              className="ml-1 font-semibold"
              style={{ color: maxRatingColor }}
            >
              {user.maxRating}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <HiLightningBolt className="text-green-500" />
          <span className="text-gray-600 dark:text-gray-300">
            Max Rank:
            <span className="ml-1 font-semibold" style={{ color: maxRatingColor }}>
              {user.maxRank}
            </span>
          </span>
        </div>

        {user.organization && (
          <div className="mt-3 text-gray-500 dark:text-gray-400 text-sm">
            <span className="font-semibold">Organization:</span> {user.organization}
          </div>
        )}
        {user.city && (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            <span className="font-semibold">City:</span> {user.city}
          </div>
        )}
        {user.country && (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            <span className="font-semibold">Country:</span> {user.country}
          </div>
        )}
      </div>
    </div>
  );
}