from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.WorkoutTypeEntity import WorkoutTypeEntity
from ...Core.DTO.WorkoutTypeDTO import WorkoutTypeResponseDTO
from ...Infrastructure.Repository.WorkoutTypeRepository import WorkoutTypeRepository

logger = logging.getLogger(__name__)
router = APIRouter()
workoutTypeRepo = WorkoutTypeRepository()

# Get all available workout types (running, cycling, etc.)
@router.get("/", response_model=List[WorkoutTypeResponseDTO])
async def getAllWorkoutTypes():
    try:
        workoutTypes = workoutTypeRepo.fetchAllWorkoutTypes()
        return [WorkoutTypeResponseDTO(**wt.__dict__) for wt in workoutTypes]
    except Exception as e:
        logger.error(f"Error fetching workout types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific workout type by ID
@router.get("/{workout_type_id}", response_model=WorkoutTypeResponseDTO)
async def getWorkoutType(workout_type_id: int):
    try:
        workoutType = workoutTypeRepo.fetchWorkoutTypeById(workout_type_id)
        if not workoutType:
            raise HTTPException(status_code=404, detail="Workout type not found")
        return WorkoutTypeResponseDTO(**workoutType.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workout type {workout_type_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
