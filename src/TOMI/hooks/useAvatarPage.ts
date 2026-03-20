/**
 * useAvatarPage Hook
 * Fetches the active user avatar with all stats and mood data for the Avatar page.
 * Uses the same stale-while-revalidate pattern as useDashboard / DataPreloader.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';
import { userAvatarService } from '../services/resources/userAvatar.service';
import { normalizeUserAvatarDto } from '../utils/normalizeUserAvatarDto';

const avatarPageCache = new Map<number, { data: UserAvatarResponseDto; timestamp: number }>();
const AVATAR_CACHE_DURATION_MS = 60_000;

/** Align with DataPreloader — warm cache so Avatar tab doesn't refetch immediately. */
export function populateAvatarPageCache(userId: number, data: UserAvatarResponseDto) {
  avatarPageCache.set(userId, { data: normalizeUserAvatarDto(data), timestamp: Date.now() });
}

export function invalidateAvatarPageCache(userId?: number) {
  if (userId != null) avatarPageCache.delete(userId);
  else avatarPageCache.clear();
}

export interface UseAvatarPageResult {
  avatar: UserAvatarResponseDto | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAvatarPage(userId: number | undefined): UseAvatarPageResult {
  const [avatar, setAvatar] = useState<UserAvatarResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  const fetchAvatar = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setAvatar(null);
      setLoading(false);
      return;
    }

    const cached = avatarPageCache.get(userId);

    if (cached) {
      setAvatar(cached.data);
      if (!forceRefresh && Date.now() - cached.timestamp < AVATAR_CACHE_DURATION_MS) {
        setLoading(false);
        return;
      }
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (!cached) setLoading(true);

    try {
      setError(null);
      if (__DEV__) {
        console.log('[useAvatarPage] 🐾 Fetching avatar for user:', userId);
      }
      const data = await userAvatarService.getByUserId(userId);
      avatarPageCache.set(userId, { data, timestamp: Date.now() });
      setAvatar(data);
      if (__DEV__) {
        console.log('[useAvatarPage] ✓ Avatar loaded:', data.nickname, 'Level', data.level);
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load avatar');
      setError(e);
      console.error('[useAvatarPage] ❌ Error:', e.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const refresh = useCallback(() => fetchAvatar(true), [fetchAvatar]);

  return { avatar, loading, error, refresh };
}
