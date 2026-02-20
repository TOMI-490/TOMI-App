/**
 * useAvatarPage Hook
 * Fetches the active user avatar with all stats and mood data for the Avatar page.
 * Re-uses the dashboard tomi data (already cached) and supplements with a direct
 * userAvatar fetch when a forced refresh is needed.
 */

import { useState, useEffect, useCallback } from 'react';
import { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';
import { userAvatarService } from '../services/resources/userAvatar.service';

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

  const fetch = useCallback(async () => {
    if (!userId) {
      setAvatar(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('[useAvatarPage] 🐾 Fetching avatar for user:', userId);
      const data = await userAvatarService.getByUserId(userId);
      console.log('[useAvatarPage] ✓ Avatar loaded:', data.nickname, 'Level', data.level);
      setAvatar(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load avatar');
      setError(e);
      console.error('[useAvatarPage] ❌ Error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { avatar, loading, error, refresh: fetch };
}
