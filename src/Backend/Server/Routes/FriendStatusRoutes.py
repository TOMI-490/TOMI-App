from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.FriendStatusEntity import FriendStatusEntity
from ...Core.DTO.FriendStatusDTO import FriendStatusResponseDTO
from ...Infrastructure.Repository.FriendStatusRepository import FriendStatusRepository

logger = logging.getLogger(__name__)
router = APIRouter()
friendStatusRepo = FriendStatusRepository()

# Get all friend status types (pending, accepted, blocked)
@router.get("/", response_model=List[FriendStatusResponseDTO])
async def getAllFriendStatuses():
    try:
        statuses = friendStatusRepo.fetchAllStatuses()
        return [FriendStatusResponseDTO(**s.__dict__) for s in statuses]
    except Exception as e:
        logger.error(f"Error fetching friend statuses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific friend status by ID
@router.get("/{status_id}", response_model=FriendStatusResponseDTO)
async def getFriendStatus(status_id: int):
    try:
        friendStatus = friendStatusRepo.fetchStatusById(status_id)
        if not friendStatus:
            raise HTTPException(status_code=404, detail="Friend status not found")
        return FriendStatusResponseDTO(**friendStatus.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching friend status {status_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
