/**
 * Badge Translation Utility
 * Maps database badge names/achievements to translation keys
 */

type BadgeTranslationKey = 
  | 'firstSteps'
  | 'stepCounter'
  | 'weekWarrior'
  | 'monthMaster'
  | 'centuryClub'
  | 'marathonDistance'
  | 'level10Tomi'
  | 'workout10'
  | 'workout50'
  | 'workout100'
  | 'streak7'
  | 'streak30'
  | 'streak100';

/**
 * Normalize badge name to match translation key
 * Removes special characters, converts to camelCase
 */
function normalizeBadgeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .split(/\s+/) // Split by whitespace
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Map database badge names to translation keys
 * This handles various naming formats from the database
 */
const BADGE_NAME_MAP: Record<string, BadgeTranslationKey> = {
  // From database seed data
  'First Steps': 'firstSteps',
  'Step Counter': 'stepCounter',
  'Week Warrior': 'weekWarrior',
  'Month Master': 'monthMaster',
  'Century Club': 'centuryClub',
  'Marathon Distance': 'marathonDistance',
  'Level 10 TOMI': 'level10Tomi',
  '10 Workouts': 'workout10',
  '50 Workouts': 'workout50',
  '100 Workouts': 'workout100',
  '7-Day Streak': 'streak7',
  '30-Day Streak': 'streak30',
  '100-Day Streak': 'streak100',
};

/**
 * Map achievement IDs to translation keys
 */
const ACHIEVEMENT_MAP: Record<string, BadgeTranslationKey> = {
  'first_steps': 'firstSteps',
  'step_counter': 'stepCounter',
  'week_warrior': 'weekWarrior',
  'month_master': 'monthMaster',
  'century_club': 'centuryClub',
  'distance_marathon': 'marathonDistance',
  'tomi_level_10': 'level10Tomi',
  'workout_10': 'workout10',
  'workout_50': 'workout50',
  'workout_100': 'workout100',
  'streak_7': 'streak7',
  'streak_30': 'streak30',
  'streak_100': 'streak100',
};

/**
 * Get translation key for a badge
 * @param badge - Badge object with name and/or achievement field
 * @returns Translation key or null if not found
 */
export function getBadgeTranslationKey(
  badge: { name?: string; achievement?: string }
): BadgeTranslationKey | null {
  // Try achievement field first (more reliable)
  if (badge.achievement && ACHIEVEMENT_MAP[badge.achievement]) {
    return ACHIEVEMENT_MAP[badge.achievement];
  }

  // Try direct name mapping
  if (badge.name && BADGE_NAME_MAP[badge.name]) {
    return BADGE_NAME_MAP[badge.name];
  }

  // Try normalized name
  if (badge.name) {
    const normalized = normalizeBadgeName(badge.name);
    const key = Object.values(BADGE_NAME_MAP).find(
      (k) => k.toLowerCase() === normalized.toLowerCase()
    );
    if (key) {
      return key as BadgeTranslationKey;
    }
  }

  return null;
}

/**
 * Get full translation path for a badge name
 */
export function getBadgeNameTranslation(badge: { name?: string; achievement?: string }): string {
  const key = getBadgeTranslationKey(badge);
  return key ? `gamification.badges.${key}` : badge.name || 'Unknown Badge';
}

/**
 * Get full translation path for a badge description
 */
export function getBadgeDescTranslation(badge: { name?: string; achievement?: string }): string {
  const key = getBadgeTranslationKey(badge);
  return key ? `gamification.badges.${key}Desc` : '';
}

/**
 * Translate unit based on type
 */
export function getUnitTranslation(unit: string): string {
  const unitMap: Record<string, string> = {
    'workouts': 'gamification.units.workouts',
    'days': 'gamification.units.days',
    'level': 'gamification.units.level',
    'km': 'gamification.units.km',
    'steps': 'gamification.units.steps',
    'minutes': 'gamification.units.minutes',
  };

  return unitMap[unit.toLowerCase()] || unit;
}
