from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.BadgeEntity import BadgeEntity
from ...Core.DTO.BadgeDTO import BadgeResponseDTO
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
@router.get("/user/{user_id}", response_model=List[dict])
async def getUserBadges(user_id: int):
    try:
        userBadges = userBadgeRepo.fetchBadgesByUserId(user_id)
        return [ub.__dict__ for ub in userBadges]
    except Exception as e:
        logger.error(f"Error fetching badges for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
