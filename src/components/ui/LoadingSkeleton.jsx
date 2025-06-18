// src/components/ui/LoadingSkeleton.jsx

import React from "react";

/**
 * LoadingSkeleton
 * A generic skeleton loader for cards, sections, or lists.
 *
 * Props:
 * - lines: number (optional) - number of skeleton lines/blocks to show (default: 3)
 * - className: string (optional) - extra Tailwind classes
 * - rounded: string (optional) - Tailwind rounded class (default: "rounded-lg")
 * - height: string (optional) - Tailwind height class for lines (default: "h-4")
 */
export default function LoadingSkeleton({
  lines = 3,
  className = "",
  rounded = "rounded-lg",
  height = "h-4",
}) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 dark:bg-gray-800 ${rounded} ${height} w-full`}
        />
      ))}
    </div>
  );
}