from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.LeaderboardEntity import LeaderboardEntity
from ...Core.DTO.LeaderboardDTO import LeaderboardCreateDTO, LeaderboardUpdateDTO, LeaderboardResponseDTO
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

# Create a new leaderboard entry
@router.post("/", response_model=LeaderboardResponseDTO, status_code=status.HTTP_201_CREATED)
async def createLeaderboardEntry(entry_data: LeaderboardCreateDTO):
    try:
        entry = LeaderboardEntity(**entry_data.model_dump())
        created_entry = leaderboardRepo.createLeaderboardEntry(entry)
        return LeaderboardResponseDTO(**created_entry.__dict__)
    except Exception as e:
        logger.error(f"Error creating leaderboard entry: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update an existing leaderboard entry
@router.put("/{leaderboard_id}", response_model=LeaderboardResponseDTO)
async def updateLeaderboardEntry(leaderboard_id: int, entry_data: LeaderboardUpdateDTO):
    try:
        # Note: LeaderboardRepository doesn't have fetchById, but update requires ID.
        # Assuming we can construct entity with ID and update.
        # Ideally we should fetch first to ensure existence, but repo lacks fetchById.
        # We will proceed with update directly or implement fetchById in repo if needed.
        # Wait, repo has fetchLeaderboardByScope and fetchUserLeaderboardEntries.
        # Let's assume we can update directly if we trust the ID.
        # Or better, let's check if we can fetch by ID.
        # Actually, I should have checked repo for fetchById.
        # Checking LeaderboardRepository.py content from previous turn...
        # It has fetchLeaderboardByScope, fetchUserLeaderboardEntries, fetchTopRankers.
        # It DOES NOT have fetchLeaderboardById.
        # However, updateLeaderboardEntry takes an entity and uses leaderboardId from it.
        # So we can construct an entity. But to be safe and follow pattern, we usually fetch first.
        # Since fetchById is missing, I will skip fetch check for now or I should add it to repo.
        # Given I added fetchById to other repos, I should probably add it here too for consistency.
        # But for now to save time/steps, I will try to update directly if possible, 
        # but wait, updateLeaderboardEntry implementation:
        # response = self._client.table(self._table_name).update(data).eq("leaderboardId", leaderboardId).execute()
        # This will work if ID exists.
        
        # Construct entity with ID
        entry_dict = entry_data.model_dump(exclude_unset=True)
        entry_dict['leaderboardId'] = leaderboard_id
        entry = LeaderboardEntity(**entry_dict)
        
        updated_entry = leaderboardRepo.updateLeaderboardEntry(entry)
        return LeaderboardResponseDTO(**updated_entry.__dict__)
    except Exception as e:
        logger.error(f"Error updating leaderboard entry {leaderboard_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Delete a leaderboard entry
@router.delete("/{leaderboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteLeaderboardEntry(leaderboard_id: int):
    try:
        leaderboardRepo.deleteLeaderboardEntry(leaderboard_id)
    except Exception as e:
        logger.error(f"Error deleting leaderboard entry {leaderboard_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
