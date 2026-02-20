/**
 * avatarStateStore.ts
 * Simple cross-screen signal to drive avatar animation state.
 * WorkoutSummaryScreen sets `pendingPostWorkout = true` before navigating home,
 * then HomePage reads & clears it to trigger the post-workout GIF.
 */

let pendingPostWorkout = false;

export const avatarStateStore = {
  /** Called by WorkoutSummaryScreen just before routing to home */
  triggerPostWorkout: () => {
    pendingPostWorkout = true;
  },

  /** Called by HomePage on mount / focus to consume the flag */
  consumePostWorkout: (): boolean => {
    if (pendingPostWorkout) {
      pendingPostWorkout = false;
      return true;
    }
    return false;
  },
};
