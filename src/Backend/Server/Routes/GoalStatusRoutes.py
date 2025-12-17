from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.GoalStatusEntity import GoalStatusEntity
from ...Core.DTO.GoalStatusDTO import GoalStatusCreateDTO, GoalStatusUpdateDTO, GoalStatusResponseDTO
from ...Infrastructure.Repository.GoalStatusRepository import GoalStatusRepository

logger = logging.getLogger(__name__)
router = APIRouter()
goalStatusRepo = GoalStatusRepository()

# Get all goal status types (active, completed, abandoned)
@router.get("/", response_model=List[GoalStatusResponseDTO])
async def getAllGoalStatuses():
    try:
        statuses = goalStatusRepo.fetchAllStatuses()
        return [GoalStatusResponseDTO(**s.__dict__) for s in statuses]
    except Exception as e:
        logger.error(f"Error fetching goal statuses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific goal status by ID
@router.get("/{status_id}", response_model=GoalStatusResponseDTO)
async def getGoalStatus(status_id: int):
    try:
        goalStatus = goalStatusRepo.fetchStatusById(status_id)
        if not goalStatus:
            raise HTTPException(status_code=404, detail="Goal status not found")
        return GoalStatusResponseDTO(**goalStatus.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching goal status {status_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new goal status
@router.post("/", response_model=GoalStatusResponseDTO, status_code=status.HTTP_201_CREATED)
async def createGoalStatus(status_data: GoalStatusCreateDTO):
    try:
        status_entity = GoalStatusEntity(**status_data.model_dump())
        created_status = goalStatusRepo.createStatus(status_entity)
        return GoalStatusResponseDTO(**created_status.__dict__)
    except Exception as e:
        logger.error(f"Error creating goal status: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing goal status
@router.put("/{status_id}", response_model=GoalStatusResponseDTO)
async def updateGoalStatus(status_id: int, status_data: GoalStatusUpdateDTO):
    try:
        existing_status = goalStatusRepo.fetchStatusById(status_id)
        if not existing_status:
            raise HTTPException(status_code=404, detail="Goal status not found")
        
        update_data = status_data.model_dump(exclude_unset=True)
        status_dict = existing_status.__dict__.copy()
        status_dict.update(update_data)
        
        status_entity = GoalStatusEntity(**status_dict)
        updated_status = goalStatusRepo.updateStatus(status_entity)
        return GoalStatusResponseDTO(**updated_status.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating goal status {status_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a goal status
@router.delete("/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteGoalStatus(status_id: int):
    try:
        goalStatusRepo.deleteStatus(status_id)
    except Exception as e:
        logger.error(f"Error deleting goal status {status_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
