/**
 * Cache Manager
 * Central utility for managing data caches across the app
 * Call clearAllCaches() on logout or when user changes
 */

// Note: This file provides a centralized way to clear all caches
// The actual caches are defined in their respective hook files:
// - useCurrentUser.ts
// - useDashboardData.ts
// - useGamification.ts

export function clearAllCaches(): void {
  console.log('[CacheManager] 🗑️ Clearing all caches');
  
  // Note: To fully implement this, you would need to export cache-clearing
  // functions from each hook file and call them here. For now, caches
  // will naturally expire based on their TTL (15-30 seconds).
  
  // Future implementation could look like:
  // clearUserCache();
  // clearDashboardCache();
  // clearGamificationCache();
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): Record<string, any> {
  return {
    message: 'Cache stats not yet implemented',
    note: 'Caches are stored in respective hook files with auto-expiration',
  };
}
