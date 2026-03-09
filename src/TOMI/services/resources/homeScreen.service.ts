/**
 * HomeScreen Supabase Service
 *
 * Provides data access for Sections 5 & 6 of the HomeScreen:
 *   • Daily Quests (Section 5)
 *   • Achievements Preview (Section 6)
 *
 * If a required table does not yet exist in Supabase, the call will
 * gracefully return an empty array and log a TODO comment here so the
 * table can be created and seeded by the backend team.
 */

import { supabase } from '../core/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyQuest {
  /** Unique row ID */
  id: string;
  /** Human-readable task description */
  title: string;
  /** XP awarded on completion */
  xp_reward: number;
  /** Current progress value (e.g. 3 for "3 of 5 sets") */
  progress: number;
  /** Maximum value for 100% progress */
  max_value: number;
  /**
   * Lucide / Ionicons name used to render the quest icon.
   * Map these strings to components via ICON_REGISTRY in HomePage.tsx.
   */
  icon_name: string;
  /**
   * Tailwind-compatible color token for the quest card accent
   * (e.g. "bg-primary/20", "bg-warning/20", "bg-success/20").
   * Stored as a tailwind-class prefix so the card can resolve the right icon bg.
   */
  color_token: string;
  /** Whether the user has already completed this quest today */
  completed: boolean;
}

// TODO: create table: daily_quests
// Suggested schema:
//   id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4()
//   user_id     integer     NOT NULL REFERENCES users(user_id)
//   date        date        NOT NULL DEFAULT CURRENT_DATE
//   title       text        NOT NULL
//   xp_reward   integer     NOT NULL DEFAULT 50
//   progress    integer     NOT NULL DEFAULT 0
//   max_value   integer     NOT NULL DEFAULT 1
//   icon_name   text        NOT NULL DEFAULT 'barbell'
//   color_token text        NOT NULL DEFAULT 'primary'
//   completed   boolean     NOT NULL DEFAULT false
//   created_at  timestamptz NOT NULL DEFAULT now()

export interface Achievement {
  /** Unique row ID */
  id: string;
  /** Display name for the achievement */
  name: string;
  /**
   * Icon identifier — map via ICON_REGISTRY in HomePage.tsx.
   */
  icon_name: string;
  /** Whether the user has unlocked this achievement */
  unlocked: boolean;
  /**
   * Token that drives the icon container colour.
   * Matches TOMI_THEME keys: 'primary', 'warning', 'success', 'danger', etc.
   */
  color_token: string;
}

// TODO: create table: achievements
// Suggested schema:
//   id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4()
//   user_id     integer     NOT NULL REFERENCES users(user_id)
//   name        text        NOT NULL
//   icon_name   text        NOT NULL DEFAULT 'star'
//   unlocked    boolean     NOT NULL DEFAULT false
//   unlocked_at timestamptz
//   color_token text        NOT NULL DEFAULT 'primary'
//   created_at  timestamptz NOT NULL DEFAULT now()

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const homeScreenService = {
  /**
   * Fetch today's daily quests for the given user.
   *
   * SELECT * FROM daily_quests
   *   WHERE user_id = :userId AND date = CURRENT_DATE
   */
  async getDailyQuests(userId: number): Promise<DailyQuest[]> {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    if (error) {
      // Surface as an Error so the hook can show an inline warning
      throw new Error(`daily_quests: ${error.message}`);
    }

    return (data as DailyQuest[]) ?? [];
  },

  /**
   * Fetch the four most recently unlocked achievements for the given user.
   *
   * SELECT * FROM achievements
   *   WHERE user_id = :userId
   *   ORDER BY unlocked_at DESC
   *   LIMIT 4
   */
  async getAchievementsPreview(userId: number): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`achievements: ${error.message}`);
    }

    return (data as Achievement[]) ?? [];
  },
};
