from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.LeaderboardEntity import LeaderboardEntity
from ...Core.DTO.LeaderboardDTO import LeaderboardResponseDTO
from ...Infrastructure.Repository.LeaderboardRepository import LeaderboardRepository

logger = logging.getLogger(__name__)
router = APIRouter()
leaderboardRepo = LeaderboardRepository()

# Get leaderboard rankings by scope (global, friends, etc.)
@router.get("/", response_model=List[LeaderboardResponseDTO])
async def getLeaderboard(scope: str = "global", limit: int = 100):
    try:
        entries = leaderboardRepo.fetchLeaderboardByScope(scope)[:limit]
        return [LeaderboardResponseDTO(**entry.__dict__) for entry in entries]
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all leaderboard entries for a specific user
@router.get("/user/{user_id}", response_model=List[LeaderboardResponseDTO])
async def getUserLeaderboardEntries(user_id: int):
    try:
        entries = leaderboardRepo.fetchUserLeaderboardEntries(user_id)
        return [LeaderboardResponseDTO(**entry.__dict__) for entry in entries]
    except Exception as e:
        logger.error(f"Error fetching leaderboard entries for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
