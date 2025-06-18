// src/components/profile/ProfileHeader.jsx

import { FaUserAlt } from "react-icons/fa";

export default function ProfileHeader({ handle, tagline }) {
  return (
    <div className="w-full max-w-2xl mx-auto flex items-center gap-3 mb-6 mt-2">
      <div className="flex-shrink-0">
        <FaUserAlt className="text-blue-600 dark:text-blue-400 text-2xl" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          {handle ? `${handle}'s Codeforces Profile` : "Codeforces Profile"}
        </h1>
        {tagline && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}