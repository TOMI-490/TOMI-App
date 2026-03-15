/**
 * useCurrentUser Hook
 * Resolves and manages the current authenticated user
 *
 * Uses stale-while-revalidate: cached data is shown instantly while
 * a background refresh fetches the latest from the API.
 */

import { useState, useEffect, useRef } from 'react';
import { UserResponseDto } from '../models/dto/User.dto';
import { userService } from '../services/resources/user.service';

const DEV_DEFAULT_EMAIL = 'thomasmejia69@gmail.com';

const userCache = new Map<string, { user: UserResponseDto; timestamp: number }>();
const CACHE_DURATION = 30_000; // 30 seconds

/** Mark cache as stale so the next read refreshes in background (data stays visible) */
export function invalidateUserCache() {
  userCache.forEach(entry => { entry.timestamp = 0; });
}

export interface UseCurrentUserResult {
  user: UserResponseDto | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCurrentUser(authId?: string): UseCurrentUserResult {
  const [user, setUser] = useState<UserResponseDto | null>(() => {
    const cached = userCache.get(authId || DEV_DEFAULT_EMAIL);
    return cached?.user ?? null;
  });
  const [loading, setLoading] = useState<boolean>(!user);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  const fetchUser = async (forceRefresh = false) => {
    const cacheKey = authId || DEV_DEFAULT_EMAIL;

    const cached = userCache.get(cacheKey);

    // Serve cached data immediately (stale or fresh)
    if (cached) {
      setUser(cached.user);
      if (!forceRefresh && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLoading(false);
        return;
      }
    }

    // Prevent duplicate concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // Only show loading spinner if there's nothing to display yet
    if (!cached) setLoading(true);

    try {
      setError(null);
      let fetchedUser: UserResponseDto;

      if (authId) {
        try {
          fetchedUser = await userService.getByAuthId(authId);
        } catch {
          fetchedUser = await userService.getByEmail(DEV_DEFAULT_EMAIL);
        }
      } else {
        fetchedUser = await userService.getByEmail(DEV_DEFAULT_EMAIL);
      }

      userCache.set(cacheKey, { user: fetchedUser, timestamp: Date.now() });
      setUser(fetchedUser);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch user');
      setError(e);
      console.error('[useCurrentUser] Error:', e);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => { fetchUser(); }, [authId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, loading, error, refresh: () => fetchUser(true) };
}

export default useCurrentUser;
