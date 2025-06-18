import { useEffect, useState } from "react";

// Client-side cache for useContests hook
const cache = new Map();
// Define how long entries are valid in the client-side cache (e.g., 10 minutes)
const CLIENT_CACHE_DURATION_MS = 10 * 60 * 1000;

// This variable stores a timestamp indicating when the client should retry after a 429 error
// It's declared outside the hook to persist across hook invocations within the same browser session.
let globalRetryAfter = 0; 

const CODEFORCES_API_BASE_URL = "https://codeforces.com/api";

const TARGET_API_URL_TEMPLATE = `${CODEFORCES_API_BASE_URL}/user.rating?handle=`;

export default function useContests(handle) {
  const [contests, setContests] = useState([]);
  const [ratingChanges, setRatingChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!handle) {
      setContests([]);
      setRatingChanges([]);
      setLoading(false);
      setError("");
      return;
    }

    const normalizedHandle = handle.toLowerCase();
    const cached = cache.get(normalizedHandle);

    // Check client-side cache for data and its freshness
    if (cached && (Date.now() - cached.timestamp < CLIENT_CACHE_DURATION_MS)) {
      setContests(cached.contests);
      setRatingChanges(cached.ratingChanges);
      setError(cached.error || "");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Check global retryAfter value before making a new request
        if (Date.now() < globalRetryAfter) {
          const timeLeft = globalRetryAfter - Date.now();
          // Inform the user they are rate-limited from the proxy
          setError(`Too many requests. Please wait ${Math.ceil(timeLeft / 1000)} seconds.`);
          setLoading(false);
          return; // Abort this fetch attempt until the retryAfter time passes
        }

        // --- CRITICAL CHANGE: Use the full external URL ---
        const url = `${TARGET_API_URL_TEMPLATE}${normalizedHandle}`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) { // Check for non-2xx status codes
            if (res.status === 429) {
                // If proxy sends a Retry-After header, use it; otherwise, default to 15 minutes (900 seconds)
                const retryAfterSeconds = res.headers.get('Retry-After') ? parseInt(res.headers.get('Retry-After')) : (15 * 60);
                globalRetryAfter = Date.now() + (retryAfterSeconds * 1000); // Update global retry timer
                throw new Error(`Too many requests. Please wait ${Math.ceil(retryAfterSeconds / 60)} minutes before trying again.`);
            }
            // For other non-OK statuses, try to parse JSON error or use status text
            let errorText = `HTTP error! status: ${res.status}`;
            try {
                const errorData = await res.json();
                errorText = errorData.comment || errorData.message || errorText;
            } catch (jsonError) {
                // If response is not JSON, use the status text
                errorText = res.statusText || errorText;
            }
            throw new Error(errorText);
        }

        const data = await res.json();

        // --- Adapt parsing logic based on your new anonymous API's response structure ---
        // Assuming Codeforces API 'user.rating' response structure:
        // { "status": "OK", "result": [{ contestId: "...", etc. }] }
        if (data.status === "OK") {
          const formatted = data.result.map(c => ({
            contestId: c.contestId,
            contestName: c.contestName,
            rank: c.rank,
            oldRating: c.oldRating,
            newRating: c.newRating,
            date: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10)
          }));

          // Store data in client-side cache with timestamp
          cache.set(normalizedHandle, {
            contests: formatted,
            ratingChanges: data.result, // `data.result` is already the raw rating changes
            error: null,
            timestamp: Date.now() // Store the timestamp
          });

          if (!cancelled) {
            setContests(formatted);
            setRatingChanges(data.result);
          }
        } else {
          const errorMessage = 
            data.comment && data.comment.includes("not found")
              ? `User '${normalizedHandle}' not found`
              : data.comment || "Unknown error";
          
          // Cache the error response with a timestamp as well
          cache.set(normalizedHandle, {
            contests: [],
            ratingChanges: [],
            error: errorMessage,
            timestamp: Date.now() // Store timestamp for errors too
          });
          throw new Error(errorMessage);
        }
      } catch (err) {
        if (!cancelled) {
          // If the error was not explicitly cached above (e.g., network error before parsing JSON), cache it here
          if (!cache.has(normalizedHandle) || cache.get(normalizedHandle).timestamp === undefined) {
              cache.set(normalizedHandle, {
                  contests: [],
                  ratingChanges: [],
                  error: err.message || "An unexpected error occurred.",
                  timestamp: Date.now()
              });
          }
          setError(err.message || "An unexpected error occurred.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [handle]);

  return { contests, ratingChanges, loading, error };
}