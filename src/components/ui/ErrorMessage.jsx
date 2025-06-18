// src/components/ui/ErrorMessage.jsx

import { MdErrorOutline } from "react-icons/md";

/**
 * ErrorMessage
 * Props:
 * - message: string (required) - the error message to display
 * - className: string (optional) - extra Tailwind classes
 */
export default function ErrorMessage({ message, className = "" }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg shadow-sm mb-4 ${className}`}
      role="alert"
    >
      <MdErrorOutline className="text-2xl" />
      <span className="font-medium">{message}</span>
    </div>
  );
}