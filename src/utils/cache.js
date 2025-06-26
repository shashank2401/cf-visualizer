// src/utils/cache.js

const CACHE_PREFIX = 'cf-visualizer-cache:';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

export function getFromCache(key) {
  const cacheKey = getCacheKey(key);
  const cachedItem = localStorage.getItem(cacheKey);

  if (!cachedItem) {
    return null;
  }

  try {
    const { data, timestamp } = JSON.parse(cachedItem);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      return data;
    }
    // Cache expired, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (e) {
    // Invalid JSON, remove it
    localStorage.removeItem(cacheKey);
    return null;
  }
}

export function setInCache(key, data) {
  const cacheKey = getCacheKey(key);
  const itemToCache = {
    data,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(cacheKey, JSON.stringify(itemToCache));
  } catch (err) {
    // Could be quota exceeded — fail silently or log
    console.warn(`Failed to set cache for ${cacheKey}:`, err);
  }
}