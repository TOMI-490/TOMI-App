import { supabase } from './core/supabase';
import { sensorDataDb } from './localDatabase/localDb';
import { processWorkout } from '../utils/sensorProcessing';

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export const finalizeWorkout = async (
  workoutId: number,
  locations: LocationPoint[],  // passed in from LiveWorkoutScreen state
  elapsedSeconds: number,      // passed in from LiveWorkoutScreen state
  includeDistance: boolean
) => {
  // 1. Fetch raw sensor readings from SQLite
  const rawReadings = sensorDataDb.getByWorkout(workoutId) as any[];
  if (!rawReadings.length) throw new Error('No sensor readings found for this workout');

  // 2. Process into summary
  const summary = processWorkout(
    workoutId,
    rawReadings,
    locations,
    elapsedSeconds,
    includeDistance
  );

  // 3. Upload summary to Supabase
  const { error } = await supabase
    .from('workout_summaries')
    .insert(summary);

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  // 4. Delete raw data only after confirmed upload
  sensorDataDb.deleteByWorkout(workoutId);

  console.log(`✅ Workout ${workoutId} finalized and raw data cleared`);
  return summary;
};