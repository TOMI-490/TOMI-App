/**
 * usePastWorkouts Hook
 * Fetches workout history with workout type details
 */

import { useState, useEffect } from 'react';
import { WorkoutResponseDto } from '../models/dto/Workout.dto';
import { WorkoutTypeResponseDto } from '../models/dto/WorkoutType.dto';
import { workoutService } from '../services/resources/workout.service';
import { workoutTypeService } from '../services/resources/workoutType.service';

export interface EnrichedWorkout extends WorkoutResponseDto {
  workoutTypeName?: string;
  workoutTypeDescription?: string;
  durationMinutes: number;
}

export interface UsePastWorkoutsResult {
  workouts: EnrichedWorkout[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch past workouts with enriched workout type information
 */
export function usePastWorkouts(userId?: number, limit: number = 10): UsePastWorkoutsResult {
  const [workouts, setWorkouts] = useState<EnrichedWorkout[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkouts = async () => {
    if (!userId) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all workouts and workout types
      const [allWorkouts, workoutTypes] = await Promise.all([
        workoutService.getAll(),
        workoutTypeService.getAll(),
      ]);

      // Filter by user and sort by start date (most recent first)
      const userWorkouts = allWorkouts
        .filter((w) => w.userId === userId)
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
        .slice(0, limit);

      // Create a map of workout types for quick lookup
      const workoutTypeMap = new Map<number, WorkoutTypeResponseDto>();
      workoutTypes.forEach((type) => {
        workoutTypeMap.set(type.workoutTypeId, type);
      });

      // Enrich workouts with workout type information
      const enrichedWorkouts: EnrichedWorkout[] = userWorkouts.map((workout) => {
        const workoutType = workoutTypeMap.get(workout.workoutTypeId);
        const durationMinutes = Math.round(
          (new Date(workout.end).getTime() - new Date(workout.start).getTime()) / 60000
        );

        return {
          ...workout,
          workoutTypeName: workoutType?.name || `Workout #${workout.workoutTypeId}`,
          workoutTypeDescription: workoutType?.description,
          durationMinutes,
        };
      });

      setWorkouts(enrichedWorkouts);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch workouts');
      setError(error);
      console.error('Error fetching past workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit]);

  return {
    workouts,
    loading,
    error,
    refresh: fetchWorkouts,
  };
}
