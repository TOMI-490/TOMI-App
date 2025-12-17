from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.WorkoutTypeEntity import WorkoutTypeEntity
from ...Core.DTO.WorkoutTypeDTO import WorkoutTypeCreateDTO, WorkoutTypeUpdateDTO, WorkoutTypeResponseDTO
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

# Create a new workout type
@router.post("/", response_model=WorkoutTypeResponseDTO, status_code=status.HTTP_201_CREATED)
async def createWorkoutType(workout_type_data: WorkoutTypeCreateDTO):
    try:
        workout_type = WorkoutTypeEntity(**workout_type_data.model_dump())
        created_workout_type = workoutTypeRepo.createWorkoutType(workout_type)
        return WorkoutTypeResponseDTO(**created_workout_type.__dict__)
    except Exception as e:
        logger.error(f"Error creating workout type: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing workout type
@router.put("/{workout_type_id}", response_model=WorkoutTypeResponseDTO)
async def updateWorkoutType(workout_type_id: int, workout_type_data: WorkoutTypeUpdateDTO):
    try:
        existing_workout_type = workoutTypeRepo.fetchWorkoutTypeById(workout_type_id)
        if not existing_workout_type:
            raise HTTPException(status_code=404, detail="Workout type not found")
        
        update_data = workout_type_data.model_dump(exclude_unset=True)
        workout_type_dict = existing_workout_type.__dict__.copy()
        workout_type_dict.update(update_data)
        
        workout_type = WorkoutTypeEntity(**workout_type_dict)
        updated_workout_type = workoutTypeRepo.updateWorkoutType(workout_type)
        return WorkoutTypeResponseDTO(**updated_workout_type.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating workout type {workout_type_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a workout type
@router.delete("/{workout_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteWorkoutType(workout_type_id: int):
    try:
        workoutTypeRepo.deleteWorkoutType(workout_type_id)
    except Exception as e:
        logger.error(f"Error deleting workout type {workout_type_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
