from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.GoalTypeEntity import GoalTypeEntity
from ...Core.DTO.GoalTypeDTO import GoalTypeCreateDTO, GoalTypeUpdateDTO, GoalTypeResponseDTO
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

# Create a new goal type
@router.post("/", response_model=GoalTypeResponseDTO, status_code=status.HTTP_201_CREATED)
async def createGoalType(goal_type_data: GoalTypeCreateDTO):
    try:
        goal_type = GoalTypeEntity(**goal_type_data.model_dump())
        created_goal_type = goalTypeRepo.createGoalType(goal_type)
        return GoalTypeResponseDTO(**created_goal_type.__dict__)
    except Exception as e:
        logger.error(f"Error creating goal type: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing goal type
@router.put("/{goal_type_id}", response_model=GoalTypeResponseDTO)
async def updateGoalType(goal_type_id: int, goal_type_data: GoalTypeUpdateDTO):
    try:
        existing_goal_type = goalTypeRepo.fetchGoalTypeById(goal_type_id)
        if not existing_goal_type:
            raise HTTPException(status_code=404, detail="Goal type not found")
        
        update_data = goal_type_data.model_dump(exclude_unset=True)
        goal_type_dict = existing_goal_type.__dict__.copy()
        goal_type_dict.update(update_data)
        
        goal_type = GoalTypeEntity(**goal_type_dict)
        updated_goal_type = goalTypeRepo.updateGoalType(goal_type)
        return GoalTypeResponseDTO(**updated_goal_type.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating goal type {goal_type_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a goal type
@router.delete("/{goal_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteGoalType(goal_type_id: int):
    try:
        goalTypeRepo.deleteGoalType(goal_type_id)
    except Exception as e:
        logger.error(f"Error deleting goal type {goal_type_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
