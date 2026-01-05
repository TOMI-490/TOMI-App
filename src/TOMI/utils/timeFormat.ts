/**
 * Time formatting utilities
 */

/**
 * Get a human-readable relative time string from a date
 * @param dateString - ISO date string
 * @param t - Translation function for 'ago' text
 * @returns Formatted relative time string (e.g., "5m ago", "2h ago", "3d ago")
 */
export const getRelativeTime = (dateString: string, t: (key: string) => string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ${t('home.ago')}`;
  } else if (diffHours < 24) {
    return `${diffHours}h ${t('home.ago')}`;
  } else if (diffDays === 1) {
    return `1d ${t('home.ago')}`;
  } else if (diffDays < 7) {
    return `${diffDays}d ${t('home.ago')}`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Get a greeting message based on the current time of day
 * @param t - Translation function for greeting keys
 * @returns Translated greeting string
 */
export const getGreeting = (t: (key: string) => string): string => {
  const hour = new Date().getHours();
  if (hour < 12) return t('home.goodMorning');
  if (hour < 18) return t('home.goodAfternoon');
  return t('home.goodEvening');
};

/**
 * Format duration in minutes to a readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
