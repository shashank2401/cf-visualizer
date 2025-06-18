import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Title */}
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Codeforces Visualizer
          </Link>

          {/* Nav Links */}
          <div className="flex gap-6">
            <Link
              to="/"
              className={`font-semibold transition-colors ${
                location.pathname === "/"
                  ? "text-blue-600"
                  : "text-gray-700 dark:text-gray-200"
              } hover:underline`}
            >
              Single Profile
            </Link>
            <Link
              to="/compare"
              className={`font-semibold transition-colors ${
                location.pathname === "/compare"
                  ? "text-blue-600"
                  : "text-gray-700 dark:text-gray-200"
              } hover:underline`}
            >
              Compare Profiles
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
