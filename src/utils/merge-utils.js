/**
 * Merges two tag count maps into an array of objects with counts for user1 and user2.
 * @param {Object} tags1 - tag -> count for user1
 * @param {Object} tags2 - tag -> count for user2
 * @returns {Array} - [{ tag, user1, user2 }, ...] sorted by total count descending
 */
export function mergeTags(tags1, tags2) {
  const allTags = new Set([...Object.keys(tags1), ...Object.keys(tags2)]);
  const merged = [];

  for (const tag of allTags) {
    merged.push({
      tag,
      user1: tags1[tag] || 0,
      user2: tags2[tag] || 0,
    });
  }

  // Sort descending by combined count
  merged.sort((a, b) => (b.user1 + b.user2) - (a.user1 + a.user2));

  return merged;
}