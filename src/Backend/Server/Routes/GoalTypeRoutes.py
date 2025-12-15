from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.GoalTypeEntity import GoalTypeEntity
from ...Core.DTO.GoalTypeDTO import GoalTypeResponseDTO
from ...Infrastructure.Repository.GoalTypeRepository import GoalTypeRepository

logger = logging.getLogger(__name__)
router = APIRouter()
goalTypeRepo = GoalTypeRepository()

# Get all available goal types (weight loss, muscle gain, etc.)
@router.get("/", response_model=List[GoalTypeResponseDTO])
async def getAllGoalTypes():
    try:
        goalTypes = goalTypeRepo.fetchAllGoalTypes()
        return [GoalTypeResponseDTO(**gt.__dict__) for gt in goalTypes]
    except Exception as e:
        logger.error(f"Error fetching goal types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific goal type by ID
@router.get("/{goal_type_id}", response_model=GoalTypeResponseDTO)
async def getGoalType(goal_type_id: int):
    try:
        goalType = goalTypeRepo.fetchGoalTypeById(goal_type_id)
        if not goalType:
            raise HTTPException(status_code=404, detail="Goal type not found")
        return GoalTypeResponseDTO(**goalType.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching goal type {goal_type_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
