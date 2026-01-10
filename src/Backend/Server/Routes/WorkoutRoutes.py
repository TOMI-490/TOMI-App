from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.DTO.WorkoutDTO import WorkoutCreateDTO, WorkoutUpdateDTO, WorkoutResponseDTO, WorkoutStartDTO, WorkoutEndDTO, WorkoutEndResponseDTO
from ...Core.Services.WorkoutService import WorkoutService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
workout_service = WorkoutService()

# Get all workouts
@router.get("/", response_model=List[WorkoutResponseDTO])
async def getAllWorkouts():
    try:
        return workout_service.get_all_workouts()
    except Exception as e:
        logger.error(f"Error fetching all workouts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all workouts for a specific user
@router.get("/user/{user_id}", response_model=List[WorkoutResponseDTO])
async def getUserWorkouts(user_id: int):
    try:
        return workout_service.get_user_workouts(user_id)
    except Exception as e:
        logger.error(f"Error fetching workouts for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific workout
@router.get("/{workout_id}", response_model=WorkoutResponseDTO)
async def getWorkoutById(workout_id: int):
    try:
        return workout_service.get_workout_by_id(workout_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching workout {workout_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Start a new workout
@router.post("/start", response_model=WorkoutResponseDTO, status_code=status.HTTP_201_CREATED)
async def startWorkout(workout: WorkoutStartDTO):
    try:
        return workout_service.start_workout(workout)
    except Exception as e:
        logger.error(f"Error starting workout: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# End a workout
@router.post("/{workout_id}/end", response_model=WorkoutEndResponseDTO)
async def endWorkout(workout_id: int, workout_data: WorkoutEndDTO = WorkoutEndDTO()):
    try:
        return workout_service.end_workout(workout_id, workout_data)
    except ValueError as e:
        status_code = 404 if "not found" in str(e).lower() else 400
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error ending workout {workout_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new workout (manual entry)
@router.post("/", response_model=WorkoutResponseDTO, status_code=status.HTTP_201_CREATED)
async def createWorkout(workout: WorkoutCreateDTO):
    try:
        return workout_service.create_workout(workout)
    except Exception as e:
        logger.error(f"Error creating workout: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing workout
@router.put("/{workout_id}", response_model=WorkoutResponseDTO)
async def updateWorkout(workout_id: int, workout: WorkoutUpdateDTO):
    try:
        return workout_service.update_workout(workout_id, workout)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating workout {workout_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a workout
@router.delete("/{workout_id}")
async def deleteWorkout(workout_id: int):
    try:
        return workout_service.delete_workout(workout_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting workout {workout_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
