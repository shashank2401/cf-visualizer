// src/utils/cache.js
const CACHE_PREFIX = 'cf-visualizer-cache:';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

export function getFromCache(key) {
  const cacheKey = getCacheKey(key);
  const cachedItem = sessionStorage.getItem(cacheKey);

  if (!cachedItem) {
    return null;
  }

  try {
    const { data, timestamp } = JSON.parse(cachedItem);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      return data;
    }
    // Cache expired, remove it
    sessionStorage.removeItem(cacheKey);
    return null;
  } catch (e) {
    // Invalid JSON, remove it
    sessionStorage.removeItem(cacheKey);
    return null;
  }
}

export function setInCache(key, data) {
  const cacheKey = getCacheKey(key);
  const itemToCache = {
    data,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(cacheKey, JSON.stringify(itemToCache));
} 