/**
 * Generic TTL cache for API responses.
 *
 * Returns stale data instantly while refreshing in the background,
 * eliminating loading spinners on subsequent visits.
 *
 * Usage:
 *   const friendsCache = createAPICache<FriendListItem[]>(60_000);
 *   const data = friendsCache.get('user:42');
 *   friendsCache.set('user:42', freshData);
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface APICache<T> {
  get: (key: string) => T | undefined;
  getFresh: (key: string) => T | undefined;
  set: (key: string, data: T) => void;
  isStale: (key: string) => boolean;
  invalidate: (key: string) => void;
  clear: () => void;
}

export function createAPICache<T>(ttlMs: number): APICache<T> {
  const store = new Map<string, CacheEntry<T>>();

  return {
    /** Returns cached data regardless of staleness (for instant display). */
    get(key: string): T | undefined {
      return store.get(key)?.data;
    },

    /** Returns cached data only if it's still fresh. */
    getFresh(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() - entry.timestamp > ttlMs) return undefined;
      return entry.data;
    },

    set(key: string, data: T) {
      store.set(key, { data, timestamp: Date.now() });
    },

    isStale(key: string): boolean {
      const entry = store.get(key);
      if (!entry) return true;
      return Date.now() - entry.timestamp > ttlMs;
    },

    /** Marks a key as stale so the next read triggers a refresh, but data is still served. */
    invalidate(key: string) {
      const entry = store.get(key);
      if (entry) entry.timestamp = 0;
    },

    clear() {
      store.clear();
    },
  };
}

/**
 * Wraps an async fetcher with stale-while-revalidate logic.
 *
 * - If fresh cache exists, returns it immediately (no network call).
 * - If stale cache exists, returns it immediately AND starts a background refresh.
 * - If no cache, awaits the fetch.
 *
 * @param cache   The APICache instance
 * @param key     Cache key
 * @param fetcher Async function that returns fresh data
 * @param onUpdate Called with fresh data after a background refresh completes
 */
export async function fetchWithCache<T>(
  cache: APICache<T>,
  key: string,
  fetcher: () => Promise<T>,
  onUpdate?: (data: T) => void,
): Promise<T> {
  const fresh = cache.getFresh(key);
  if (fresh !== undefined) return fresh;

  const stale = cache.get(key);
  if (stale !== undefined) {
    // Background refresh — don't await
    fetcher()
      .then((data) => {
        cache.set(key, data);
        onUpdate?.(data);
      })
      .catch(() => {});
    return stale;
  }

  // No cache at all — must await
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
