// src/hooks/useBatchUserData.js

import { useEffect, useState, useRef } from "react";
import { getFromCache, setInCache } from "../utils/cache";

const API = "https://codeforces.com/api/user.info?handles=";

export default function useBatchUserData(handles = []) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const didFetchRef = useRef(false);
  const lastKeyRef = useRef(""); // remember last handles key

  useEffect(() => {
    const joinedHandles = handles.join(";");

    // Allow refetching if handles changed
    if (joinedHandles !== lastKeyRef.current) {
      didFetchRef.current = false;
      lastKeyRef.current = joinedHandles;
    }

    if (handles.length === 0) {
      setUsers([]);
      return;
    }

    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const cacheKey = `batch-user:${joinedHandles}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      setUsers(cached);
      return setLoading(false);
    }

    setLoading(true);
    fetch(API + joinedHandles)
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== "OK") {
          throw new Error(data.comment || "Failed to fetch users");
        }

        const result = data.result.map((u) => ({
          handle: u.handle,
          rating: u.rating || 0,
          maxRating: u.maxRating || 0,
          avatar: u.titlePhoto,
          rank: u.rank,
          maxRank: u.maxRank,
        }));

        setInCache(cacheKey, result);
        setUsers(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [handles.join(";")]);

  return { users, loading, error };
}