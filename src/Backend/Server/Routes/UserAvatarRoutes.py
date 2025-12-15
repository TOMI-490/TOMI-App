from fastapi import APIRouter, HTTPException, status
import logging

from ...Core.Entity.UserAvatarEntity import UserAvatarEntity
from ...Core.DTO.UserAvatarDTO import UserAvatarCreateDTO, UserAvatarUpdateDTO, UserAvatarResponseDTO
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository

logger = logging.getLogger(__name__)
router = APIRouter()
userAvatarRepo = UserAvatarRepository()

# Get the active avatar for a specific user
@router.get("/user/{user_id}", response_model=UserAvatarResponseDTO)
async def getUserAvatar(user_id: int):
    try:
        avatar = userAvatarRepo.fetchAvatarByUserId(user_id)
        if not avatar:
            raise HTTPException(status_code=404, detail="User avatar not found")
        return UserAvatarResponseDTO(**avatar.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching avatar for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new user avatar instance
@router.post("/", response_model=UserAvatarResponseDTO, status_code=status.HTTP_201_CREATED)
async def createUserAvatar(avatar_data: UserAvatarCreateDTO):
    try:
        avatar = UserAvatarEntity(**avatar_data.model_dump())
        created_avatar = userAvatarRepo.createUserAvatar(avatar)
        return UserAvatarResponseDTO(**created_avatar.__dict__)
    except Exception as e:
        logger.error(f"Error creating user avatar: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update avatar stats like XP, level, and mood
@router.put("/{avatar_id}", response_model=UserAvatarResponseDTO)
async def updateUserAvatar(avatar_id: int, avatar_data: UserAvatarUpdateDTO):
    try:
        # Fetch existing avatar
        existing_avatar = userAvatarRepo.fetchAvatarById(avatar_id)
        if not existing_avatar:
            raise HTTPException(status_code=404, detail="User avatar not found")
        
        update_data = avatar_data.model_dump(exclude_unset=True)
        avatar_dict = existing_avatar.__dict__.copy()
        avatar_dict.update(update_data)
        
        avatar = UserAvatarEntity(**avatar_dict)
        updated_avatar = userAvatarRepo.updateUserAvatar(avatar)
        return UserAvatarResponseDTO(**updated_avatar.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating avatar {avatar_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
