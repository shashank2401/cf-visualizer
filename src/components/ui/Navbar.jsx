import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow">
      {/* Adjusted px for smaller screens, then scales up */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Title - Adjust font size and add right margin for spacing */}
          <Link
            to="/"
            className="
              text-base sm:text-xl font-bold /* Base is smaller, sm is larger */
              text-gray-900 dark:text-white
              mr-2 sm:mr-6 flex-shrink-0 whitespace-nowrap /* Adjust margin for sm and up */
            "
          >
            Codeforces Visualizer
          </Link>

          {/* Nav Links - Adjust gap for smaller screens and prevent wrapping */}
          <div className="flex gap-4 sm:gap-6"> {/* Reduced gap on smaller screens */}
            <Link
              to="/"
              className={`
                font-semibold transition-colors whitespace-nowrap
                text-sm sm:text-base /* Smaller font on very small screens, base from sm */
                ${
                  location.pathname === "/"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-200"
                }
                hover:underline
              `}
            >
              Single Profile
            </Link>
            <Link
              to="/compare"
              className={`
                font-semibold transition-colors whitespace-nowrap
                text-sm sm:text-base /* Smaller font on very small screens, base from sm */
                ${
                  location.pathname === "/compare"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-200"
                }
                hover:underline
              `}
            >
              Compare Profiles
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}