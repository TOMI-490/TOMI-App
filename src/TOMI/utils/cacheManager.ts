/**
 * Cache Manager
 * Central utility for clearing all data caches on logout or user change.
 */

import { invalidateUserCache } from '../hooks/useCurrentUser';
import { communityService } from '../services/community';
import { userAvatarService } from '../services/resources/userAvatar.service';

export function clearAllCaches(): void {
  console.log('[CacheManager] Clearing all caches');

  invalidateUserCache();
  communityService.invalidateAllCaches();
  userAvatarService.invalidateCache();
}
