from fastapi import APIRouter, HTTPException, status, Query
from typing import List
import logging

from ...Core.DTO.CommunityDTO import (
    UserSearchResultDTO,
    FriendListItemDTO,
    FriendRequestsResponseDTO,
    CreateFriendRequestDTO,
    LeaderboardResponseDTO,
    FriendVisitProfileDTO,
    FriendStatsDTO,
    FriendRecentWorkoutsDTO,
    FriendDashboardSummaryDTO,
)
from ...Core.Services.FriendshipService import FriendshipService
from ...Core.Services.UserService import UserService
from ...Core.Services.LeaderboardService import LeaderboardService
from ...Core.Services.FriendProfileService import FriendProfileService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
friendship_service = FriendshipService()
user_service = UserService()
leaderboard_service = LeaderboardService()
friend_profile_service = FriendProfileService()


# 1. List friends
@router.get("/friends", response_model=List[FriendListItemDTO])
async def get_friends(user_id: int = Query(..., description="Current user ID")):
    try:
        return friendship_service.get_friends_list(user_id)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching friends for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 2. Get friend requests (incoming and outgoing)
@router.get("/friend-requests", response_model=FriendRequestsResponseDTO)
async def get_friend_requests(user_id: int = Query(..., description="Current user ID")):
    try:
        return friendship_service.get_friend_requests(user_id)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching friend requests for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 3. Search users
@router.get("/users/search", response_model=List[UserSearchResultDTO])
async def search_users(
    q: str = Query(..., min_length=1, description="Search query"),
    user_id: int = Query(..., description="Current user ID")
):
    try:
        return user_service.search_users(q, user_id)
    except Exception as e:
        logger.error(f"Error searching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4. Send friend request
@router.post("/friend-requests", status_code=status.HTTP_201_CREATED)
async def send_friend_request(
    user_id: int = Query(..., description="Current user ID"),
    request_data: CreateFriendRequestDTO = None
):
    try:
        if not request_data:
            raise HTTPException(status_code=400, detail="Request body is required")
        
        result = friendship_service.send_friend_request(user_id, request_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error sending friend request: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# 5. Accept friend request
@router.post("/friend-requests/{request_id}/accept")
async def accept_friend_request(
    request_id: int,
    user_id: int = Query(..., description="Current user ID")
):
    try:
        result = friendship_service.accept_friend_request(request_id, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error accepting friend request {request_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# 6. Decline friend request
@router.post("/friend-requests/{request_id}/decline")
async def decline_friend_request(
    request_id: int,
    user_id: int = Query(..., description="Current user ID")
):
    try:
        result = friendship_service.decline_friend_request(request_id, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error declining friend request {request_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# 7. Cancel outgoing friend request
@router.post("/friend-requests/{request_id}/cancel")
async def cancel_friend_request(
    request_id: int,
    user_id: int = Query(..., description="Current user ID")
):
    try:
        result = friendship_service.cancel_friend_request(request_id, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error cancelling friend request {request_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# 8. Get leaderboard
@router.get("/leaderboard", response_model=LeaderboardResponseDTO)
async def get_leaderboard(
    user_id: int = Query(..., description="Current user ID"),
    scope: str = Query("friends", regex="^(friends|global)$"),
    period: str = Query("week", regex="^(week|month)$")
):
    try:
        return leaderboard_service.get_leaderboard(user_id, scope, period)
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 9. Get friend profile (for visit)
@router.get("/friends/{friend_id}/profile", response_model=FriendVisitProfileDTO)
async def get_friend_profile(
    friend_id: int,
    user_id: int = Query(..., description="Current user ID")
):
    try:
        return friend_profile_service.get_friend_profile(friend_id, user_id)
    except ValueError as e:
        status_code = 403 if "Not friends" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting friend profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 10. Get friend stats summary
@router.get("/friends/{friend_id}/stats", response_model=FriendStatsDTO)
async def get_friend_stats(
    friend_id: int,
    user_id: int = Query(..., description="Current user ID"),
    range: str = Query("week", description="Time range: 'week' or 'month'")
):
    try:
        return friend_profile_service.get_friend_stats(friend_id, user_id, range)
    except ValueError as e:
        status_code = 403 if "Not friends" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting friend stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 11. Get friend recent workouts
@router.get("/friends/{friend_id}/workouts", response_model=FriendRecentWorkoutsDTO)
async def get_friend_recent_workouts(
    friend_id: int,
    user_id: int = Query(..., description="Current user ID"),
    limit: int = Query(5, description="Number of workouts to return", gt=0, le=20)
):
    try:
        return friend_profile_service.get_friend_recent_workouts(friend_id, user_id, limit)
    except ValueError as e:
        status_code = 403 if "Not friends" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting friend recent workouts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 12. Remove friend (delete friendship)
@router.delete("/friends/{friend_id}")
async def remove_friend(
    friend_id: int,
    user_id: int = Query(..., description="Current user ID")
):
    try:
        result = friendship_service.remove_friend(friend_id, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error removing friend: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 13. Get friend dashboard summary (for friend visit page)
@router.get("/friends/{friend_id}/dashboard-summary", response_model=FriendDashboardSummaryDTO)
async def get_friend_dashboard_summary(
    friend_id: int,
    user_id: int = Query(..., description="Current user ID viewing the friend")
):
    try:
        return friend_profile_service.get_friend_dashboard_summary(friend_id, user_id)
    except ValueError as e:
        status_code = 403 if "Not friends" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting friend dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))