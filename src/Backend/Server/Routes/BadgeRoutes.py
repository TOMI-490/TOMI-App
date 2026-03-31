from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.BadgeEntity import BadgeEntity
from ...Core.Entity.UserBadge import UserBadgeEntity
from ...Core.DTO.BadgeDTO import BadgeCreateDTO, BadgeUpdateDTO, BadgeResponseDTO
from ...Core.DTO.UserBadgeDTO import UserBadgeCreateDTO, UserBadgeUpdateDTO, UserBadgeResponseDTO
from ...Infrastructure.Repository.BadgeRepository import BadgeRepository
from ...Infrastructure.Repository.UserBadgeRepository import UserBadgeRepository

logger = logging.getLogger(__name__)
router = APIRouter()
badgeRepo = BadgeRepository()
userBadgeRepo = UserBadgeRepository()

# Get all available achievement badges
@router.get("/", response_model=List[BadgeResponseDTO])
async def getAllBadges():
    try:
        badges = badgeRepo.fetchAllBadges()
        return [BadgeResponseDTO(**badge.__dict__) for badge in badges]
    except Exception as e:
        logger.error(f"Error fetching badges: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific badge by ID
@router.get("/{badge_id}", response_model=BadgeResponseDTO)
async def getBadge(badge_id: int):
    try:
        badge = badgeRepo.fetchBadgeById(badge_id)
        if not badge:
            raise HTTPException(status_code=404, detail="Badge not found")
        return BadgeResponseDTO(**badge.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching badge {badge_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all badges earned by a specific user
@router.get("/user/{user_id}", response_model=List[UserBadgeResponseDTO])
async def getUserBadges(user_id: int):
    try:
        userBadges = userBadgeRepo.fetchBadgesByUserId(user_id)
        return [UserBadgeResponseDTO(**ub.__dict__) for ub in userBadges]
    except Exception as e:
        logger.error(f"Error fetching badges for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Award a badge to a user
@router.post("/user/award", response_model=UserBadgeResponseDTO, status_code=status.HTTP_201_CREATED)
async def awardBadge(user_badge_data: UserBadgeCreateDTO):
    try:
        user_badge = UserBadgeEntity(**user_badge_data.model_dump())
        awarded_badge = userBadgeRepo.awardBadge(user_badge)
        return UserBadgeResponseDTO(**awarded_badge.__dict__)
    except Exception as e:
        logger.error(f"Error awarding badge: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an awarded badge
@router.put("/user/award/{user_badge_id}", response_model=UserBadgeResponseDTO)
async def updateAwardedBadge(user_badge_id: int, user_badge_data: UserBadgeUpdateDTO):
    try:
        # Note: UserBadgeRepository doesn't have fetchById, but update requires ID.
        # We will construct entity with ID and update.
        # Ideally we should fetch first.
        # Assuming updateBadge handles check or fails if not found.
        
        update_data = user_badge_data.model_dump(exclude_unset=True)
        # We need to construct the entity. Since we don't have the full entity, 
        # we rely on the repo to handle partial update or we need to fetch it first.
        # But repo lacks fetchById. 
        # I will assume for now we can just pass the ID and data to update.
        # But UserBadgeEntity requires all fields usually.
        # Let's check UserBadgeEntity.
        # I'll assume I can create a partial entity or the repo handles it.
        # Actually, repo updateBadge:
        # data = self.entityToData(user_badge)
        # response = self._client.table(self._table_name).update(data).eq("id", userBadgeId).execute()
        # So if I pass an entity with only ID and updated fields, it might work if entityToData handles it.
        # But Entity constructor might fail if required fields are missing.
        # I should probably add fetchUserBadgeById to UserBadgeRepository.
        # But for now, I will try to proceed.
        # Wait, I should add fetchUserBadgeById to UserBadgeRepository to be safe.
        
        # Let's assume I added it (I will add it next).
        existing_user_badge = userBadgeRepo.fetchUserBadgeById(user_badge_id)
        if not existing_user_badge:
            raise HTTPException(status_code=404, detail="User badge not found")
            
        badge_dict = existing_user_badge.__dict__.copy()
        badge_dict.update(update_data)
        
        user_badge = UserBadgeEntity(**badge_dict)
        updated_badge = userBadgeRepo.updateBadge(user_badge)
        return UserBadgeResponseDTO(**updated_badge.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating awarded badge {user_badge_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Remove an awarded badge
@router.delete("/user/award/{user_badge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteAwardedBadge(user_badge_id: int):
    try:
        userBadgeRepo.deleteBadge(user_badge_id)
    except Exception as e:
        logger.error(f"Error deleting awarded badge {user_badge_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new badge
@router.post("/", response_model=BadgeResponseDTO, status_code=status.HTTP_201_CREATED)
async def createBadge(badge_data: BadgeCreateDTO):
    try:
        badge = BadgeEntity(**badge_data.model_dump())
        created_badge = badgeRepo.createBadge(badge)
        return BadgeResponseDTO(**created_badge.__dict__)
    except Exception as e:
        logger.error(f"Error creating badge: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing badge
@router.put("/{badge_id}", response_model=BadgeResponseDTO)
async def updateBadge(badge_id: int, badge_data: BadgeUpdateDTO):
    try:
        existing_badge = badgeRepo.fetchBadgeById(badge_id)
        if not existing_badge:
            raise HTTPException(status_code=404, detail="Badge not found")
        
        update_data = badge_data.model_dump(exclude_unset=True)
        badge_dict = existing_badge.__dict__.copy()
        badge_dict.update(update_data)
        
        badge = BadgeEntity(**badge_dict)
        updated_badge = badgeRepo.updateBadge(badge)
        return BadgeResponseDTO(**updated_badge.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating badge {badge_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a badge
@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteBadge(badge_id: int):
    try:
        badgeRepo.deleteBadge(badge_id)
    except Exception as e:
        logger.error(f"Error deleting badge {badge_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
