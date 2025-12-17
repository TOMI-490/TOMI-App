from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.FriendStatusEntity import FriendStatusEntity
from ...Core.DTO.FriendStatusDTO import FriendStatusCreateDTO, FriendStatusUpdateDTO, FriendStatusResponseDTO
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

# Create a new friend status
@router.post("/", response_model=FriendStatusResponseDTO, status_code=status.HTTP_201_CREATED)
async def createFriendStatus(status_data: FriendStatusCreateDTO):
    try:
        status_entity = FriendStatusEntity(**status_data.model_dump())
        created_status = friendStatusRepo.createStatus(status_entity)
        return FriendStatusResponseDTO(**created_status.__dict__)
    except Exception as e:
        logger.error(f"Error creating friend status: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing friend status
@router.put("/{status_id}", response_model=FriendStatusResponseDTO)
async def updateFriendStatus(status_id: int, status_data: FriendStatusUpdateDTO):
    try:
        existing_status = friendStatusRepo.fetchStatusById(status_id)
        if not existing_status:
            raise HTTPException(status_code=404, detail="Friend status not found")
        
        update_data = status_data.model_dump(exclude_unset=True)
        status_dict = existing_status.__dict__.copy()
        status_dict.update(update_data)
        
        status_entity = FriendStatusEntity(**status_dict)
        updated_status = friendStatusRepo.updateStatus(status_entity)
        return FriendStatusResponseDTO(**updated_status.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating friend status {status_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a friend status
@router.delete("/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteFriendStatus(status_id: int):
    try:
        friendStatusRepo.deleteStatus(status_id)
    except Exception as e:
        logger.error(f"Error deleting friend status {status_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
