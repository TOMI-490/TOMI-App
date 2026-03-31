from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List
import logging

from ...Core.Entity.UserAvatarEntity import UserAvatarEntity
from ...Core.DTO.UserAvatarDTO import UserAvatarCreateDTO, UserAvatarUpdateDTO, UserAvatarResponseDTO, UserAvatarWithDetailsResponseDTO
from ...Core.Utils.xp_utils import calculate_xp_progression, reconcile_stored_level_with_xp, level_from_total_xp
from ...Core.Services.MoodService import MoodService, CooldownError
from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository
from ...Infrastructure.Repository.AvatarRepository import AvatarRepository

logger = logging.getLogger(__name__)
router = APIRouter()
userAvatarRepo = UserAvatarRepository()
avatarRepo = AvatarRepository()
moodService = MoodService(userAvatarRepo)

# Get all user avatars
@router.get("/", response_model=List[UserAvatarResponseDTO])
async def getAllUserAvatars():
    try:
        avatars = userAvatarRepo.fetchAllUserAvatars()
        return [UserAvatarResponseDTO(**avatar.__dict__) for avatar in avatars]
    except Exception as e:
        logger.error(f"Error fetching all user avatars: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get the active avatar for a specific user (includes avatar template details + GIF URLs)
@router.get("/user/{user_id}", response_model=UserAvatarWithDetailsResponseDTO)
async def getUserAvatar(user_id: int):
    try:
        user_avatar_entity = userAvatarRepo.fetchAvatarByUserId(user_id)
        if not user_avatar_entity:
            raise HTTPException(status_code=404, detail="User avatar not found")

        avatar_entity = avatarRepo.fetchAvatarById(user_avatar_entity.avatar_id)
        if not avatar_entity:
            raise HTTPException(status_code=404, detail="Avatar template not found")

        user_avatar_entity, canonical_level = reconcile_stored_level_with_xp(
            userAvatarRepo, user_avatar_entity
        )
        xp_progression = calculate_xp_progression(canonical_level, user_avatar_entity.xp)

        return UserAvatarWithDetailsResponseDTO(
            userAvatarId=user_avatar_entity.user_avatar_id,
            userId=user_avatar_entity.user_id,
            avatarId=user_avatar_entity.avatar_id,
            nickname=user_avatar_entity.nickname,
            level=canonical_level,
            xp=user_avatar_entity.xp,
            ageDays=user_avatar_entity.age_days,
            hungerLevel=user_avatar_entity.hunger_level,
            sleepinessLevel=user_avatar_entity.sleepiness_level,
            boredomeLevel=user_avatar_entity.boredome_level,
            happinessLevel=user_avatar_entity.happines_level,
            isActive=user_avatar_entity.is_active,
            lastUpdated=user_avatar_entity.last_updated,
            createdAt=user_avatar_entity.created_at,
            avatarName=avatar_entity.name,
            imageUrl=avatar_entity.image_url,
            animationIdleUrl=avatar_entity.animation_idle_url,
            animationActiveUrl=avatar_entity.animation_active_url,
            animationPostWorkoutUrl=avatar_entity.animation_post_workout_url,
            themeColor=avatar_entity.theme_color,
            evolutionNodeId=user_avatar_entity.evolution_node_id,
            evolutionStage=user_avatar_entity.evolution_stage,
            currentLevelXp=xp_progression['current_level_xp'],
            nextLevelXp=xp_progression['next_level_xp'],
            xpProgress=xp_progression['xp_progress']
        )
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
        # Total XP is the source of truth for level (keeps admin/DB edits consistent)
        avatar_dict["level"] = level_from_total_xp(avatar_dict.get("xp", 0))

        avatar = UserAvatarEntity(**avatar_dict)
        updated_avatar = userAvatarRepo.updateUserAvatar(avatar)
        return UserAvatarResponseDTO(**updated_avatar.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating avatar {avatar_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Feed the avatar (reduces hunger, boosts happiness)
@router.post("/user/{user_id}/feed", response_model=UserAvatarResponseDTO)
async def feedAvatar(user_id: int):
    try:
        updated_data = moodService.feed(user_id)
        return UserAvatarResponseDTO(**updated_data)
    except CooldownError as e:
        return JSONResponse(
            status_code=429,
            content={"detail": str(e), "remainingSeconds": e.remaining_seconds},
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error feeding avatar for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Rest the avatar (reduces sleepiness, boosts happiness)
@router.post("/user/{user_id}/rest", response_model=UserAvatarResponseDTO)
async def restAvatar(user_id: int):
    try:
        updated_data = moodService.rest(user_id)
        return UserAvatarResponseDTO(**updated_data)
    except CooldownError as e:
        return JSONResponse(
            status_code=429,
            content={"detail": str(e), "remainingSeconds": e.remaining_seconds},
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error resting avatar for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Delete a user avatar
@router.delete("/{avatar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteUserAvatar(avatar_id: int):
    try:
        userAvatarRepo.deleteUserAvatar(avatar_id)
    except Exception as e:
        logger.error(f"Error deleting user avatar {avatar_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
