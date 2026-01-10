from typing import List, Optional
from datetime import datetime
import logging

from ..Entity.WorkoutEntity import WorkoutEntity
from ..DTO.WorkoutDTO import WorkoutCreateDTO, WorkoutUpdateDTO, WorkoutResponseDTO, WorkoutStartDTO, WorkoutEndDTO, WorkoutEndResponseDTO
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ..Utils.xp_utils import XPService

logger = logging.getLogger(__name__)

class WorkoutService:
    def __init__(self):
        self.workout_repo = WorkoutRepository()
        self.user_avatar_repo = UserAvatarRepository()
        self.xp_service = XPService(self.user_avatar_repo)
    
    def get_all_workouts(self) -> List[WorkoutResponseDTO]:
        """Get all workouts."""
        try:
            workouts = self.workout_repo.fetchAllWorkouts()
            return [WorkoutResponseDTO(
                workoutId=w.workout_id,
                userId=w.user_id,
                workoutTypeId=w.workout_type_id,
                start=w.start,
                end=w.end,
                deviceId=w.device_id,
                xpAwarded=w.xp_awarded
            ) for w in workouts]
        except Exception as e:
            logger.error(f"Error fetching all workouts: {e}")
            raise
    
    def get_user_workouts(self, user_id: int) -> List[WorkoutResponseDTO]:
        """Get all workouts for a specific user."""
        try:
            workouts = self.workout_repo.fetchWorkoutsByUserId(user_id)
            return [WorkoutResponseDTO(
                workoutId=w.workout_id,
                userId=w.user_id,
                workoutTypeId=w.workout_type_id,
                start=w.start,
                end=w.end,
                deviceId=w.device_id,
                xpAwarded=w.xp_awarded
            ) for w in workouts]
        except Exception as e:
            logger.error(f"Error fetching workouts for user {user_id}: {e}")
            raise
    
    def get_workout_by_id(self, workout_id: int) -> WorkoutResponseDTO:
        """Get a specific workout by ID."""
        try:
            workout = self.workout_repo.fetchWorkoutById(workout_id)
            if not workout:
                raise ValueError("Workout not found")
            return WorkoutResponseDTO(
                workoutId=workout.workout_id,
                userId=workout.user_id,
                workoutTypeId=workout.workout_type_id,
                start=workout.start,
                end=workout.end,
                deviceId=workout.device_id,
                xpAwarded=workout.xp_awarded
            )
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error fetching workout {workout_id}: {e}")
            raise
    
    def start_workout(self, workout_data: WorkoutStartDTO) -> WorkoutResponseDTO:
        """Start a new workout session."""
        try:
            workout_entity = WorkoutEntity(
                user_id=workout_data.userId,
                workout_type_id=workout_data.workoutTypeId,
                start=datetime.now(),
                device_id=workout_data.deviceId if hasattr(workout_data, 'deviceId') else None
            )
            created_workout = self.workout_repo.createWorkout(workout_entity)
            return WorkoutResponseDTO(
                workoutId=created_workout.workout_id,
                userId=created_workout.user_id,
                workoutTypeId=created_workout.workout_type_id,
                start=created_workout.start,
                end=created_workout.end,
                deviceId=created_workout.device_id,
                xpAwarded=created_workout.xp_awarded
            )
        except Exception as e:
            logger.error(f"Error starting workout: {e}")
            raise
    
    def end_workout(self, workout_id: int, workout_data: WorkoutEndDTO) -> WorkoutEndResponseDTO:
        """End a workout session and calculate XP."""
        try:
            # Get the workout
            workout = self.workout_repo.fetchWorkoutById(workout_id)
            if not workout:
                raise ValueError("Workout not found")
            
            # Check if workout is already ended
            if workout.end:
                raise ValueError("Workout already ended")
            
            # Update workout with end time
            workout.end = datetime.now()
            
            # Calculate duration and XP
            duration_minutes = 0
            if workout.start:
                duration_seconds = (workout.end - workout.start).total_seconds()
                duration_minutes = int(duration_seconds / 60)
            
            # Award XP based on duration (example: 1 XP per minute)
            xp_awarded = duration_minutes
            workout.xp_awarded = xp_awarded
            
            # Update workout
            updated_workout = self.workout_repo.updateWorkout(workout)
            
            # Award XP to user's avatar
            try:
                self.xp_service.awardXP(workout.user_id, xp_awarded, "workout_completion")
                logger.info(f"Awarded {xp_awarded} XP to user {workout.user_id} for workout completion")
            except Exception as e:
                logger.warning(f"Failed to award XP to user {workout.user_id}: {e}")
            
            return WorkoutEndResponseDTO(
                workoutId=updated_workout.workout_id,
                userId=updated_workout.user_id,
                workoutTypeId=updated_workout.workout_type_id,
                start=updated_workout.start,
                end=updated_workout.end,
                durationMinutes=duration_minutes,
                xpAwarded=xp_awarded,
                deviceId=updated_workout.device_id
            )
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error ending workout {workout_id}: {e}")
            raise
    
    def create_workout(self, workout_data: WorkoutCreateDTO) -> WorkoutResponseDTO:
        """Create a new workout (for manual entry)."""
        try:
            workout_entity = WorkoutEntity(
                user_id=workout_data.userId,
                workout_type_id=workout_data.workoutTypeId,
                start=workout_data.start if hasattr(workout_data, 'start') else datetime.now(),
                end=workout_data.end if hasattr(workout_data, 'end') else None,
                device_id=workout_data.deviceId if hasattr(workout_data, 'deviceId') else None,
                xp_awarded=workout_data.xpAwarded if hasattr(workout_data, 'xpAwarded') else None
            )
            created_workout = self.workout_repo.createWorkout(workout_entity)
            return WorkoutResponseDTO(
                workoutId=created_workout.workout_id,
                userId=created_workout.user_id,
                workoutTypeId=created_workout.workout_type_id,
                start=created_workout.start,
                end=created_workout.end,
                deviceId=created_workout.device_id,
                xpAwarded=created_workout.xp_awarded
            )
        except Exception as e:
            logger.error(f"Error creating workout: {e}")
            raise
    
    def update_workout(self, workout_id: int, workout_data: WorkoutUpdateDTO) -> WorkoutResponseDTO:
        """Update an existing workout."""
        try:
            workout = self.workout_repo.fetchWorkoutById(workout_id)
            if not workout:
                raise ValueError("Workout not found")
            
            # Update fields
            if hasattr(workout_data, 'workoutTypeId'):
                workout.workout_type_id = workout_data.workoutTypeId
            if hasattr(workout_data, 'start'):
                workout.start = workout_data.start
            if hasattr(workout_data, 'end'):
                workout.end = workout_data.end
            if hasattr(workout_data, 'deviceId'):
                workout.device_id = workout_data.deviceId
            if hasattr(workout_data, 'xpAwarded'):
                workout.xp_awarded = workout_data.xpAwarded
            
            updated_workout = self.workout_repo.updateWorkout(workout)
            return WorkoutResponseDTO(
                workoutId=updated_workout.workout_id,
                userId=updated_workout.user_id,
                workoutTypeId=updated_workout.workout_type_id,
                start=updated_workout.start,
                end=updated_workout.end,
                deviceId=updated_workout.device_id,
                xpAwarded=updated_workout.xp_awarded
            )
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating workout {workout_id}: {e}")
            raise
    
    def delete_workout(self, workout_id: int) -> dict:
        """Delete a workout."""
        try:
            workout = self.workout_repo.fetchWorkoutById(workout_id)
            if not workout:
                raise ValueError("Workout not found")
            
            self.workout_repo.deleteWorkout(workout_id)
            return {"message": "Workout deleted successfully"}
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error deleting workout {workout_id}: {e}")
            raise