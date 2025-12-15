from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.GoalStatusEntity import GoalStatusEntity
from ...Core.DTO.GoalStatusDTO import GoalStatusResponseDTO
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
