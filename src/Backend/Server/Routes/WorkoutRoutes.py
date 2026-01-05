from fastapi import APIRouter, HTTPException, status
from typing import List
import logging
from datetime import datetime

from ...Core.Entity.WorkoutEntity import WorkoutEntity
from ...Core.DTO.WorkoutDTO import WorkoutCreateDTO, WorkoutUpdateDTO, WorkoutResponseDTO, WorkoutStartDTO, WorkoutEndDTO, WorkoutEndResponseDTO
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Core.Utils.xp_service import XPService

logger = logging.getLogger(__name__)
router = APIRouter()
workoutRepo = WorkoutRepository()
userAvatarRepo = UserAvatarRepository()
xpService = XPService(userAvatarRepo)

# Get all workouts
@router.get("/", response_model=List[WorkoutResponseDTO])
async def getAllWorkouts():
    try:
        workouts = workoutRepo.fetchAllWorkouts()
        return [WorkoutResponseDTO(
            workoutId=w.workout_id,
            userId=w.user_id,
            workoutTypeId=w.workout_type_id,
            start=w.start,
            end=w.end,
            deviceId=w.device_id
        ) for w in workouts]
    except Exception as e:
        logger.error(f"Error fetching all workouts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all workouts for a specific user
@router.get("/user/{user_id}", response_model=List[WorkoutResponseDTO])
async def getUserWorkouts(user_id: int):
    try:
        workouts = workoutRepo.fetchWorkoutsByUserId(user_id)
        return [WorkoutResponseDTO(
            workoutId=w.workout_id,
            userId=w.user_id,
            workoutTypeId=w.workout_type_id,
            start=w.start,
            end=w.end,
            deviceId=w.device_id
        ) for w in workouts]
    except Exception as e:
        logger.error(f"Error fetching workouts for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific workout session by ID
@router.get("/{workout_id}", response_model=WorkoutResponseDTO)
async def getWorkout(workout_id: int):
    try:
        workout = workoutRepo.fetchWorkoutById(workout_id)
        if not workout:
            raise HTTPException(status_code=404, detail="Workout not found")
        return WorkoutResponseDTO(
            workoutId=workout.workout_id,
            userId=workout.user_id,
            workoutTypeId=workout.workout_type_id,
            start=workout.start,
            end=workout.end,
            deviceId=workout.device_id,
            xpAwarded=workout.xp_awarded
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workout {workout_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Log a new workout session
@router.post("/", response_model=WorkoutResponseDTO, status_code=status.HTTP_201_CREATED)
async def createWorkout(workout_data: WorkoutCreateDTO):
    try:
        workout = WorkoutEntity(**workout_data.model_dump())
        created_workout = workoutRepo.createWorkout(workout)
        return WorkoutResponseDTO(
            workoutId=created_workout.workout_id,
            userId=created_workout.user_id,
            workoutTypeId=created_workout.workout_type_id,
            start=created_workout.start,
            end=created_workout.end,
            deviceId=created_workout.device_id
        )
    except Exception as e:
        logger.error(f"Error creating workout: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update a workout
@router.put("/{workout_id}", response_model=WorkoutResponseDTO)
async def updateWorkout(workout_id: int, workout_data: WorkoutUpdateDTO):
    try:
        existing_workout = workoutRepo.fetchWorkoutById(workout_id)
        if not existing_workout:
            raise HTTPException(status_code=404, detail="Workout not found")
        
        update_data = workout_data.model_dump(exclude_unset=True)
        workout_dict = existing_workout.__dict__.copy()
        workout_dict.update(update_data)
        
        workout = WorkoutEntity(**workout_dict)
        updated_workout = workoutRepo.updateWorkout(workout)
        return WorkoutResponseDTO(
            workoutId=updated_workout.workout_id,
            userId=updated_workout.user_id,
            workoutTypeId=updated_workout.workout_type_id,
            start=updated_workout.start,
            end=updated_workout.end,
            deviceId=updated_workout.device_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating workout {workout_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a workout
@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteWorkout(workout_id: int):
    try:
        workoutRepo.deleteWorkout(workout_id)
    except Exception as e:
        logger.error(f"Error deleting workout {workout_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Start a new workout (creates workout with end=null and random XP)
@router.post("/start", response_model=WorkoutResponseDTO, status_code=status.HTTP_201_CREATED)
async def startWorkout(workout_data: WorkoutStartDTO):
    try:
        # Use XP from frontend if provided, otherwise generate random
        if workout_data.xpAwarded is not None:
            xp_awarded = workout_data.xpAwarded
            logger.info(f"[WORKOUT] Using XP from frontend: {xp_awarded}")
        else:
            from ...Core.Utils.xp_service import generate_random_workout_xp
            xp_awarded = generate_random_workout_xp()
            logger.info(f"[WORKOUT] Generated random XP: {xp_awarded}")
        
        # Create workout with start=now() and end=null
        workout = WorkoutEntity(
            user_id=workout_data.userId,
            workout_type_id=workout_data.workoutTypeId,
            device_id=workout_data.deviceId,
            start=datetime.now(),
            end=None,
            xp_awarded=xp_awarded
        )
        created_workout = workoutRepo.createWorkout(workout)
        logger.info(f"[WORKOUT] Started workout {created_workout.workout_id} with {xp_awarded} XP")
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
        raise HTTPException(status_code=400, detail=str(e))

# End an active workout (updates end timestamp and awards XP)
@router.put("/{workout_id}/end", response_model=WorkoutEndResponseDTO)
async def endWorkout(workout_id: int):
    try:
        logger.info(f"[WORKOUT] Ending workout {workout_id}")
        
        existing_workout = workoutRepo.fetchWorkoutById(workout_id)
        if not existing_workout:
            raise HTTPException(status_code=404, detail="Workout not found")
        
        if existing_workout.end is not None:
            raise HTTPException(status_code=400, detail="Workout already ended")
        
        # Update workout with end=now()
        workout_dict = existing_workout.__dict__.copy()
        end_time = datetime.now()
        workout_dict['end'] = end_time
        
        workout = WorkoutEntity(**workout_dict)
        updated_workout = workoutRepo.updateWorkout(workout)
        
        # Use the XP that was generated when the workout started
        xp_awarded = updated_workout.xp_awarded or 0
        
        logger.info(f"[WORKOUT] Workout ended successfully")
        logger.info(f"[WORKOUT]   - Start: {updated_workout.start}")
        logger.info(f"[WORKOUT]   - End: {updated_workout.end}")
        logger.info(f"[WORKOUT]   - XP to award: {xp_awarded}")
        
        # Award XP to user avatar using XP service
        logger.info(f"[WORKOUT] Awarding {xp_awarded} XP to user {updated_workout.user_id}...")
        
        award_result = xpService.award_xp(updated_workout.user_id, xp_awarded)
        if award_result:
            logger.info(f"[WORKOUT] ✓ XP awarded successfully: {award_result}")
        else:
            logger.warning(f"[WORKOUT] ⚠️ XP award returned None - check XP service logs")
        
        return WorkoutEndResponseDTO(
            workoutId=updated_workout.workout_id,
            userId=updated_workout.user_id,
            workoutTypeId=updated_workout.workout_type_id,
            start=updated_workout.start,
            end=updated_workout.end,
            deviceId=updated_workout.device_id,
            xpAwarded=xp_awarded
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending workout {workout_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
