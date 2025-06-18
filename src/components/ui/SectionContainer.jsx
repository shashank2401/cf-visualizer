// src/components/ui/SectionContainer.jsx

import React from "react";

/**
 * SectionContainer
 * A reusable wrapper for visually grouping content sections.
 *
 * Props:
 * - children: ReactNode (required)
 * - className: string (optional) - extra Tailwind classes to customize the container
 * - title: string (optional) - section heading
 * - actions: ReactNode (optional) - right-aligned actions (buttons, etc.)
 */
export default function SectionContainer({ children, className = "", title, actions }) {
  return (
    <section className={`w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-4 mb-6 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}