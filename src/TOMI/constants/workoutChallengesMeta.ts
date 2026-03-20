/**
 * XP hints for daily challenges — aligned with WorkoutStartScreen WORKOUT_META.
 * Keys are lowercase workout type names from the API.
 */
export const WORKOUT_CHALLENGE_XP: Record<string, number> = {
  running: 85,
  walking: 60,
  cycling: 100,
  swimming: 90,
  'strength training': 120,
  yoga: 55,
  hiit: 95,
  dancing: 70,
  'rock climbing': 130,
  tennis: 95,
};

export function getChallengeXpForWorkoutName(name: string): number {
  const key = name.trim().toLowerCase();
  return WORKOUT_CHALLENGE_XP[key] ?? 70;
}
