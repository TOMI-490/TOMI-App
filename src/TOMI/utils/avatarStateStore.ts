/**
 * avatarStateStore.ts
 * Cross-screen signal to drive avatar animation and carry post-workout data.
 * WorkoutSummaryScreen stores the earned XP/level before navigating home,
 * so HomePage can display updated values instantly (no waiting for API).
 */

interface PostWorkoutPayload {
  xpAwarded: number;
  newLevel: number;
  previousLevel: number;
  totalXp: number;
}

let pendingPostWorkout = false;
let postWorkoutData: PostWorkoutPayload | null = null;

export const avatarStateStore = {
  /** Called by WorkoutSummaryScreen just before routing to home */
  triggerPostWorkout: (payload?: PostWorkoutPayload) => {
    pendingPostWorkout = true;
    postWorkoutData = payload ?? null;
  },

  /** Called by HomePage on mount / focus to consume the flag */
  consumePostWorkout: (): boolean => {
    if (pendingPostWorkout) {
      pendingPostWorkout = false;
      return true;
    }
    return false;
  },

  /** Peek at post-workout data without clearing it */
  getPostWorkoutData: (): PostWorkoutPayload | null => postWorkoutData,

  /** Clear the data after it has been consumed */
  clearPostWorkoutData: () => { postWorkoutData = null; },
};
