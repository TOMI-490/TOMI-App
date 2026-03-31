from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.DTO.StreakDTO import StreakResponseDTO, StreakCreateDTO, StreakUpdateDTO, UserStreakDTO
from ...Core.Services.StreakService import StreakService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
streak_service = StreakService()

# Get all streaks
@router.get("/", response_model=List[StreakResponseDTO])
async def getAllStreaks():
    try:
        return streak_service.get_all_streaks()
    except Exception as e:
        logger.error(f"Error fetching all streaks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific streak
@router.get("/{streak_id}", response_model=StreakResponseDTO)
async def getStreakById(streak_id: int):
    try:
        return streak_service.get_streak_by_id(streak_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching streak {streak_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all streaks for a user
@router.get("/user/{user_id}", response_model=List[UserStreakDTO])
async def getUserStreaks(user_id: int):
    try:
        return streak_service.get_user_streaks(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching streaks for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get current streak for a user by type
@router.get("/user/{user_id}/current")
async def getCurrentUserStreak(user_id: int, streak_type: str = "workout"):
    try:
        streak = streak_service.get_current_user_streak(user_id, streak_type)
        if not streak:
            raise HTTPException(status_code=404, detail=f"No {streak_type} streak found for user")
        return streak
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching current streak for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create a new streak
@router.post("/", response_model=StreakResponseDTO, status_code=status.HTTP_201_CREATED)
async def createStreak(streak: StreakCreateDTO):
    try:
        return streak_service.create_streak(streak)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating streak: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update a streak
@router.put("/{streak_id}", response_model=StreakResponseDTO)
async def updateStreak(streak_id: int, streak: StreakUpdateDTO):
    try:
        return streak_service.update_streak(streak_id, streak)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating streak {streak_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a streak
@router.delete("/{streak_id}")
async def deleteStreak(streak_id: int):
    try:
        return streak_service.delete_streak(streak_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting streak {streak_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Increment workout streak (called after workout completion)
@router.post("/user/{user_id}/increment", response_model=UserStreakDTO)
async def incrementWorkoutStreak(user_id: int):
    try:
        return streak_service.increment_workout_streak(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error incrementing workout streak for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Check and break inactive streaks
@router.post("/user/{user_id}/check")
async def checkAndBreakStreaks(user_id: int):
    try:
        broken_streaks = streak_service.check_and_break_streaks(user_id)
        return {"brokenStreaks": broken_streaks}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error checking streaks for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
