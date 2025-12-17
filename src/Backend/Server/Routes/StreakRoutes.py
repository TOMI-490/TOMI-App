from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.StreakEntity import StreakEntity
from ...Core.DTO.StreakDTO import StreakCreateDTO, StreakUpdateDTO, StreakResponseDTO
from ...Infrastructure.Repository.StreakRepository import StreakRepository

logger = logging.getLogger(__name__)
router = APIRouter()
streakRepo = StreakRepository()

# Get all streaks
@router.get("/", response_model=List[StreakResponseDTO])
async def getAllStreaks():
    try:
        streaks = streakRepo.fetchAllStreaks()
        return [StreakResponseDTO(**streak.__dict__) for streak in streaks]
    except Exception as e:
        logger.error(f"Error fetching all streaks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all active streaks for a user
@router.get("/user/{user_id}", response_model=List[StreakResponseDTO])
async def getUserStreaks(user_id: int):
    try:
        streaks = streakRepo.fetchStreaksByUserId(user_id)
        return [StreakResponseDTO(**streak.__dict__) for streak in streaks]
    except Exception as e:
        logger.error(f"Error fetching streaks for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific streak by ID
@router.get("/{streak_id}", response_model=StreakResponseDTO)
async def getStreak(streak_id: int):
    try:
        streak = streakRepo.fetchStreakById(streak_id)
        if not streak:
            raise HTTPException(status_code=404, detail="Streak not found")
        return StreakResponseDTO(**streak.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching streak {streak_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new streak tracker
@router.post("/", response_model=StreakResponseDTO, status_code=status.HTTP_201_CREATED)
async def createStreak(streak_data: StreakCreateDTO):
    try:
        streak = StreakEntity(**streak_data.model_dump())
        created_streak = streakRepo.createStreak(streak)
        return StreakResponseDTO(**created_streak.__dict__)
    except Exception as e:
        logger.error(f"Error creating streak: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update streak progress (increment days, etc.)
@router.put("/{streak_id}", response_model=StreakResponseDTO)
async def updateStreak(streak_id: int, streak_data: StreakUpdateDTO):
    try:
        existing_streak = streakRepo.fetchStreakById(streak_id)
        if not existing_streak:
            raise HTTPException(status_code=404, detail="Streak not found")
        
        update_data = streak_data.model_dump(exclude_unset=True)
        streak_dict = existing_streak.__dict__.copy()
        streak_dict.update(update_data)
        
        streak = StreakEntity(**streak_dict)
        updated_streak = streakRepo.updateStreak(streak)
        return StreakResponseDTO(**updated_streak.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating streak {streak_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a streak from tracking
@router.delete("/{streak_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteStreak(streak_id: int):
    try:
        streakRepo.deleteStreak(streak_id)
    except Exception as e:
        logger.error(f"Error deleting streak {streak_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
