import type { WorkoutTypeResponseDto } from '../models/dto/WorkoutType.dto';
import type { DailyQuest } from '../services/resources/homeScreen.service';
import { getChallengeXpForWorkoutName } from '../constants/workoutChallengesMeta';

/** Local calendar date YYYY-MM-DD */
export function todayLocalYyyyMmDd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic shuffle (LCG) so the same user sees the same 3 types on the same day. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  for (let i = arr.length - 1; i > 0; i--) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickDailyWorkoutTypes(
  types: WorkoutTypeResponseDto[],
  userId: number,
  dayKey: string,
  count = 3,
): WorkoutTypeResponseDto[] {
  if (!types.length) return [];
  const seed = hashString(`tomi-daily|${dayKey}|${userId}`);
  const shuffled = seededShuffle(types, seed);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Map workout name → icon key used by daily challenge UI (ICON_REGISTRY). */
export function workoutNameToQuestIconKey(typeName: string): string {
  const l = typeName.toLowerCase();
  if (l.includes('walk')) return 'walk';
  if (l.includes('run')) return 'run';
  if (l.includes('cycl') || l.includes('bike')) return 'medal';
  if (l.includes('swim')) return 'medal';
  if (l.includes('yoga')) return 'heart';
  if (l.includes('strength') || l.includes('weight')) return 'dumbbell';
  if (l.includes('hiit') || l.includes('interval')) return 'zap';
  if (l.includes('danc')) return 'star';
  if (l.includes('tennis') || l.includes('box')) return 'trophy';
  return 'barbell';
}

/** Theme color token for quest accent. */
export function workoutNameToColorToken(typeName: string): 'primary' | 'secondary' | 'warning' | 'success' | 'danger' {
  const l = typeName.toLowerCase();
  if (l.includes('run') || l.includes('hiit')) return 'primary';
  if (l.includes('swim') || l.includes('yoga')) return 'secondary';
  if (l.includes('strength') || l.includes('cycl')) return 'warning';
  if (l.includes('walk')) return 'success';
  return 'danger';
}

export function buildDailyQuestsFromTypes(
  selectedTypes: WorkoutTypeResponseDto[],
  completedTypeNamesNormalized: Set<string>,
  dayKey: string,
): DailyQuest[] {
  return selectedTypes.map((wt) => {
    const completed = completedTypeNamesNormalized.has(wt.name.trim().toLowerCase());
    const xp = getChallengeXpForWorkoutName(wt.name);
    const desc = (wt.description || '').trim();
    const subtitle =
      desc.length > 0
        ? desc.length > 90
          ? `${desc.slice(0, 87)}…`
          : desc
        : 'Complete one session today';

    return {
      id: `daily-${wt.workoutTypeId}-${dayKey}`,
      title: `Daily: ${wt.name}`,
      subtitle,
      xp_reward: xp,
      progress: completed ? 1 : 0,
      max_value: 1,
      icon_name: workoutNameToQuestIconKey(wt.name),
      color_token: workoutNameToColorToken(wt.name),
      completed,
      workoutTypeId: wt.workoutTypeId,
    };
  });
}
