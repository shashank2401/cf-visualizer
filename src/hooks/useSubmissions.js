import { useEffect, useState } from "react";
import { getFromCache, setInCache } from "../utils/cache";

// This variable stores a timestamp indicating when the client should retry after a 429 error
// It's declared outside the hook to persist across hook invocations within the same browser session.
let globalRetryAfter = 0; 

const CODEFORCES_API_BASE_URL = "https://codeforces.com/api";

const SUBMISSIONS_COUNT = 2000;
const TARGET_API_URL_TEMPLATE = `${CODEFORCES_API_BASE_URL}/user.status?handle=`;

export default function useSubmissions(handle) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!handle) {
      setSubmissions([]);
      setLoading(false);
      setError("");
      return;
    }

    const normalizedHandle = handle.trim();
    const cached = getFromCache(`submissions:${normalizedHandle}`);

    // Check client-side cache for data
    if (cached) {
      setSubmissions(cached.data);
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
        const url = `${TARGET_API_URL_TEMPLATE}${normalizedHandle}&from=1&count=${SUBMISSIONS_COUNT}`;
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
        // Assuming Codeforces API 'user.status' response structure:
        // { "status": "OK", "result": [{ id: ..., problem: { name: ... }, verdict: ... }, ...] }
        if (data.status === "OK") {
          // Store data in client-side cache with timestamp
          setInCache(`submissions:${normalizedHandle}`, { data: data.result, error: null });
          if (!cancelled) setSubmissions(data.result);
        } else {
          const errorMessage = 
            data.comment && data.comment.includes("not found")
              ? `User '${normalizedHandle}' not found`
              : data.comment || "Failed to fetch submissions";

          // Cache the error response with a timestamp as well
          setInCache(`submissions:${normalizedHandle}`, { data: [], error: errorMessage });
          throw new Error(errorMessage);
        }
      } catch (err) {
        if (!cancelled) {
          // If the error was not explicitly cached above (e.g., network error before parsing JSON), cache it here
          if (!getFromCache(`submissions:${normalizedHandle}`)) {
              setInCache(`submissions:${normalizedHandle}`, {
                  data: [],
                  error: err.message || "An unexpected error occurred.",
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

  return { submissions, loading, error };
}