from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.AvatarEntity import AvatarEntity
from ...Core.DTO.AvatarDTO import AvatarCreateDTO, AvatarResponseDTO
from ...Infrastructure.Repository.AvatarRepository import AvatarRepository

logger = logging.getLogger(__name__)
router = APIRouter()
avatarRepo = AvatarRepository()

# Get all available avatar templates
@router.get("/", response_model=List[AvatarResponseDTO])
async def getAllAvatars():
    try:
        avatars = avatarRepo.fetchAllAvatars()
        return [AvatarResponseDTO(**avatar.__dict__) for avatar in avatars]
    except Exception as e:
        logger.error(f"Error fetching avatars: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific avatar template by ID
@router.get("/{avatar_id}", response_model=AvatarResponseDTO)
async def getAvatar(avatar_id: int):
    try:
        avatar = avatarRepo.fetchAvatarById(avatar_id)
        if not avatar:
            raise HTTPException(status_code=404, detail="Avatar not found")
        return AvatarResponseDTO(**avatar.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching avatar {avatar_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new avatar template
@router.post("/", response_model=AvatarResponseDTO, status_code=status.HTTP_201_CREATED)
async def createAvatar(avatar_data: AvatarCreateDTO):
    try:
        avatar = AvatarEntity(**avatar_data.model_dump())
        created_avatar = avatarRepo.createAvatar(avatar)
        return AvatarResponseDTO(**created_avatar.__dict__)
    except Exception as e:
        logger.error(f"Error creating avatar: {e}")
        raise HTTPException(status_code=400, detail=str(e))
