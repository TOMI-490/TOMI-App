/**
 * useCurrentUser Hook
 * Resolves and manages the current authenticated user
 */

import { useState, useEffect } from 'react';
import { UserResponseDto } from '../models/dto/User.dto';
import { userService } from '../services/resources/user.service';

// DEV fallback email when no auth session exists
const DEV_DEFAULT_EMAIL = 'thomasmejia69@gmail.com';

export interface UseCurrentUserResult {
  user: UserResponseDto | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get the current user
 * 1. Try to get user by auth session (authId)
 * 2. DEV fallback: get user by default email
 */
export function useCurrentUser(authId?: string): UseCurrentUserResult {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    console.log('[useCurrentUser] 🔍 Starting user resolution with authId:', authId || 'none');
    try {
      setLoading(true);
      setError(null);

      let fetchedUser: UserResponseDto;

      if (authId) {
        // Try auth-based resolution
        console.log('[useCurrentUser] Attempting auth-based user fetch...');
        try {
          fetchedUser = await userService.getByAuthId(authId);
          console.log('[useCurrentUser] ✓ Auth-based fetch successful:', fetchedUser.email);
        } catch (authError) {
          console.warn('[useCurrentUser] ⚠️ Auth-based user fetch failed, falling back to email:', authError);
          // Fallback to email
          fetchedUser = await userService.getByEmail(DEV_DEFAULT_EMAIL);
          console.log('[useCurrentUser] ✓ Fallback fetch successful:', fetchedUser.email);
        }
      } else {
        // DEV fallback - use default email
        console.info('[useCurrentUser] 🛠️ No authId provided, using DEV fallback email:', DEV_DEFAULT_EMAIL);
        fetchedUser = await userService.getByEmail(DEV_DEFAULT_EMAIL);
        console.log('[useCurrentUser] ✓ DEV fallback fetch successful:', fetchedUser.email);
      }

      setUser(fetchedUser);
      console.log('[useCurrentUser] ✅ User set in state:', fetchedUser.userId, fetchedUser.email);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user');
      setError(error);
      console.error('[useCurrentUser] ❌ Error fetching user:', error);
      console.error('Error fetching current user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [authId]);

  return {
    user,
    loading,
    error,
    refresh: fetchUser,
  };
}

export default useCurrentUser;
