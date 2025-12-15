from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.WorkoutEntity import WorkoutEntity
from ...Core.DTO.WorkoutDTO import WorkoutCreateDTO, WorkoutResponseDTO
from ...Infrastructure.Repository.WorkoutRepository import WorkoutRepository

logger = logging.getLogger(__name__)
router = APIRouter()
workoutRepo = WorkoutRepository()

# Get all workouts for a specific user
@router.get("/user/{user_id}", response_model=List[WorkoutResponseDTO])
async def getUserWorkouts(user_id: int):
    try:
        workouts = workoutRepo.fetchWorkoutsByUserId(user_id)
        return [WorkoutResponseDTO(**workout.__dict__) for workout in workouts]
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
        return WorkoutResponseDTO(**workout.__dict__)
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
        return WorkoutResponseDTO(**created_workout.__dict__)
    except Exception as e:
        logger.error(f"Error creating workout: {e}")
        raise HTTPException(status_code=400, detail=str(e))
